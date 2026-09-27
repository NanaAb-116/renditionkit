[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / @renditionkit/core

# @renditionkit/core

Queue-neutral orchestration and adapter contracts for RenditionKit.

```sh
pnpm add @renditionkit/core
```

See the RenditionKit repository documentation for architecture and examples.

## Classes

- [MediaRejectedError](classes/MediaRejectedError.md)

## Interfaces

- [AssetRepository](interfaces/AssetRepository.md)
- [GetObjectResult](interfaces/GetObjectResult.md)
- [Logger](interfaces/Logger.md)
- [MediaAsset](interfaces/MediaAsset.md)
- [MediaEngine](interfaces/MediaEngine.md)
- [MediaInspection](interfaces/MediaInspection.md)
- [MediaRuntime](interfaces/MediaRuntime.md)
- [ObjectByteStream](interfaces/ObjectByteStream.md)
- [ObjectStorage](interfaces/ObjectStorage.md)
- [OriginalSource](interfaces/OriginalSource.md)
- [PreparedMedia](interfaces/PreparedMedia.md)
- [ProcessingContext](interfaces/ProcessingContext.md)
- [ProcessingFailure](interfaces/ProcessingFailure.md)
- [ProcessingHooks](interfaces/ProcessingHooks.md)
- [ProcessRequest](interfaces/ProcessRequest.md)
- [PutObjectInput](interfaces/PutObjectInput.md)
- [ReadyAsset](interfaces/ReadyAsset.md)
- [Rejection](interfaces/Rejection.md)
- [RenditionOutput](interfaces/RenditionOutput.md)
- [StoredRendition](interfaces/StoredRendition.md)
- [TransformResult](interfaces/TransformResult.md)

## Type Aliases

- [Awaitable](type-aliases/Awaitable.md)
- [EmitRendition](type-aliases/EmitRendition.md)
- [ProcessResult](type-aliases/ProcessResult.md)
- [RenditionKeyBuilder](type-aliases/RenditionKeyBuilder.md)

## Variables

- [defaultRenditionKey](variables/defaultRenditionKey.md)

## Functions

- [asError](functions/asError.md)
- [markProcessingFailed](functions/markProcessingFailed.md)
- [processMediaAsset](functions/processMediaAsset.md)
