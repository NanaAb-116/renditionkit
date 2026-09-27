import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { MediaRejectedError } from "@renditionkit/core";
import { createImageEngine, widthsForSource } from "../src/index.js";

test("adds a capped source-width rung without upscaling", () => {
  assert.deepEqual(
    widthsForSource(1200, [400, 800, 1600, 2400]),
    [400, 800, 1200],
  );
  assert.deepEqual(widthsForSource(300, [400, 800, 1600, 2400]), [300]);
  assert.deepEqual(
    widthsForSource(4000, [400, 800, 1600, 2400]),
    [400, 800, 1600, 2400],
  );
});

test("inspects once and emits AVIF and WebP ladders", async () => {
  const source = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#8b5cf6" },
  })
    .jpeg()
    .toBuffer();
  const engine = createImageEngine();
  const asset = {
    id: "one",
    mediaType: "image",
    sourceKey: "one.jpg",
  };
  const prepared = await engine.prepare(asset, {
    key: asset.sourceKey,
    async read() {
      return { body: source };
    },
  });
  const inspection = prepared.inspection;
  const emitted: Array<{ name: string; contentType: string; width?: number }> =
    [];
  const result = await prepared.transform(async (output) => {
    emitted.push(output);
    return {
      name: output.name,
      extension: output.extension,
      contentType: output.contentType,
      key: output.name,
      bytes: output.body.byteLength,
      ...(output.width === undefined ? {} : { width: output.width }),
      ...(output.height === undefined ? {} : { height: output.height }),
    };
  });

  assert.equal(inspection.width, 1200);
  assert.equal(inspection.height, 800);
  assert.equal(emitted.length, 6);
  assert.deepEqual(
    emitted.map((item) => `${item.name}:${item.contentType}`),
    [
      "w400:image/avif",
      "w400:image/webp",
      "w800:image/avif",
      "w800:image/webp",
      "w1200:image/avif",
      "w1200:image/webp",
    ],
  );
  assert.equal(typeof result.metadata?.thumbhash, "string");
});

test("rejects a file with a JPEG header but truncated body", async () => {
  const source = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#111827" },
  })
    .jpeg()
    .toBuffer();
  const truncated = source.subarray(0, Math.floor(source.length * 0.35));
  const engine = createImageEngine();

  await assert.rejects(
    engine.prepare(
      { id: "bad", mediaType: "image", sourceKey: "bad.jpg" },
      {
        key: "bad.jpg",
        async read() {
          return { body: truncated };
        },
      },
    ),
    (error: unknown) =>
      error instanceof MediaRejectedError &&
      error.rejection.code === "invalid_image",
  );
});

test("reports display dimensions after applying EXIF orientation", async () => {
  const source = await sharp({
    create: { width: 30, height: 20, channels: 3, background: "#22c55e" },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  const engine = createImageEngine({ widths: [10], formats: ["webp"] });
  const prepared = await engine.prepare(
    { id: "oriented", mediaType: "image", sourceKey: "oriented.jpg" },
    {
      key: "oriented.jpg",
      async read() {
        return { body: source };
      },
    },
  );

  assert.equal(prepared.inspection.width, 20);
  assert.equal(prepared.inspection.height, 30);
  assert.equal(prepared.inspection.metadata?.orientation, 6);
});

test("rejects inputs exceeding the configured pixel limit", async () => {
  const source = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#ef4444" },
  })
    .png()
    .toBuffer();
  const engine = createImageEngine({ maxInputPixels: 100 });

  await assert.rejects(
    engine.prepare(
      { id: "large", mediaType: "image", sourceKey: "large.png" },
      {
        key: "large.png",
        async read() {
          return { body: source };
        },
      },
    ),
    (error: unknown) =>
      error instanceof MediaRejectedError &&
      error.rejection.code === "invalid_image",
  );
});
