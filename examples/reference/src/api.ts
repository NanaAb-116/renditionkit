import { randomUUID } from "node:crypto";
import express from "express";
import multer from "multer";
import { createMediaQueue } from "@renditionkit/bullmq";
import { env } from "./env.js";
import { page } from "./page.js";
import {
  initializeInfrastructure,
  pool,
  redisConnection,
  repository,
  s3,
  storage,
} from "./runtime.js";

await initializeInfrastructure();
const queue = createMediaQueue({ connection: redisConnection });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
});
const app = express();

app.get("/", (_request, response) => response.type("html").send(page));
app.get("/health", (_request, response) => response.json({ ok: true }));

app.post("/assets", upload.single("file"), async (request, response) => {
  if (!request.file)
    return response.status(400).json({ error: "file_required" });
  const id = randomUUID();
  const sourceKey = `originals/${id}`;
  await storage.put({
    key: sourceKey,
    body: request.file.buffer,
    contentType: request.file.mimetype || "application/octet-stream",
  });
  try {
    const asset = await repository.create({
      id,
      namespace: String(request.header("x-renditionkit-namespace") ?? "demo"),
      mediaType: "image",
      sourceKey,
      attributes: { originalName: request.file.originalname },
    });
    const queued = await queue.enqueue(asset.id);
    return response
      .status(202)
      .json({ id: asset.id, status: asset.status, queued: queued.created });
  } catch (error) {
    await storage.delete?.(sourceKey).catch(() => undefined);
    throw error;
  }
});

app.get("/assets/:id", async (request, response) => {
  const asset = await repository.getRecord(request.params.id);
  if (!asset) return response.status(404).json({ error: "asset_not_found" });
  return response.json({
    ...asset,
    renditions:
      asset.renditions?.map((rendition) => ({
        ...rendition,
        url: `/assets/${encodeURIComponent(asset.id)}/renditions/${encodeURIComponent(`${rendition.name}.${rendition.extension}`)}`,
      })) ?? [],
  });
});

app.get("/assets/:id/renditions/:name", async (request, response) => {
  const asset = await repository.getRecord(request.params.id);
  const rendition = asset?.renditions?.find(
    (item) => `${item.name}.${item.extension}` === request.params.name,
  );
  if (!rendition)
    return response.status(404).json({ error: "rendition_not_found" });
  const object = await storage.get(rendition.key);
  response.setHeader("content-type", rendition.contentType);
  response.setHeader("cache-control", "public, max-age=31536000, immutable");
  return response.send(Buffer.from(object.body));
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    response.status(500).json({ error: "internal_error" });
  },
);

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.info(
    `RenditionKit reference API listening on http://localhost:${env.PORT}`,
  );
});

async function close(): Promise<void> {
  server.close();
  await Promise.all([queue.close(), pool.end(), s3.destroy()]);
}
process.once("SIGTERM", () => void close());
process.once("SIGINT", () => void close());
