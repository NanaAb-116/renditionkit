# RenditionKit

Extensible background processing for image and video renditions.

RenditionKit separates media transformation from queues, object storage, and
application databases. The first engine processes images with Sharp. The same
runtime contracts are designed to support an FFmpeg video engine without
changing an application's queue or persistence integration.

> Status: early development. The packages are not published yet.

## Packages

| Package                             | Purpose                                                                |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `@renditionkit/core`                | Queue-neutral orchestration and adapter contracts                      |
| `@renditionkit/image`               | Validated, colour-managed AVIF/WebP/JPEG renditions with Sharp         |
| `@renditionkit/bullmq`              | Deduplicated jobs, retries, dead letters, and stalled-attempt recovery |
| `@renditionkit/storage-s3`          | AWS S3, Cloudflare R2, and MinIO storage adapter                       |
| `@renditionkit/repository-postgres` | Ready-to-use durable asset repository for PostgreSQL                   |
| `@renditionkit/cli`                 | Configuration-driven worker process                                    |
| `renditionkit`                      | Self-contained package with the same APIs through subpath imports      |

## How it fits together

```text
application upload
      │
      ├── original → object storage
      ├── asset row → application repository
      └── asset id → BullMQ
                       │
                  RenditionKit worker
                       │
              inspect → checksum → transform
                       │
              renditions → object storage
                       │
              ready metadata → repository
```

Your application owns asset records and decides how statuses are represented.
RenditionKit only talks to the `AssetRepository` and `ObjectStorage` interfaces.

## Quick start

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createImageEngine } from "@renditionkit/image";
import { createMediaWorker } from "@renditionkit/bullmq";
import { createS3Storage } from "@renditionkit/storage-s3";

const worker = createMediaWorker({
  connection: { host: "127.0.0.1", port: 6379, db: 2 },
  concurrency: 2,
  runtime: {
    repository: myAssetRepository,
    storage: createS3Storage({
      client: new S3Client({
        region: "auto",
        endpoint: process.env.S3_ENDPOINT,
      }),
      bucket: process.env.S3_BUCKET!,
    }),
    engines: [createImageEngine()],
  },
});
```

The API process enqueues an already-durable asset:

```ts
import { createMediaQueue } from "@renditionkit/bullmq";

const media = createMediaQueue({
  connection: { host: "127.0.0.1", port: 6379, db: 2 },
});

await media.enqueue(assetId);
```

See [the complete Docker reference app](examples/reference/README.md),
[architecture](docs/architecture.md), [adapter guide](docs/adapters.md),
[operations guide](docs/operations.md), and [generated API reference](docs/api/README.md).

## Image behavior

The default image engine:

- verifies magic bytes and fully decodes a small probe;
- rejects truncated, corrupt, unsupported, and animated inputs;
- applies EXIF orientation and converts pixels to sRGB;
- decodes once into a bounded raw intermediate;
- creates AVIF and WebP widths at 400, 800, 1600, and 2400 pixels;
- adds the exact source width when it falls between configured rungs;
- never upscales;
- generates a base64 ThumbHash placeholder; and
- strips EXIF and GPS metadata from renditions.

## Development

Requirements: Node.js 20 or newer and pnpm 10.

```sh
pnpm install
pnpm check
pnpm --filter @renditionkit/basic-example start ./photo.jpg ./output
```

Generate a large fixture and measure the image pipeline in a separate process:

```sh
pnpm benchmark:fixture -- ./benchmarks/fixture.jpg 6000 4000
pnpm benchmark:image -- ./benchmarks/fixture.jpg
```

See [benchmark methodology](benchmarks/README.md) and the
[release checklist](docs/releasing.md) before publishing.

## Future video engine

The planned `@renditionkit/video` package will implement the same `MediaEngine`
contract for FFmpeg. The storage contract already offers streaming reads, and a
prepared engine can own and dispose a temporary file, so video originals do not
need to be buffered in memory. It can add poster frames, thumbnails, MP4/WebM
outputs, and HLS/DASH ladders while reusing the current queue, storage, repository,
dead-letter, and recovery machinery.

## License

MIT
