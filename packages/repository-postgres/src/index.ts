import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { MediaRejectedError } from "@renditionkit/core";
import type {
  AssetRepository,
  MediaAsset,
  ProcessingContext,
  ProcessingFailure,
  ReadyAsset,
  Rejection,
} from "@renditionkit/core";
import type { QueryResult, QueryResultRow } from "pg";

export interface Queryable {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResult<R>>;
}

export type AssetStatus =
  "pending" | "processing" | "ready" | "rejected" | "failed";

export interface PostgresAssetRecord extends MediaAsset {
  namespace: string;
  attributes: Readonly<Record<string, unknown>>;
  status: AssetStatus;
  checksum: string | null;
  sourceBytes: number | null;
  sourceContentType: string | null;
  inspection: ReadyAsset["inspection"] | null;
  renditions: ReadyAsset["renditions"] | null;
  transformMetadata: Readonly<Record<string, unknown>> | null;
  renditionVersion: number;
  processingStartedAt: Date | null;
  attempt: number;
  jobId: string | null;
  error: Rejection | { code: "processing_failed"; message: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostgresAssetInput {
  id?: string;
  namespace?: string;
  mediaType: string;
  sourceKey: string;
  attributes?: Readonly<Record<string, unknown>>;
}

export interface PostgresRepositoryOptions {
  /** Defaults to true and deduplicates ready assets within one namespace. */
  deduplicate?: boolean;
}

type AssetRow = {
  id: string;
  namespace: string;
  media_type: string;
  source_key: string;
  attributes: Record<string, unknown>;
  status: AssetStatus;
  checksum: string | null;
  source_bytes: number | null;
  source_content_type: string | null;
  inspection: ReadyAsset["inspection"] | null;
  renditions: ReadyAsset["renditions"] | null;
  transform_metadata: Record<string, unknown> | null;
  rendition_version: number;
  processing_started_at: Date | null;
  attempt: number;
  job_id: string | null;
  error_code: string | null;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
};

const COLUMNS = `id, namespace, media_type, source_key, attributes, status, checksum,
  source_bytes::float8 as source_bytes, source_content_type, inspection, renditions,
  transform_metadata, rendition_version, processing_started_at, attempt, job_id,
  error_code, error_message, error_details, created_at, updated_at`;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function toRecord(row: AssetRow): PostgresAssetRecord {
  const error = row.error_code
    ? {
        code: row.error_code,
        message: row.error_message ?? row.error_code,
        ...(row.error_details === null ? {} : { details: row.error_details }),
      }
    : null;
  return {
    id: row.id,
    namespace: row.namespace,
    mediaType: row.media_type,
    sourceKey: row.source_key,
    attributes: row.attributes,
    status: row.status,
    checksum: row.checksum,
    sourceBytes: row.source_bytes,
    sourceContentType: row.source_content_type,
    inspection: row.inspection,
    renditions: row.renditions,
    transformMetadata: row.transform_metadata,
    renditionVersion: row.rendition_version,
    processingStartedAt: row.processing_started_at,
    attempt: row.attempt,
    jobId: row.job_id,
    error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresAssetRepository implements AssetRepository {
  readonly #database: Queryable;
  readonly #deduplicate: boolean;

  constructor(database: Queryable, options: PostgresRepositoryOptions = {}) {
    this.#database = database;
    this.#deduplicate = options.deduplicate ?? true;
  }

  async create(input: CreatePostgresAssetInput): Promise<PostgresAssetRecord> {
    const id = input.id ?? randomUUID();
    const { rows } = await this.#database.query<AssetRow>(
      `insert into renditionkit_assets
         (id, namespace, media_type, source_key, attributes)
       values ($1, $2, $3, $4, $5::jsonb)
       returning ${COLUMNS}`,
      [
        id,
        input.namespace?.trim() || "default",
        input.mediaType,
        input.sourceKey,
        JSON.stringify(input.attributes ?? {}),
      ],
    );
    return toRecord(rows[0]!);
  }

  async getRecord(assetId: string): Promise<PostgresAssetRecord | null> {
    const { rows } = await this.#database.query<AssetRow>(
      `select ${COLUMNS} from renditionkit_assets where id = $1`,
      [assetId],
    );
    return rows[0] ? toRecord(rows[0]) : null;
  }

  async get(assetId: string): Promise<MediaAsset | null> {
    const record = await this.getRecord(assetId);
    if (!record) return null;
    return {
      id: record.id,
      namespace: record.namespace,
      mediaType: record.mediaType,
      sourceKey: record.sourceKey,
      ...(record.attributes === undefined
        ? {}
        : { attributes: record.attributes }),
    };
  }

  async markProcessing(
    asset: MediaAsset,
    context: ProcessingContext,
  ): Promise<boolean> {
    const result = await this.#database.query(
      `update renditionkit_assets
          set status = 'processing', processing_started_at = $2, attempt = $3,
              job_id = $4, error_code = null, error_message = null,
              error_details = null, updated_at = now()
        where id = $1 and (
          status in ('pending', 'failed') or
          (status = 'processing' and job_id is not distinct from $4)
        )`,
      [asset.id, context.startedAt, context.attempt, context.jobId ?? null],
    );
    return result.rowCount === 1;
  }

  async markReady(
    asset: MediaAsset,
    ready: ReadyAsset,
    _context: ProcessingContext,
  ): Promise<void> {
    try {
      const result = await this.#database.query(
        `update renditionkit_assets
            set status = 'ready', checksum = $2, source_bytes = $3,
                source_content_type = $4, inspection = $5::jsonb,
                renditions = $6::jsonb, transform_metadata = $7::jsonb,
                rendition_version = $8, processing_started_at = null,
                error_code = null, error_message = null, error_details = null,
                updated_at = now()
          where id = $1`,
        [
          asset.id,
          ready.checksum,
          ready.sourceBytes,
          ready.sourceContentType,
          JSON.stringify(ready.inspection),
          JSON.stringify(ready.renditions),
          JSON.stringify(ready.transformMetadata ?? null),
          ready.renditionVersion,
        ],
      );
      if (result.rowCount === 0) {
        throw new MediaRejectedError(
          "asset_deleted",
          "The asset was deleted while processing.",
        );
      }
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new MediaRejectedError(
          "duplicate",
          "A ready asset in this namespace already has the same checksum.",
        );
      }
      throw error;
    }
  }

  async markRejected(
    asset: MediaAsset,
    rejection: Rejection,
    _context: ProcessingContext,
  ): Promise<void> {
    await this.#database.query(
      `update renditionkit_assets
          set status = 'rejected', processing_started_at = null,
              error_code = $2, error_message = $3, error_details = $4::jsonb,
              updated_at = now()
        where id = $1`,
      [
        asset.id,
        rejection.code,
        rejection.message,
        JSON.stringify(rejection.details ?? null),
      ],
    );
  }

  async markFailed(assetId: string, failure: ProcessingFailure): Promise<void> {
    await this.#database.query(
      `update renditionkit_assets
          set status = 'failed', processing_started_at = null,
              error_code = 'processing_failed', error_message = $2,
              error_details = jsonb_build_object('attempts', $3::int, 'failedAt', $4::text),
              updated_at = now()
        where id = $1 and status = 'processing'`,
      [
        assetId,
        failure.message,
        failure.attempts,
        failure.failedAt.toISOString(),
      ],
    );
  }

  async findDuplicate(
    asset: MediaAsset,
    checksum: string,
  ): Promise<string | null> {
    if (!this.#deduplicate) return null;
    const { rows } = await this.#database.query<{ id: string }>(
      `select id from renditionkit_assets
        where namespace = $1 and checksum = $2 and status = 'ready' and id <> $3
        limit 1`,
      [asset.namespace?.trim() || "default", checksum, asset.id],
    );
    return rows[0]?.id ?? null;
  }

  async reapStalled(before: Date): Promise<number> {
    const result = await this.#database.query(
      `update renditionkit_assets
          set status = 'failed', processing_started_at = null,
              error_code = 'processing_stalled',
              error_message = 'The processing attempt exceeded its allowed runtime.',
              error_details = jsonb_build_object('before', $1::text),
              updated_at = now()
        where status = 'processing' and processing_started_at < $1`,
      [before.toISOString()],
    );
    return result.rowCount ?? 0;
  }
}

/** Apply the idempotent schema bundled with this package. */
export async function migratePostgresRepository(
  database: Queryable,
): Promise<void> {
  const sql = await readFile(new URL("../schema.sql", import.meta.url), "utf8");
  await database.query(sql);
}
