#!/usr/bin/env node
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createMediaWorker } from "@renditionkit/bullmq";
import type { WorkerConfig } from "./index.js";

function configPath(argv: readonly string[]): string | null {
  const index = argv.findIndex((arg) => arg === "--config" || arg === "-c");
  return index >= 0 ? (argv[index + 1] ?? null) : null;
}

function printHelp(): void {
  process.stdout.write(
    `RenditionKit worker\n\nUsage:\n  renditionkit-worker --config ./renditionkit.config.mjs\n`,
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }
  const requested = configPath(args);
  if (!requested)
    throw new Error("Missing --config path. Run with --help for usage.");

  const url = pathToFileURL(resolve(process.cwd(), requested)).href;
  const loaded = (await import(url)) as { default?: WorkerConfig };
  if (!loaded.default)
    throw new Error(`Worker config ${requested} has no default export.`);
  const options =
    typeof loaded.default === "function"
      ? await loaded.default()
      : loaded.default;
  const writeLog = (
    level: string,
    message: string,
    fields?: Readonly<Record<string, unknown>>,
  ) => {
    process.stderr.write(
      `[renditionkit] ${level} ${message}${fields ? ` ${JSON.stringify(fields)}` : ""}\n`,
    );
  };
  const logger = options.logger ??
    options.runtime.logger ?? {
      debug: (message: string, fields?: Readonly<Record<string, unknown>>) =>
        writeLog("debug", message, fields),
      info: (message: string, fields?: Readonly<Record<string, unknown>>) =>
        writeLog("info", message, fields),
      warn: (message: string, fields?: Readonly<Record<string, unknown>>) =>
        writeLog("warn", message, fields),
      error: (message: string, fields?: Readonly<Record<string, unknown>>) =>
        writeLog("error", message, fields),
    };
  const handle = createMediaWorker({ ...options, logger });

  let closing: Promise<void> | undefined;
  const close = (signal: string): Promise<void> => {
    closing ??= (async () => {
      logger.info?.("Stopping RenditionKit worker", { signal });
      await handle.close();
    })();
    return closing;
  };
  const onSignal = (signal: string) => {
    void close(signal).catch((error: unknown) => {
      process.stderr.write(
        `Failed to stop worker: ${(error as Error).message}\n`,
      );
      process.exitCode = 1;
    });
  };
  process.once("SIGTERM", () => onSignal("SIGTERM"));
  process.once("SIGINT", () => onSignal("SIGINT"));
  handle.worker.on("ready", () => {
    logger.info?.("RenditionKit worker is ready", {
      queueName: options.queueName ?? "renditionkit-media",
      concurrency: options.concurrency ?? 2,
    });
  });
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.stack : String(error)}\n`,
  );
  process.exitCode = 1;
});
