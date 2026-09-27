[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / ObjectStorage

# Interface: ObjectStorage

Defined in: [packages/core/src/types.ts:154](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L154)

Minimal object-storage contract; works with S3, R2, MinIO, filesystems, or memory.

## Methods

### delete()?

> `optional` **delete**(`key`): `Promise`\<`void`\>

Defined in: [packages/core/src/types.ts:159](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L159)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

---

### get()

> **get**(`key`): `Promise`\<[`GetObjectResult`](GetObjectResult.md)\>

Defined in: [packages/core/src/types.ts:155](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L155)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<[`GetObjectResult`](GetObjectResult.md)\>

---

### put()

> **put**(`input`): `Promise`\<`void`\>

Defined in: [packages/core/src/types.ts:158](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L158)

#### Parameters

##### input

[`PutObjectInput`](PutObjectInput.md)

#### Returns

`Promise`\<`void`\>

---

### stream()?

> `optional` **stream**(`key`): `Promise`\<[`ObjectByteStream`](ObjectByteStream.md)\>

Defined in: [packages/core/src/types.ts:157](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L157)

Optional streaming path for engines that should not buffer large originals.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<[`ObjectByteStream`](ObjectByteStream.md)\>
