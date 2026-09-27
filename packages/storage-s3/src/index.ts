import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import type { ObjectStorage } from "@renditionkit/core";

export interface S3StorageOptions {
  client: S3Client;
  bucket: string;
  /** Optional folder shared by every original and rendition key. */
  keyPrefix?: string;
}

function normalisePrefix(prefix: string | undefined): string {
  return prefix?.replace(/^\/+|\/+$/g, "") ?? "";
}

function keyWithPrefix(prefix: string, key: string): string {
  const clean = key.replace(/^\/+/, "");
  return prefix ? `${prefix}/${clean}` : clean;
}

/** Create an adapter for AWS S3 and compatible APIs such as R2 and MinIO. */
export function createS3Storage(options: S3StorageOptions): ObjectStorage {
  if (!options.bucket.trim()) throw new Error("S3 bucket must not be empty.");
  const prefix = normalisePrefix(options.keyPrefix);

  return {
    async get(key) {
      const result = await options.client.send(
        new GetObjectCommand({
          Bucket: options.bucket,
          Key: keyWithPrefix(prefix, key),
        }),
      );
      if (!result.Body)
        throw new Error(`S3 object \"${key}\" returned an empty body.`);
      const body = await result.Body.transformToByteArray();
      return {
        body,
        ...(result.ContentType === undefined
          ? {}
          : { contentType: result.ContentType }),
      };
    },

    async stream(key) {
      const result = await options.client.send(
        new GetObjectCommand({
          Bucket: options.bucket,
          Key: keyWithPrefix(prefix, key),
        }),
      );
      if (!result.Body || !(Symbol.asyncIterator in result.Body)) {
        throw new Error(
          `S3 object \"${key}\" did not return a streamable body.`,
        );
      }
      return {
        body: result.Body as AsyncIterable<Uint8Array>,
        ...(result.ContentType === undefined
          ? {}
          : { contentType: result.ContentType }),
        ...(result.ContentLength === undefined
          ? {}
          : { contentLength: result.ContentLength }),
      };
    },

    async put(input) {
      await options.client.send(
        new PutObjectCommand({
          Bucket: options.bucket,
          Key: keyWithPrefix(prefix, input.key),
          Body: input.body,
          ContentType: input.contentType,
          ...(input.cacheControl === undefined
            ? {}
            : { CacheControl: input.cacheControl }),
          ...(input.metadata === undefined
            ? {}
            : { Metadata: { ...input.metadata } }),
        }),
      );
    },

    async delete(key) {
      await options.client.send(
        new DeleteObjectCommand({
          Bucket: options.bucket,
          Key: keyWithPrefix(prefix, key),
        }),
      );
    },
  };
}
