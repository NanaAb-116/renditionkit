import assert from "node:assert/strict";
import test from "node:test";
import { MediaRejectedError, type ReadyAsset } from "@renditionkit/core";
import { Pool } from "pg";
import {
  migratePostgresRepository,
  PostgresAssetRepository,
} from "../src/index.js";

const connectionString = process.env.RENDITIONKIT_POSTGRES_URL;

const ready = (checksum: string): ReadyAsset => ({
  checksum,
  sourceBytes: 10,
  sourceContentType: "image/jpeg",
  inspection: { contentType: "image/jpeg", width: 10, height: 10 },
  renditions: [
    {
      name: "w10",
      extension: "webp",
      contentType: "image/webp",
      key: "renditions/w10.webp",
      bytes: 5,
      width: 10,
      height: 10,
    },
  ],
  renditionVersion: 1,
});

test(
  "persists lifecycle, arbitrates duplicate races, and reaps stalls",
  { skip: !connectionString },
  async () => {
    const pool = new Pool({ connectionString });
    try {
      await migratePostgresRepository(pool);
      await pool.query("truncate renditionkit_assets");
      const repository = new PostgresAssetRepository(pool);
      const first = await repository.create({
        id: "first",
        namespace: "tenant",
        mediaType: "image",
        sourceKey: "originals/first",
      });
      const second = await repository.create({
        id: "second",
        namespace: "tenant",
        mediaType: "image",
        sourceKey: "originals/second",
      });
      await Promise.all([
        repository.markProcessing(first, { attempt: 1, startedAt: new Date() }),
        repository.markProcessing(second, {
          attempt: 1,
          startedAt: new Date(),
        }),
      ]);

      const outcomes = await Promise.allSettled([
        repository.markReady(first, ready("a".repeat(64)), {
          attempt: 1,
          startedAt: new Date(),
        }),
        repository.markReady(second, ready("a".repeat(64)), {
          attempt: 1,
          startedAt: new Date(),
        }),
      ]);
      assert.equal(
        outcomes.filter((result) => result.status === "fulfilled").length,
        1,
      );
      const rejected = outcomes.find((result) => result.status === "rejected");
      assert.ok(rejected?.status === "rejected");
      assert.ok(rejected.reason instanceof MediaRejectedError);
      assert.equal(rejected.reason.rejection.code, "duplicate");

      const readyId = outcomes[0]?.status === "fulfilled" ? "first" : "second";
      const readyRecord = await repository.get(readyId);
      assert.ok(readyRecord);
      assert.equal(
        await repository.markProcessing(readyRecord, {
          attempt: 2,
          startedAt: new Date(),
          jobId: "late-replay",
        }),
        false,
      );
      assert.equal((await repository.getRecord(readyId))?.status, "ready");

      const stalled = await repository.create({
        id: "stalled",
        mediaType: "image",
        sourceKey: "originals/stalled",
      });
      await repository.markProcessing(stalled, {
        attempt: 1,
        startedAt: new Date(Date.now() - 60_000),
      });
      assert.equal(
        await repository.reapStalled(new Date(Date.now() - 30_000)),
        1,
      );
      assert.equal((await repository.getRecord("stalled"))?.status, "failed");
    } finally {
      await pool.query("truncate renditionkit_assets").catch(() => undefined);
      await pool.end();
    }
  },
);
