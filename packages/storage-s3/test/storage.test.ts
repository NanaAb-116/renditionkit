import assert from "node:assert/strict";
import test from "node:test";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
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
