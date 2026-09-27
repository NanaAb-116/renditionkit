import { Queue, Worker, type Job } from "bullmq";
import { markProcessingFailed, processMediaAsset } from "@renditionkit/core";
import { DEFAULT_MEDIA_QUEUE, MEDIA_JOB_NAME } from "./queue.js";
import type { MediaJobData, MediaWorkerOptions } from "./types.js";

export interface DeadLetterData extends MediaJobData {
  jobId: string | null;
  failedAt: string;
  error: string;
  attempts: number;
}

export interface MediaWorkerHandle {
  readonly worker: Worker<MediaJobData>;
  readonly deadLetterQueue: Queue<DeadLetterData>;
  close(): Promise<void>;
}

const DEFAULT_STALL_INTERVAL = 5 * 60_000;
const DEFAULT_STALE_AFTER = 30 * 60_000;

async function trimDeadLetters(
  queue: Queue<DeadLetterData>,
  maximum: number,
): Promise<void> {
  const count = await queue.getWaitingCount();
  if (count <= maximum) return;
  const excess = await queue.getJobs(["wait"], 0, count - maximum - 1, true);
  await Promise.all(excess.map((job) => job.remove().catch(() => undefined)));
}

/** Create a worker whose terminal failure handling is kept beside its retry policy. */
export function createMediaWorker(
  options: MediaWorkerOptions,
): MediaWorkerHandle {
  const queueName = options.queueName ?? DEFAULT_MEDIA_QUEUE;
  const logger = options.logger ?? options.runtime.logger;
  const maxDeadLetters = options.maxDeadLetters ?? 500;
  if (!Number.isInteger(maxDeadLetters) || maxDeadLetters < 1) {
    throw new Error("maxDeadLetters must be a positive integer.");
  }
  const concurrency = options.concurrency ?? 2;
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error("concurrency must be a positive integer.");
  }
  const stallOptions =
    options.stallSweep === false ? undefined : options.stallSweep;
  const stallInterval = stallOptions?.intervalMs ?? DEFAULT_STALL_INTERVAL;
  const staleAfter = stallOptions?.staleAfterMs ?? DEFAULT_STALE_AFTER;
  if (
    options.stallSweep !== false &&
    options.runtime.repository.reapStalled &&
    (stallInterval < 1_000 || staleAfter < 1_000)
  ) {
    throw new Error("Stall sweep intervals must be at least 1000ms.");
  }

  const deadLetterQueue = new Queue<DeadLetterData>(
    options.deadLetterQueueName ?? `${queueName}-dead`,
    { connection: options.connection },
  );
  const worker = new Worker<MediaJobData>(
    queueName,
    async (job) => {
      if (job.name !== MEDIA_JOB_NAME) {
        logger?.warn?.("Ignoring an unknown media job", {
          jobId: job.id,
          name: job.name,
        });
        return { status: "skipped", reason: "unknown_job_name" };
      }
      return processMediaAsset(
        {
          assetId: job.data.assetId,
          attempt: job.attemptsMade + 1,
          ...(job.id === undefined ? {} : { jobId: job.id }),
        },
        options.runtime,
      );
    },
    { connection: options.connection, concurrency },
  );

  worker.on("completed", (job) => {
    logger?.info?.("Media job completed", {
      jobId: job.id,
      assetId: job.data.assetId,
    });
  });
  worker.on("error", (error) => {
    logger?.error?.("Media worker connection error", { error: error.message });
  });
  const pendingFailureHandlers = new Set<Promise<void>>();
  worker.on("failed", (job: Job<MediaJobData> | undefined, error) => {
    if (!job || job.attemptsMade < (job.opts.attempts ?? 1)) return;
    const handling = (async () => {
      const message = error.message.slice(0, 500);
      try {
        await markProcessingFailed(
          options.runtime.repository,
          job.data.assetId,
          error,
          job.attemptsMade,
        );
      } catch (markError) {
        logger?.error?.("Could not persist terminal media failure", {
          assetId: job.data.assetId,
          error: (markError as Error).message,
        });
      }
      try {
        await deadLetterQueue.add("dead", {
          assetId: job.data.assetId,
          jobId: job.id ?? null,
          failedAt: new Date().toISOString(),
          error: message,
          attempts: job.attemptsMade,
        });
        await trimDeadLetters(deadLetterQueue, maxDeadLetters);
      } catch (deadLetterError) {
        logger?.error?.("Could not store media dead letter", {
          assetId: job.data.assetId,
          error: (deadLetterError as Error).message,
        });
      }
    })();
    pendingFailureHandlers.add(handling);
    void handling.finally(() => pendingFailureHandlers.delete(handling));
  });

  let sweepTimer: NodeJS.Timeout | undefined;
  if (options.stallSweep !== false && options.runtime.repository.reapStalled) {
    const sweep = async () => {
      try {
        const count = await options.runtime.repository.reapStalled!(
          new Date(Date.now() - staleAfter),
        );
        if (count > 0)
          logger?.warn?.("Reaped stalled media attempts", { count });
      } catch (error) {
        logger?.error?.("Media stall sweep failed", {
          error: (error as Error).message,
        });
      }
    };
    void sweep();
    sweepTimer = setInterval(() => void sweep(), stallInterval);
    sweepTimer.unref();
  }

  return {
    worker,
    deadLetterQueue,
    async close() {
      if (sweepTimer) clearInterval(sweepTimer);
      await worker.close();
      await Promise.allSettled(pendingFailureHandlers);
      await deadLetterQueue.close();
    },
  };
}
