import { createMediaWorker } from "@renditionkit/bullmq";
import { env } from "./env.js";
import {
  initializeInfrastructure,
  logger,
  mediaRuntime,
  pool,
  redisConnection,
  s3,
} from "./runtime.js";

await initializeInfrastructure();
const handle = createMediaWorker({
  connection: redisConnection,
  concurrency: env.WORKER_CONCURRENCY,
  runtime: mediaRuntime,
  logger,
});
handle.worker.on("ready", () => logger.info("Reference worker is ready"));

let closing: Promise<void> | undefined;
function close(): Promise<void> {
  closing ??= (async () => {
    await handle.close();
    await pool.end();
    s3.destroy();
  })();
  return closing;
}
process.once("SIGTERM", () => void close());
process.once("SIGINT", () => void close());
