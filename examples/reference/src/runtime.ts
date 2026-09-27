import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createImageEngine } from "@renditionkit/image";
import {
  migratePostgresRepository,
  PostgresAssetRepository,
} from "@renditionkit/repository-postgres";
import { createS3Storage } from "@renditionkit/storage-s3";
import { Pool } from "pg";
import { env } from "./env.js";

export const pool = new Pool({ connectionString: env.DATABASE_URL });
export const repository = new PostgresAssetRepository(pool);
export const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});
export const storage = createS3Storage({ client: s3, bucket: env.S3_BUCKET });
export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
  ...(env.REDIS_PASSWORD === undefined ? {} : { password: env.REDIS_PASSWORD }),
};
export const logger = {
  debug(message: string, fields?: Readonly<Record<string, unknown>>) {
    console.debug(message, fields ?? {});
  },
  info(message: string, fields?: Readonly<Record<string, unknown>>) {
    console.info(message, fields ?? {});
  },
  warn(message: string, fields?: Readonly<Record<string, unknown>>) {
    console.warn(message, fields ?? {});
  },
  error(message: string, fields?: Readonly<Record<string, unknown>>) {
    console.error(message, fields ?? {});
  },
};

export async function initializeInfrastructure(): Promise<void> {
  await migratePostgresRepository(pool);
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
  }
}

export const mediaRuntime = {
  repository,
  storage,
  engines: [createImageEngine()],
  logger,
};
