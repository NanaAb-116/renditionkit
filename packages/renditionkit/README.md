# renditionkit

The convenient, self-contained entry package for RenditionKit. It does not
require the separately published `@renditionkit/*` packages.

```sh
pnpm add renditionkit
```

```ts
import { createImageEngine, processMediaAsset } from "renditionkit";
import { createMediaWorker } from "renditionkit/bullmq";
import { createS3Storage } from "renditionkit/storage-s3";
import { PostgresAssetRepository } from "renditionkit/repository-postgres";
```

The repository uses `@renditionkit/*` workspace packages internally. The public
`renditionkit` package bundles those APIs behind the subpath imports shown above,
so consumers do not need separately published scoped packages.
