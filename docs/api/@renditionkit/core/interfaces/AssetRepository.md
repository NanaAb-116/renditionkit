[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / AssetRepository

# Interface: AssetRepository

Defined in: [packages/core/src/types.ts:112](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L112)

Application persistence boundary. RenditionKit never assumes a database schema.

## Methods

### findDuplicate()?

> `optional` **findDuplicate**(`asset`, `checksum`): `Promise`\<`string` \| `null`\>

Defined in: [packages/core/src/types.ts:132](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L132)

Omit to disable source-checksum deduplication.

#### Parameters

##### asset

[`MediaAsset`](MediaAsset.md)

##### checksum

`string`

#### Returns

`Promise`\<`string` \| `null`\>

---

### get()

> **get**(`assetId`): `Promise`\<[`MediaAsset`](MediaAsset.md) \| `null`\>

Defined in: [packages/core/src/types.ts:113](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L113)

#### Parameters

##### assetId

`string`

#### Returns

`Promise`\<[`MediaAsset`](MediaAsset.md) \| `null`\>

---

### markFailed()

> **markFailed**(`assetId`, `failure`): `Promise`\<`void`\>

Defined in: [packages/core/src/types.ts:130](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L130)

Must not overwrite a row that has already reached its successful terminal state.

#### Parameters

##### assetId

`string`

##### failure

[`ProcessingFailure`](ProcessingFailure.md)

#### Returns

`Promise`\<`void`\>

---

### markProcessing()

> **markProcessing**(`asset`, `context`): `Promise`\<`boolean` \| `void`\>

Defined in: [packages/core/src/types.ts:115](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L115)

Return false when another attempt or a terminal state owns the asset.

#### Parameters

##### asset

[`MediaAsset`](MediaAsset.md)

##### context

[`ProcessingContext`](ProcessingContext.md)

#### Returns

`Promise`\<`boolean` \| `void`\>

---

### markReady()

> **markReady**(`asset`, `ready`, `context`): `Promise`\<`void`\>

Defined in: [packages/core/src/types.ts:119](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L119)

#### Parameters

##### asset

[`MediaAsset`](MediaAsset.md)

##### ready

[`ReadyAsset`](ReadyAsset.md)

##### context

[`ProcessingContext`](ProcessingContext.md)

#### Returns

`Promise`\<`void`\>

---

### markRejected()

> **markRejected**(`asset`, `rejection`, `context`): `Promise`\<`void`\>

Defined in: [packages/core/src/types.ts:124](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L124)

#### Parameters

##### asset

[`MediaAsset`](MediaAsset.md)

##### rejection

[`Rejection`](Rejection.md)

##### context

[`ProcessingContext`](ProcessingContext.md)

#### Returns

`Promise`\<`void`\>

---

### reapStalled()?

> `optional` **reapStalled**(`before`): `Promise`\<`number`\>

Defined in: [packages/core/src/types.ts:137](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L137)

Optional hard-kill recovery hook. Mark attempts started before `before` as
failed, without overwriting assets that have since become ready.

#### Parameters

##### before

`Date`

#### Returns

`Promise`\<`number`\>
