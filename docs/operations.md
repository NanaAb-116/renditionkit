# Operations

## Retries and dead letters

The BullMQ adapter defaults to three attempts with exponential backoff starting
at five seconds. Exhausted jobs are marked failed through the repository and
copied into a bounded dead-letter queue for inspection.

Job IDs are SHA-256 hashes of asset IDs. This both avoids BullMQ's custom-ID
character restrictions and deduplicates overlapping enqueue calls. A completed
or failed retained job is removed before an intentional re-run.

## Hard process death

A killed process cannot emit a BullMQ failure event. If the repository implements
`reapStalled`, the worker periodically asks it to fail attempts older than 30
minutes. The default sweep interval is five minutes; both values are configurable.

## Memory

Sharp/libvips allocates native memory outside the V8 heap. A Node heap limit is
not a media-worker memory limit. Run media work in a dedicated container with a
cgroup memory limit.

The image engine defaults to one libvips thread per operation and the BullMQ
adapter defaults to two concurrent jobs. Raising concurrency increases decoded
memory approximately multiplicatively. Measure with representative worst-case
inputs before changing either value.

## Redis isolation

Use a dedicated Redis instance or logical database for media queues. This allows
queue-specific memory accounting and operational cleanup without touching
unrelated application state.

## Deploy order

Deploy consumers that understand a new job schema before producers begin writing
it. Keep job payloads small and stable; the current BullMQ payload contains only
an asset ID, while mutable details are loaded from the durable repository.
