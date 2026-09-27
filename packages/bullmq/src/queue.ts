import { createHash } from "node:crypto";
import { Queue, type Job } from "bullmq";
import type {
  EnqueueOptions,
  MediaJobData,
  MediaQueueOptions,
} from "./types.js";

export const DEFAULT_MEDIA_QUEUE = "renditionkit-media";
export const MEDIA_JOB_NAME = "process-media";

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5_000 },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
} as const;

/** BullMQ forbids `:` in custom IDs, so arbitrary application IDs are hashed. */
export function jobIdForAsset(assetId: string): string {
  return `asset-${createHash("sha256").update(assetId).digest("hex")}`;
}

export interface MediaQueue {
  readonly queue: Queue<MediaJobData>;
  enqueue(
    assetId: string,
    options?: EnqueueOptions,
  ): Promise<{ created: boolean; job: Job<MediaJobData> }>;
  close(): Promise<void>;
}

export function createMediaQueue(options: MediaQueueOptions): MediaQueue {
  const queue = new Queue<MediaJobData>(
    options.queueName ?? DEFAULT_MEDIA_QUEUE,
    {
      connection: options.connection,
      defaultJobOptions: {
        ...DEFAULT_JOB_OPTIONS,
        ...options.defaultJobOptions,
      },
    },
  );

  return {
    queue,

    async enqueue(assetId, enqueueOptions = {}) {
      const jobId = jobIdForAsset(assetId);
      const existing = await queue.getJob(jobId);
      if (existing) {
        const state = await existing.getState();
        const terminal = state === "completed" || state === "failed";
        if (!terminal || enqueueOptions.replaceTerminal === false) {
          return { created: false, job: existing };
        }
        await existing.remove().catch(() => undefined);
      }
      const job = await queue.add(MEDIA_JOB_NAME, { assetId }, { jobId });
      return { created: true, job };
    },

    async close() {
      await queue.close();
    },
  };
}
