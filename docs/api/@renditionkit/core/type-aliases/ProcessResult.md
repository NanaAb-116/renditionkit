[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / ProcessResult

# Type Alias: ProcessResult

> **ProcessResult** = \{ `assetId`: `string`; `ready`: [`ReadyAsset`](../interfaces/ReadyAsset.md); `status`: `"ready"`; \} \| \{ `assetId`: `string`; `rejection`: [`Rejection`](../interfaces/Rejection.md); `status`: `"rejected"`; \} \| \{ `assetId`: `string`; `reason`: `"asset_not_found"` \| `"repository_declined"`; `status`: `"skipped"`; \}

Defined in: [packages/core/src/types.ts:198](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L198)
