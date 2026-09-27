# Adapter guide

## Repository

Applications implement `AssetRepository`; RenditionKit does not create or query
application tables.

Important guarantees:

- `get` returns the source object key and media type.
- `markProcessing` stores a start time so dead attempts can be reaped. It may
  return `false` to decline work when an asset is terminal or another attempt
  owns it; returning nothing keeps simple adapters compatible.
- `markReady` writes the output atomically and is safe to repeat.
- `markFailed` must not overwrite an asset that already became ready.
- `findDuplicate` is optional and defines the application's deduplication domain.
- `reapStalled` is optional and should fail only old processing attempts.

For SQL databases, the ready write normally updates status, checksum, inspection,
renditions, transform metadata, and rendition version in one statement.

## Storage

`ObjectStorage` needs `get`, `put`, and optionally `stream` and `delete`. Image
engines use buffered reads; large video engines can consume the streaming path
without loading an entire original into memory. The S3 adapter supports both and
works with AWS S3, Cloudflare R2, and MinIO by configuring the AWS SDK client.

The worker addresses objects by key. Public CDN URLs should be constructed by the
application at read time so domains can change without a data migration.

## Hooks

`onReady` and `onRejected` are application integration points. Typical uses are
invalidating a social card, publishing an event, or emitting metrics. Hooks may
run more than once after a retry and therefore must be idempotent.
