[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / MediaEngine

# Interface: MediaEngine

Defined in: [packages/core/src/types.ts:82](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L82)

A media-specific engine. Queue, storage, and database concerns stay outside it.

## Properties

### mediaType

> `readonly` **mediaType**: `string`

Defined in: [packages/core/src/types.ts:83](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L83)

---

### renditionVersion

> `readonly` **renditionVersion**: `number`

Defined in: [packages/core/src/types.ts:85](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L85)

Increment when key-compatible output semantics change.

## Methods

### prepare()

> **prepare**(`asset`, `source`): `Promise`\<[`PreparedMedia`](PreparedMedia.md)\>

Defined in: [packages/core/src/types.ts:86](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L86)

#### Parameters

##### asset

[`MediaAsset`](MediaAsset.md)

##### source

[`OriginalSource`](OriginalSource.md)

#### Returns

`Promise`\<[`PreparedMedia`](PreparedMedia.md)\>
