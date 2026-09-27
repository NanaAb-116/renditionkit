import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultRenditionKey,
  MediaRejectedError,
  processMediaAsset,
  type AssetRepository,
  type MediaAsset,
  type MediaRuntime,
  type ObjectStorage,
  type ReadyAsset,
  type Rejection,
} from "../src/index.js";

test("default keys cannot contain traversal segments", () => {
  const key = defaultRenditionKey(
    { id: "..", mediaType: ".", sourceKey: "source", namespace: "" },
    {
      mediaType: "image",
      renditionVersion: 1,
      async prepare() {
        return {
          checksum: "a".repeat(64),
          sourceBytes: 1,
          inspection: { contentType: "image/jpeg" },
          async transform() {
            return {};
          },
        };
      },
    },
    {
      name: "..",
      extension: ".",
      contentType: "application/octet-stream",
      body: new Uint8Array(),
    },
  );
  assert.equal(key, "renditions/default/_2E/_2E_2E/v1/_2E_2E._2E");
  assert.equal(key.split("/").includes(".."), false);
});

function fixture(overrides: Partial<MediaRuntime> = {}) {
  const asset: MediaAsset = {
    id: "asset/1",
    mediaType: "test",
    sourceKey: "originals/1",
    namespace: "tenant-a",
  };
  let ready: ReadyAsset | undefined;
  let rejected: Rejection | undefined;
  let processing = 0;
  const objects = new Map<string, Uint8Array>([
    [asset.sourceKey, Buffer.from("source")],
  ]);

  const repository: AssetRepository = {
    async get(id) {
      return id === asset.id ? asset : null;
    },
    async markProcessing() {
      processing += 1;
    },
    async markReady(_asset, value) {
      ready = value;
    },
    async markRejected(_asset, value) {
      rejected = value;
    },
    async markFailed() {},
  };
  const storage: ObjectStorage = {
    async get(key) {
      const body = objects.get(key);
      if (!body) throw new Error("missing");
      return { body };
    },
    async put(input) {
      objects.set(input.key, input.body);
    },
    async delete(key) {
      objects.delete(key);
    },
  };
  const runtime: MediaRuntime = {
    repository,
    storage,
    engines: [
      {
        mediaType: "test",
        renditionVersion: 3,
        async prepare(_asset, source) {
          const input = await source.read();
          return {
            checksum: "a".repeat(64),
            sourceBytes: input.body.byteLength,
            inspection: { contentType: "application/octet-stream" },
            async transform(emit) {
              await emit({
                name: "small",
                extension: "bin",
                contentType: "application/octet-stream",
                body: Buffer.from("result"),
              });
              return { metadata: { transformed: true } };
            },
          };
        },
      },
    ],
    ...overrides,
  };
  return {
    asset,
    runtime,
    objects,
    get ready() {
      return ready;
    },
    get rejected() {
      return rejected;
    },
    get processing() {
      return processing;
    },
  };
}

test("processes and stores a deterministic rendition", async () => {
  const f = fixture();
  const result = await processMediaAsset({ assetId: f.asset.id }, f.runtime);

  assert.equal(result.status, "ready");
  assert.equal(f.processing, 1);
  assert.equal(f.ready?.renditionVersion, 3);
  assert.equal(f.ready?.renditions.length, 1);
  assert.equal(
    f.ready?.renditions[0]?.key,
    "renditions/tenant-a/test/asset_2F1/v3/small.bin",
  );
  assert.equal(f.ready?.checksum.length, 64);
});

test("turns permanent engine errors into a rejection without throwing", async () => {
  const f = fixture({
    engines: [
      {
        mediaType: "test",
        renditionVersion: 1,
        async prepare() {
          throw new MediaRejectedError("bad_input", "The input is invalid.");
        },
      },
    ],
  });

  const result = await processMediaAsset({ assetId: f.asset.id }, f.runtime);
  assert.equal(result.status, "rejected");
  assert.equal(f.rejected?.code, "bad_input");
});

test("keeps deterministic partial renditions for a transient retry", async () => {
  const f = fixture({
    engines: [
      {
        mediaType: "test",
        renditionVersion: 1,
        async prepare() {
          return {
            checksum: "a".repeat(64),
            sourceBytes: 6,
            inspection: { contentType: "application/octet-stream" },
            async transform(emit) {
              await emit({
                name: "partial",
                extension: "bin",
                contentType: "application/octet-stream",
                body: Buffer.from("partial"),
              });
              throw new Error("storage disappeared");
            },
          };
        },
      },
    ],
  });

  await assert.rejects(
    processMediaAsset({ assetId: f.asset.id }, f.runtime),
    /storage disappeared/,
  );
  assert.equal(
    [...f.objects.keys()].some((key) => key.includes("partial")),
    true,
  );
});

test("disposes engine-owned resources after a terminal outcome", async () => {
  let disposed = 0;
  const f = fixture({
    engines: [
      {
        mediaType: "test",
        renditionVersion: 1,
        async prepare() {
          return {
            checksum: "a".repeat(64),
            sourceBytes: 6,
            inspection: { contentType: "application/octet-stream" },
            async transform() {
              throw new MediaRejectedError("policy", "Rejected by policy.");
            },
            async dispose() {
              disposed += 1;
            },
          };
        },
      },
    ],
  });

  const result = await processMediaAsset({ assetId: f.asset.id }, f.runtime);
  assert.equal(result.status, "rejected");
  assert.equal(disposed, 1);
});
