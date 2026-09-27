[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/repository-postgres](../README.md) / PostgresAssetRepository

# Class: PostgresAssetRepository

Defined in: repository-postgres/src/index.ts:125

Application persistence boundary. RenditionKit never assumes a database schema.

## Implements

- [`AssetRepository`](../../core/interfaces/AssetRepository.md)

## Constructors

### Constructor

> **new PostgresAssetRepository**(`database`, `options?`): `PostgresAssetRepository`

Defined in: repository-postgres/src/index.ts:129

#### Parameters

##### database

[`Queryable`](../interfaces/Queryable.md)

##### options?

[`PostgresRepositoryOptions`](../interfaces/PostgresRepositoryOptions.md) = `{}`

#### Returns

`PostgresAssetRepository`

## Methods

### create()

> **create**(`input`): `Promise`\<[`PostgresAssetRecord`](../interfaces/PostgresAssetRecord.md)\>

Defined in: repository-postgres/src/index.ts:134

#### Parameters

##### input

[`CreatePostgresAssetInput`](../interfaces/CreatePostgresAssetInput.md)

#### Returns

`Promise`\<[`PostgresAssetRecord`](../interfaces/PostgresAssetRecord.md)\>

---

### findDuplicate()

> **findDuplicate**(`asset`, `checksum`): `Promise`\<`string` \| `null`\>

Defined in: repository-postgres/src/index.ts:272

Omit to disable source-checksum deduplication.

#### Parameters

##### asset

[`MediaAsset`](../../core/interfaces/MediaAsset.md)

##### checksum

`string`

#### Returns

`Promise`\<`string` \| `null`\>

#### Implementation of

[`AssetRepository`](../../core/interfaces/AssetRepository.md).[`findDuplicate`](../../core/interfaces/AssetRepository.md#findduplicate)

---

### get()

> **get**(`assetId`): `Promise`\<[`MediaAsset`](../../core/interfaces/MediaAsset.md) \| `null`\>

Defined in: repository-postgres/src/index.ts:160

#### Parameters

##### assetId

`string`

#### Returns

`Promise`\<[`MediaAsset`](../../core/interfaces/MediaAsset.md) \| `null`\>

#### Implementation of

[`AssetRepository`](../../core/interfaces/AssetRepository.md).[`get`](../../core/interfaces/AssetRepository.md#get)

---

### getRecord()

> **getRecord**(`assetId`): `Promise`\<[`PostgresAssetRecord`](../interfaces/PostgresAssetRecord.md) \| `null`\>

Defined in: repository-postgres/src/index.ts:152

#### Parameters

##### assetId

`string`

#### Returns

`Promise`\<[`PostgresAssetRecord`](../interfaces/PostgresAssetRecord.md) \| `null`\>

---

### markFailed()

> **markFailed**(`assetId`, `failure`): `Promise`\<`void`\>

Defined in: repository-postgres/src/index.ts:255

Must not overwrite a row that has already reached its successful terminal state.

#### Parameters

##### assetId

`string`

##### failure

[`ProcessingFailure`](../../core/interfaces/ProcessingFailure.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AssetRepository`](../../core/interfaces/AssetRepository.md).[`markFailed`](../../core/interfaces/AssetRepository.md#markfailed)

---

### markProcessing()

> **markProcessing**(`asset`, `context`): `Promise`\<`boolean`\>

Defined in: repository-postgres/src/index.ts:174

Return false when another attempt or a terminal state owns the asset.

#### Parameters

##### asset

[`MediaAsset`](../../core/interfaces/MediaAsset.md)

##### context

[`ProcessingContext`](../../core/interfaces/ProcessingContext.md)

#### Returns

`Promise`\<`boolean`\>

#### Implementation of

[`AssetRepository`](../../core/interfaces/AssetRepository.md).[`markProcessing`](../../core/interfaces/AssetRepository.md#markprocessing)

---

### markReady()

> **markReady**(`asset`, `ready`, `_context`): `Promise`\<`void`\>

Defined in: repository-postgres/src/index.ts:192

#### Parameters

##### asset

[`MediaAsset`](../../core/interfaces/MediaAsset.md)

##### ready

[`ReadyAsset`](../../core/interfaces/ReadyAsset.md)

##### \_context

[`ProcessingContext`](../../core/interfaces/ProcessingContext.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AssetRepository`](../../core/interfaces/AssetRepository.md).[`markReady`](../../core/interfaces/AssetRepository.md#markready)

---

### markRejected()

> **markRejected**(`asset`, `rejection`, `_context`): `Promise`\<`void`\>

Defined in: repository-postgres/src/index.ts:235

#### Parameters

##### asset

[`MediaAsset`](../../core/interfaces/MediaAsset.md)

##### rejection

[`Rejection`](../../core/interfaces/Rejection.md)

##### \_context

[`ProcessingContext`](../../core/interfaces/ProcessingContext.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AssetRepository`](../../core/interfaces/AssetRepository.md).[`markRejected`](../../core/interfaces/AssetRepository.md#markrejected)

---

### reapStalled()

> **reapStalled**(`before`): `Promise`\<`number`\>

Defined in: repository-postgres/src/index.ts:286

Optional hard-kill recovery hook. Mark attempts started before `before` as
failed, without overwriting assets that have since become ready.

#### Parameters

##### before

`Date`

#### Returns

`Promise`\<`number`\>

#### Implementation of

[`AssetRepository`](../../core/interfaces/AssetRepository.md).[`reapStalled`](../../core/interfaces/AssetRepository.md#reapstalled)
