[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / processMediaAsset

# Function: processMediaAsset()

> **processMediaAsset**(`request`, `runtime`): `Promise`\<[`ProcessResult`](../type-aliases/ProcessResult.md)\>

Defined in: [packages/core/src/process.ts:53](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/process.ts#L53)

Process one durable asset. Unexpected errors are rethrown for the queue to retry.

## Parameters

### request

[`ProcessRequest`](../interfaces/ProcessRequest.md)

### runtime

[`MediaRuntime`](../interfaces/MediaRuntime.md)

## Returns

`Promise`\<[`ProcessResult`](../type-aliases/ProcessResult.md)\>
