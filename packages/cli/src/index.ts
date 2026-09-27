import type { MediaWorkerOptions } from "@renditionkit/bullmq";

export type WorkerConfigFactory = () =>
  MediaWorkerOptions | Promise<MediaWorkerOptions>;
export type WorkerConfig = MediaWorkerOptions | WorkerConfigFactory;

/** Type-check a JavaScript worker configuration without changing it. */
export function defineConfig(config: WorkerConfig): WorkerConfig {
  return config;
}
