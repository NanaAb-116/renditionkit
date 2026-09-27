import { asError, MediaRejectedError } from "./errors.js";
import { defaultRenditionKey } from "./keys.js";
import type {
  MediaAsset,
  MediaEngine,
  MediaRuntime,
  ProcessRequest,
  ProcessResult,
  ProcessingContext,
  ProcessingFailure,
  PreparedMedia,
  RenditionOutput,
  StoredRendition,
} from "./types.js";

const DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable";

function engineFor(
  engines: readonly MediaEngine[],
  mediaType: string,
): MediaEngine {
  const engine = engines.find((candidate) => candidate.mediaType === mediaType);
  if (!engine) {
    throw new Error(
      `No RenditionKit engine is registered for media type \"${mediaType}\".`,
    );
  }
  return engine;
}

async function deletePartialRenditions(
  runtime: MediaRuntime,
  keys: readonly string[],
  asset: MediaAsset,
): Promise<void> {
  if (!runtime.storage.delete || keys.length === 0) return;
  const results = await Promise.allSettled(
    keys.map((key) => runtime.storage.delete!(key)),
  );
  const failures = results.filter(
    (result) => result.status === "rejected",
  ).length;
  if (failures > 0) {
    runtime.logger?.warn?.("Could not remove every partial rendition", {
      assetId: asset.id,
      failures,
      total: keys.length,
    });
  }
}

/** Process one durable asset. Unexpected errors are rethrown for the queue to retry. */
export async function processMediaAsset(
  request: ProcessRequest,
  runtime: MediaRuntime,
): Promise<ProcessResult> {
  const asset = await runtime.repository.get(request.assetId);
  if (!asset) {
    runtime.logger?.info?.("Media asset no longer exists; skipping", {
      assetId: request.assetId,
    });
    return {
      status: "skipped",
      assetId: request.assetId,
      reason: "asset_not_found",
    };
  }

  const context: ProcessingContext = {
    attempt: request.attempt ?? 1,
    startedAt: new Date(),
    ...(request.jobId === undefined ? {} : { jobId: request.jobId }),
  };
  const engine = engineFor(runtime.engines, asset.mediaType);
  const keyBuilder = runtime.keyBuilder ?? defaultRenditionKey;
  const uploaded: StoredRendition[] = [];
  let prepared: PreparedMedia | undefined;

  await runtime.repository.markProcessing(asset, context);

  try {
    prepared = await engine.prepare(asset, {
      key: asset.sourceKey,
      read: () => runtime.storage.get(asset.sourceKey),
      ...(runtime.storage.stream
        ? { stream: () => runtime.storage.stream!(asset.sourceKey) }
        : {}),
    });

    if (runtime.repository.findDuplicate) {
      const duplicateId = await runtime.repository.findDuplicate(
        asset,
        prepared.checksum,
      );
      if (duplicateId) {
        throw new MediaRejectedError(
          "duplicate",
          "An asset with identical bytes already exists.",
          {
            duplicateId,
          },
        );
      }
    }

    const emit = async (output: RenditionOutput): Promise<StoredRendition> => {
      if (!output.name.trim())
        throw new Error("An engine emitted a rendition with no name.");
      if (!output.extension.trim()) {
        throw new Error("An engine emitted a rendition with no extension.");
      }
      if (!output.contentType.trim()) {
        throw new Error("An engine emitted a rendition with no content type.");
      }
      if (output.body.byteLength === 0) {
        throw new Error(
          `Engine emitted an empty rendition named \"${output.name}\".`,
        );
      }
      const key = keyBuilder(asset, engine, output);
      if (uploaded.some((item) => item.key === key)) {
        throw new Error(
          `Engine emitted the rendition key \"${key}\" more than once.`,
        );
      }
      await runtime.storage.put({
        key,
        body: output.body,
        contentType: output.contentType,
        cacheControl: runtime.renditionCacheControl ?? DEFAULT_CACHE_CONTROL,
      });
      const stored: StoredRendition = {
        name: output.name,
        extension: output.extension,
        contentType: output.contentType,
        key,
        bytes: output.body.byteLength,
        ...(output.width === undefined ? {} : { width: output.width }),
        ...(output.height === undefined ? {} : { height: output.height }),
        ...(output.durationMs === undefined
          ? {}
          : { durationMs: output.durationMs }),
        ...(output.metadata === undefined ? {} : { metadata: output.metadata }),
      };
      uploaded.push(stored);
      return stored;
    };

    const transformed = await prepared.transform(emit);
    const ready = {
      checksum: prepared.checksum,
      sourceBytes: prepared.sourceBytes,
      sourceContentType: prepared.inspection.contentType,
      inspection: prepared.inspection,
      renditions: uploaded,
      renditionVersion: engine.renditionVersion,
      ...(transformed.metadata === undefined
        ? {}
        : { transformMetadata: transformed.metadata }),
    };

    await runtime.repository.markReady(asset, ready, context);
    await runtime.hooks?.onReady?.(asset, ready);
    runtime.logger?.info?.("Media asset is ready", {
      assetId: asset.id,
      mediaType: asset.mediaType,
      renditions: uploaded.length,
    });
    return { status: "ready", assetId: asset.id, ready };
  } catch (value) {
    const error = asError(value);

    if (error instanceof MediaRejectedError) {
      await deletePartialRenditions(
        runtime,
        uploaded.map((item) => item.key),
        asset,
      );
      await runtime.repository.markRejected(asset, error.rejection, context);
      await runtime.hooks?.onRejected?.(asset, error.rejection);
      runtime.logger?.warn?.("Media asset was rejected", {
        assetId: asset.id,
        code: error.rejection.code,
      });
      return {
        status: "rejected",
        assetId: asset.id,
        rejection: error.rejection,
      };
    }

    // Keep deterministic outputs after a transient error. In particular, the
    // database may have committed markReady even if its response was lost;
    // deleting here could leave a ready row pointing at missing objects. A retry
    // safely overwrites the same keys.
    throw error;
  } finally {
    if (prepared?.dispose) {
      try {
        await prepared.dispose();
      } catch (error) {
        runtime.logger?.warn?.("Could not dispose prepared media resources", {
          assetId: asset.id,
          error: asError(error).message,
        });
      }
    }
  }
}

/** Persist the terminal failure only after the queue adapter has exhausted retries. */
export async function markProcessingFailed(
  repository: MediaRuntime["repository"],
  assetId: string,
  error: unknown,
  attempts: number,
  maxMessageLength = 500,
): Promise<void> {
  const failure: ProcessingFailure = {
    message: asError(error).message.slice(0, maxMessageLength),
    failedAt: new Date(),
    attempts,
  };
  await repository.markFailed(assetId, failure);
}
