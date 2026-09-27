[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / @renditionkit/bullmq

# @renditionkit/bullmq

BullMQ queue and worker integration for RenditionKit, including deduplication,
retries, dead letters, and optional stalled-attempt recovery.

```sh
pnpm add @renditionkit/core @renditionkit/bullmq bullmq
```

## Interfaces

- [DeadLetterData](interfaces/DeadLetterData.md)
- [EnqueueOptions](interfaces/EnqueueOptions.md)
- [MediaJobData](interfaces/MediaJobData.md)
- [MediaQueue](interfaces/MediaQueue.md)
- [MediaQueueOptions](interfaces/MediaQueueOptions.md)
- [MediaWorkerHandle](interfaces/MediaWorkerHandle.md)
- [MediaWorkerOptions](interfaces/MediaWorkerOptions.md)
- [StallSweepOptions](interfaces/StallSweepOptions.md)

## Variables

- [DEFAULT\_MEDIA\_QUEUE](variables/DEFAULT_MEDIA_QUEUE.md)
- [MEDIA\_JOB\_NAME](variables/MEDIA_JOB_NAME.md)

## Functions

- [createMediaQueue](functions/createMediaQueue.md)
- [createMediaWorker](functions/createMediaWorker.md)
- [jobIdForAsset](functions/jobIdForAsset.md)
