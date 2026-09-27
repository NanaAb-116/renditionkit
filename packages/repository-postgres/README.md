# @renditionkit/repository-postgres

A durable, optional PostgreSQL implementation of RenditionKit's
`AssetRepository` contract.

It includes an idempotent schema, namespace-scoped checksum deduplication,
atomic ready writes, terminal status protection, and stalled-attempt recovery.

```ts
import { Pool } from "pg";
import {
  migratePostgresRepository,
  PostgresAssetRepository,
} from "@renditionkit/repository-postgres";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await migratePostgresRepository(pool);
const repository = new PostgresAssetRepository(pool);
```
