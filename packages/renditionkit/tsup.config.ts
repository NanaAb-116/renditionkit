import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core.ts",
    image: "src/image.ts",
    bullmq: "src/bullmq.ts",
    "storage-s3": "src/storage-s3.ts",
    "repository-postgres": "src/repository-postgres.ts",
  },
  format: ["esm"],
  target: "node20",
  platform: "node",
  bundle: true,
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
  noExternal: [/^@renditionkit\//],
});
