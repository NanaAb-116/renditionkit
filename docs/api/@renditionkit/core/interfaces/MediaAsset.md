[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / MediaAsset

# Interface: MediaAsset

Defined in: [packages/core/src/types.ts:4](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L4)

A durable application-owned record that points at one original media object.

## Extended by

- [`PostgresAssetRecord`](../../repository-postgres/interfaces/PostgresAssetRecord.md)

## Properties

### attributes?

> `optional` **attributes?**: `Readonly`\<`Record`\<`string`, `unknown`\>\>

Defined in: [packages/core/src/types.ts:13](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L13)

Opaque application data passed back to repository methods and hooks.

---

### id

> **id**: `string`

Defined in: [packages/core/src/types.ts:5](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L5)

---

### mediaType

> **mediaType**: `string`

Defined in: [packages/core/src/types.ts:7](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L7)

Engine discriminator such as `image` today or `video` in the future.

---

### namespace?

> `optional` **namespace?**: `string`

Defined in: [packages/core/src/types.ts:11](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L11)

Isolates keys and deduplication domains in multi-tenant applications.

---

### sourceKey

> **sourceKey**: `string`

Defined in: [packages/core/src/types.ts:9](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L9)

Object key understood by the configured storage adapter.
