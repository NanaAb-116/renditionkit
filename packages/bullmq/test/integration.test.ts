import assert from "node:assert/strict";
import test from "node:test";
import type {
  AssetRepository,
  MediaAsset,
  MediaRuntime,
  ProcessingFailure,
} from "@renditionkit/core";
import { createMediaQueue, createMediaWorker } from "../src/index.js";

const redisPort = process.env.RENDITIONKIT_REDIS_PORT;

async function eventually(
  check: () => Promise<boolean>,
  timeoutMs = 5_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for the integration condition.");
}

test(
  "processes, deduplicates, retries, and dead-letters against Redis",
  { skip: !redisPort },
  async () => {
    const suffix = `${process.pid}-${Date.now()}`;
    const queueName = `renditionkit-test-${suffix}`;
    const connection = { host: "127.0.0.1", port: Number(redisPort), db: 15 };
    const assets = new Map<string, MediaAsset>([
      ["good", { id: "good", mediaType: "test", sourceKey: "good-source" }],
      ["bad", { id: "bad", mediaType: "test", sourceKey: "bad-source" }],
    ]);
    const objects = new Map<string, Uint8Array>([
      ["good-source", Buffer.from("good")],
      ["bad-source", Buffer.from("bad")],
    ]);
    let goodReady = false;
    let badFailure: ProcessingFailure | undefined;
    const repository: AssetRepository = {
      async get(id) {
        return assets.get(id) ?? null;
      },
      async markProcessing() {},
      async markReady(asset) {
        if (asset.id === "good") goodReady = true;
      },
      async markRejected() {},
      async markFailed(id, failure) {
        if (id === "bad") badFailure = failure;
      },
    };
    const runtime: MediaRuntime = {
      repository,
      storage: {
        async get(key) {
          return { body: objects.get(key)! };
        },
        async put(input) {
          objects.set(input.key, input.body);
        },
      },
      engines: [
        {
          mediaType: "test",
          renditionVersion: 1,
          async prepare(asset, source) {
            if (asset.id === "bad") throw new Error("transient test failure");
            const input = await source.read();
            return {
              checksum: "a".repeat(64),
              sourceBytes: input.body.byteLength,
              inspection: { contentType: "application/octet-stream" },
              async transform(emit) {
                await emit({
                  name: "copy",
                  extension: "bin",
                  contentType: "application/octet-stream",
                  body: Buffer.from("rendition"),
                });
                return {};
              },
            };
          },
        },
      ],
    };

    const queue = createMediaQueue({
      connection,
      queueName,
      defaultJobOptions: { attempts: 2, backoff: { type: "fixed", delay: 25 } },
    });
    const concurrent = await Promise.all(
      Array.from({ length: 10 }, () => queue.enqueue("good")),
    );
    assert.equal(concurrent.filter((result) => result.created).length, 1);
    const worker = createMediaWorker({
      connection,
      queueName,
      runtime,
      stallSweep: false,
    });

    try {
      const duplicate = await queue.enqueue("good");
      assert.equal(duplicate.created, false);
      await queue.enqueue("bad");

      await eventually(async () => goodReady);
      await eventually(async () => badFailure !== undefined);
      await eventually(
        async () => (await worker.deadLetterQueue.getWaitingCount()) === 1,
      );

      assert.equal(badFailure?.attempts, 2);
      assert.equal(
        [...objects.keys()].some((key) => key.endsWith("/copy.bin")),
        true,
      );
    } finally {
      await worker.worker.close();
      await queue.queue.obliterate({ force: true });
      await worker.deadLetterQueue.obliterate({ force: true });
      await Promise.all([queue.close(), worker.deadLetterQueue.close()]);
    }
  },
);
