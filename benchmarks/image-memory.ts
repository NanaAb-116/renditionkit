import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createImageEngine } from "../packages/image/src/index.js";

const arguments_ = process.argv
  .slice(2)
  .filter((argument) => argument !== "--");
const inputPath = resolve(arguments_[0] ?? "benchmarks/fixture.jpg");
const input = await readFile(inputPath);
const engine = createImageEngine();
const asset = { id: "benchmark", mediaType: "image", sourceKey: inputPath };
const startedAt = performance.now();
const prepared = await engine.prepare(asset, {
  key: inputPath,
  async read() {
    return { body: input };
  },
});
let outputBytes = 0;
let outputs = 0;
await prepared.transform(async (output) => {
  outputBytes += output.body.byteLength;
  outputs += 1;
  return {
    name: output.name,
    extension: output.extension,
    contentType: output.contentType,
    key: output.name,
    bytes: output.body.byteLength,
    ...(output.width === undefined ? {} : { width: output.width }),
    ...(output.height === undefined ? {} : { height: output.height }),
  };
});
await prepared.dispose?.();

console.log(
  JSON.stringify(
    {
      inputPath,
      inputBytes: input.byteLength,
      outputs,
      outputBytes,
      durationMs: Math.round(performance.now() - startedAt),
      maxRssBytes: process.resourceUsage().maxRSS * 1024,
    },
    null,
    2,
  ),
);
