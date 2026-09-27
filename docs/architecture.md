# Architecture

RenditionKit is split at the boundaries that vary between applications.

## Core lifecycle

`processMediaAsset` performs one attempt:

1. Load the durable asset through the repository adapter.
2. Mark the attempt as processing.
3. Select an engine from the asset's `mediaType`.
4. Give the engine replayable buffered and, when available, streaming access to
   the original.
5. Let the engine prepare its source, inspect it, and compute its checksum.
6. Optionally ask the repository whether the prepared checksum is a duplicate.
7. Transform and upload each rendition as it is emitted.
8. Persist one successful terminal result.
9. Run an optional application hook.

Permanent input problems are represented by `MediaRejectedError`. They are
persisted as rejections and complete the queue job without wasting retries.
Infrastructure and unexpected errors are rethrown for the queue adapter.

## Idempotency

Rendition keys are deterministic:

```text
renditions/<namespace>/<media-type>/<asset-id>/v<version>/<name>.<extension>
```

A retry overwrites the same keys. Unexpected failures deliberately do not delete
already-written renditions: a database write may have committed even when its
response was lost, and deleting in that ambiguity could leave a successful row
pointing at missing objects.

Repositories must make `markReady` idempotent and must ensure a late failure does
not overwrite a ready asset.

## Extensibility

An engine implements two facts and one preparation operation:

- its `mediaType` discriminator;
- its rendition schema version;
- `prepare`, which chooses buffered or streaming access, validates and inspects
  the source, computes a checksum, and returns a transformation closure.

Prepared media may expose `dispose`, allowing a future video engine to stream a
large original into a temporary file, run FFmpeg without retaining the file in
memory, and reliably remove the temporary file afterward.

The core does not contain image-specific fields. Width, height, duration, codec,
page count, and other facts are optional metadata, allowing image and video jobs
to share the same lifecycle.
