[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / OriginalSource

# Interface: OriginalSource

Defined in: [packages/core/src/types.ts:62](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L62)

Replayable access to an original; engines choose buffering or streaming.

## Properties

### key

> **key**: `string`

Defined in: [packages/core/src/types.ts:63](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L63)

---

### stream?

> `optional` **stream?**: () => `Promise`\<[`ObjectByteStream`](ObjectByteStream.md)\>

Defined in: [packages/core/src/types.ts:66](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L66)

Present when the storage adapter can stream large originals.

#### Returns

`Promise`\<[`ObjectByteStream`](ObjectByteStream.md)\>

## Methods

### read()

> **read**(): `Promise`\<[`GetObjectResult`](GetObjectResult.md)\>

Defined in: [packages/core/src/types.ts:64](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L64)

#### Returns

`Promise`\<[`GetObjectResult`](GetObjectResult.md)\>
