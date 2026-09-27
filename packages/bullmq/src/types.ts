import type { ConnectionOptions, JobsOptions } from "bullmq";
import type { Logger, MediaRuntime } from "@renditionkit/core";

export interface MediaJobData {
  assetId: string;
  /** Internal token used to identify the winner of concurrent enqueue calls. */
  enqueueToken?: string;
}

export interface MediaQueueOptions {
  connection: ConnectionOptions;
  queueName?: string;
  defaultJobOptions?: JobsOptions;
}

export interface EnqueueOptions {
  /** Remove a retained completed/failed job and create a fresh run. Defaults to true. */
  replaceTerminal?: boolean;
}

export interface StallSweepOptions {
  intervalMs?: number;
  staleAfterMs?: number;
}

export interface MediaWorkerOptions {
  connection: ConnectionOptions;
  runtime: MediaRuntime;
  queueName?: string;
  concurrency?: number;
  deadLetterQueueName?: string;
  maxDeadLetters?: number;
  stallSweep?: StallSweepOptions | false;
  logger?: Logger;
}
