[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / markProcessingFailed

# Function: markProcessingFailed()

> **markProcessingFailed**(`repository`, `assetId`, `error`, `attempts`, `maxMessageLength?`): `Promise`\<`void`\>

Defined in: [packages/core/src/process.ts:225](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/process.ts#L225)

Persist the terminal failure only after the queue adapter has exhausted retries.

## Parameters

### repository

[`AssetRepository`](../interfaces/AssetRepository.md)

### assetId

`string`

### error

`unknown`

### attempts

`number`

### maxMessageLength?

`number` = `500`

## Returns

`Promise`\<`void`\>
