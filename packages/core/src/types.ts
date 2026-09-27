export type Awaitable<T> = T | Promise<T>;

/** A durable application-owned record that points at one original media object. */
export interface MediaAsset {
  id: string;
  /** Engine discriminator such as `image` today or `video` in the future. */
  mediaType: string;
  /** Object key understood by the configured storage adapter. */
  sourceKey: string;
  /** Isolates keys and deduplication domains in multi-tenant applications. */
  namespace?: string;
  /** Opaque application data passed back to repository methods and hooks. */
  attributes?: Readonly<Record<string, unknown>>;
}

export interface ProcessingContext {
  jobId?: string;
  attempt: number;
  startedAt: Date;
}

export interface MediaInspection {
  contentType: string;
  width?: number;
  height?: number;
  durationMs?: number;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface RenditionOutput {
  /** Stable logical name within an asset version, for example `w800`. */
  name: string;
  extension: string;
  contentType: string;
  body: Uint8Array;
  width?: number;
  height?: number;
  durationMs?: number;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface StoredRendition extends Omit<RenditionOutput, "body"> {
  key: string;
  bytes: number;
}

export interface TransformResult {
  metadata?: Readonly<Record<string, unknown>>;
}

export type EmitRendition = (
  output: RenditionOutput,
) => Promise<StoredRendition>;

export interface ObjectByteStream {
  body: AsyncIterable<Uint8Array>;
  contentType?: string;
  contentLength?: number;
}

/** Replayable access to an original; engines choose buffering or streaming. */
export interface OriginalSource {
  key: string;
  read(): Promise<GetObjectResult>;
  /** Present when the storage adapter can stream large originals. */
  stream?: () => Promise<ObjectByteStream>;
}

/**
 * Engine-owned prepared state. An image engine can retain a bounded buffer;
 * a video engine can retain a temporary file path and dispose it afterward.
 */
export interface PreparedMedia {
  checksum: string;
  sourceBytes: number;
  inspection: MediaInspection;
  transform(emit: EmitRendition): Promise<TransformResult>;
  dispose?(): Awaitable<void>;
}

/** A media-specific engine. Queue, storage, and database concerns stay outside it. */
export interface MediaEngine {
  readonly mediaType: string;
  /** Increment when key-compatible output semantics change. */
  readonly renditionVersion: number;
  prepare(asset: MediaAsset, source: OriginalSource): Promise<PreparedMedia>;
}

export interface ReadyAsset {
  checksum: string;
  sourceBytes: number;
  sourceContentType: string;
  inspection: MediaInspection;
  renditions: readonly StoredRendition[];
  transformMetadata?: Readonly<Record<string, unknown>>;
  renditionVersion: number;
}

export interface Rejection {
  code: string;
  message: string;
  details?: Readonly<Record<string, unknown>>;
}

export interface ProcessingFailure {
  message: string;
  failedAt: Date;
  attempts: number;
}

/** Application persistence boundary. RenditionKit never assumes a database schema. */
export interface AssetRepository {
  get(assetId: string): Promise<MediaAsset | null>;
  markProcessing(asset: MediaAsset, context: ProcessingContext): Promise<void>;
  markReady(
    asset: MediaAsset,
    ready: ReadyAsset,
    context: ProcessingContext,
  ): Promise<void>;
  markRejected(
    asset: MediaAsset,
    rejection: Rejection,
    context: ProcessingContext,
  ): Promise<void>;
  /** Must not overwrite a row that has already reached its successful terminal state. */
  markFailed(assetId: string, failure: ProcessingFailure): Promise<void>;
  /** Omit to disable source-checksum deduplication. */
  findDuplicate?(asset: MediaAsset, checksum: string): Promise<string | null>;
  /**
   * Optional hard-kill recovery hook. Mark attempts started before `before` as
   * failed, without overwriting assets that have since become ready.
   */
  reapStalled?(before: Date): Promise<number>;
}

export interface GetObjectResult {
  body: Uint8Array;
  contentType?: string;
}

export interface PutObjectInput {
  key: string;
  body: Uint8Array;
  contentType: string;
  cacheControl?: string;
  metadata?: Readonly<Record<string, string>>;
}

/** Minimal object-storage contract; works with S3, R2, MinIO, filesystems, or memory. */
export interface ObjectStorage {
  get(key: string): Promise<GetObjectResult>;
  /** Optional streaming path for engines that should not buffer large originals. */
  stream?(key: string): Promise<ObjectByteStream>;
  put(input: PutObjectInput): Promise<void>;
  delete?(key: string): Promise<void>;
}

export interface Logger {
  debug?(message: string, fields?: Readonly<Record<string, unknown>>): void;
  info?(message: string, fields?: Readonly<Record<string, unknown>>): void;
  warn?(message: string, fields?: Readonly<Record<string, unknown>>): void;
  error?(message: string, fields?: Readonly<Record<string, unknown>>): void;
}

export interface ProcessingHooks {
  onReady?(asset: MediaAsset, ready: ReadyAsset): Awaitable<void>;
  onRejected?(asset: MediaAsset, rejection: Rejection): Awaitable<void>;
}

export type RenditionKeyBuilder = (
  asset: MediaAsset,
  engine: MediaEngine,
  output: RenditionOutput,
) => string;

export interface MediaRuntime {
  repository: AssetRepository;
  storage: ObjectStorage;
  engines: readonly MediaEngine[];
  keyBuilder?: RenditionKeyBuilder;
  hooks?: ProcessingHooks;
  logger?: Logger;
  /** Cache policy for immutable, versioned renditions. */
  renditionCacheControl?: string;
}

export interface ProcessRequest {
  assetId: string;
  jobId?: string;
  /** One-based attempt number. */
  attempt?: number;
}

export type ProcessResult =
  | { status: "ready"; assetId: string; ready: ReadyAsset }
  | { status: "rejected"; assetId: string; rejection: Rejection }
  | { status: "skipped"; assetId: string; reason: "asset_not_found" };
