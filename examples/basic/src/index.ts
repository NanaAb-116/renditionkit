import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import {
  processMediaAsset,
  type AssetRepository,
  type MediaAsset,
  type ObjectStorage,
} from "@renditionkit/core";
import { createImageEngine } from "@renditionkit/image";

const forwarded = process.argv.slice(2);
const argumentsWithoutSeparator =
  forwarded[0] === "--" ? forwarded.slice(1) : forwarded;
const [inputArgument, outputArgument = "./renditionkit-output"] =
  argumentsWithoutSeparator;
if (!inputArgument) {
  throw new Error("Usage: pnpm start -- <input-image> [output-directory]");
}
const inputPath = resolve(inputArgument);
const outputDirectory = resolve(outputArgument);
const asset: MediaAsset = {
  id: basename(inputPath),
  mediaType: "image",
  sourceKey: inputPath,
  namespace: "example",
};

const repository: AssetRepository = {
  async get(id) {
    return id === asset.id ? asset : null;
  },
  async markProcessing() {
    process.stdout.write("processing\n");
  },
  async markReady(_asset, ready) {
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(
      resolve(outputDirectory, "result.json"),
      `${JSON.stringify(ready, null, 2)}\n`,
    );
  },
  async markRejected(_asset, rejection) {
    process.stderr.write(`rejected: ${rejection.code}: ${rejection.message}\n`);
  },
  async markFailed(_id, failure) {
    process.stderr.write(`failed: ${failure.message}\n`);
  },
};

const storage: ObjectStorage = {
  async get(key) {
    return { body: await readFile(key) };
  },
  async put(output) {
    const path = resolve(outputDirectory, output.key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, output.body);
  },
};

const result = await processMediaAsset(
  { assetId: asset.id },
  {
    repository,
    storage,
    engines: [createImageEngine()],
    logger: {
      info(message, fields) {
        process.stdout.write(`${message} ${JSON.stringify(fields ?? {})}\n`);
      },
    },
  },
);

process.stdout.write(`${result.status}: ${outputDirectory}\n`);
