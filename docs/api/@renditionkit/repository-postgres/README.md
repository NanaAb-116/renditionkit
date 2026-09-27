[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / @renditionkit/repository-postgres

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

## Classes

- [PostgresAssetRepository](classes/PostgresAssetRepository.md)

## Interfaces

- [CreatePostgresAssetInput](interfaces/CreatePostgresAssetInput.md)
- [PostgresAssetRecord](interfaces/PostgresAssetRecord.md)
- [PostgresRepositoryOptions](interfaces/PostgresRepositoryOptions.md)
- [Queryable](interfaces/Queryable.md)

## Type Aliases

- [AssetStatus](type-aliases/AssetStatus.md)

## Functions

- [migratePostgresRepository](functions/migratePostgresRepository.md)
