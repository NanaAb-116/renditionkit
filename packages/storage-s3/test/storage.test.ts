import assert from "node:assert/strict";
import test from "node:test";
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createS3Storage } from "../src/index.js";

test("prefixes keys and maps get, put, and delete operations", async () => {
  const commands: unknown[] = [];
  const client = {
    async send(command: unknown) {
      commands.push(command);
      if (command instanceof GetObjectCommand) {
        return {
          ContentType: "image/webp",
          Body: {
            async transformToByteArray() {
              return Uint8Array.from([1, 2, 3]);
            },
            async *[Symbol.asyncIterator]() {
              yield Uint8Array.from([1, 2]);
              yield Uint8Array.from([3]);
            },
          },
        };
      }
      return {};
    },
  } as unknown as S3Client;
  const storage = createS3Storage({
    client,
    bucket: "media",
    keyPrefix: "/prod/",
  });

  const fetched = await storage.get("original.jpg");
  const streamed = await storage.stream!("video.mp4");
  const chunks: number[] = [];
  for await (const chunk of streamed.body) chunks.push(...chunk);
  await storage.put({
    key: "/renditions/one.webp",
    body: Uint8Array.from([4, 5]),
    contentType: "image/webp",
    cacheControl: "immutable",
  });
  await storage.delete!("old.webp");

  assert.deepEqual([...fetched.body], [1, 2, 3]);
  assert.deepEqual(chunks, [1, 2, 3]);
  assert.equal(fetched.contentType, "image/webp");
  assert.equal(
    (commands[0] as GetObjectCommand).input.Key,
    "prod/original.jpg",
  );
  assert.equal((commands[1] as GetObjectCommand).input.Key, "prod/video.mp4");
  assert.equal(
    (commands[2] as PutObjectCommand).input.Key,
    "prod/renditions/one.webp",
  );
  assert.equal((commands[3] as DeleteObjectCommand).input.Key, "prod/old.webp");
});

const endpoint = process.env.RENDITIONKIT_S3_ENDPOINT;

test(
  "round-trips buffered and streamed objects against S3-compatible storage",
  { skip: !endpoint },
  async () => {
    assert.ok(endpoint);
    const client = new S3Client({
      endpoint,
      region: process.env.RENDITIONKIT_S3_REGION ?? "us-east-1",
      forcePathStyle: true,
      credentials: {
        accessKeyId:
          process.env.RENDITIONKIT_S3_ACCESS_KEY_ID ?? "renditionkit",
        secretAccessKey:
          process.env.RENDITIONKIT_S3_SECRET_ACCESS_KEY ??
          "renditionkit-dev-secret",
      },
    });
    const bucket = `renditionkit-test-${Date.now()}-${process.pid}`;
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
    const storage = createS3Storage({ client, bucket, keyPrefix: "test" });

    try {
      await storage.put({
        key: "original.bin",
        body: Uint8Array.from([5, 4, 3, 2, 1]),
        contentType: "application/octet-stream",
        cacheControl: "private, max-age=0",
      });
      const buffered = await storage.get("original.bin");
      assert.deepEqual([...buffered.body], [5, 4, 3, 2, 1]);
      assert.equal(buffered.contentType, "application/octet-stream");

      const streamed = await storage.stream!("original.bin");
      const chunks: number[] = [];
      for await (const chunk of streamed.body) chunks.push(...chunk);
      assert.deepEqual(chunks, [5, 4, 3, 2, 1]);

      await storage.delete!("original.bin");
      await assert.rejects(storage.get("original.bin"));
    } finally {
      await client
        .send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: "test/original.bin",
          }),
        )
        .catch(() => undefined);
      await client
        .send(new DeleteBucketCommand({ Bucket: bucket }))
        .catch(() => undefined);
      client.destroy();
    }
  },
);
