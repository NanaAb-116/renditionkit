[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / PreparedMedia

# Interface: PreparedMedia

Defined in: [packages/core/src/types.ts:73](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L73)

Engine-owned prepared state. An image engine can retain a bounded buffer;
a video engine can retain a temporary file path and dispose it afterward.

## Properties

### checksum

> **checksum**: `string`

Defined in: [packages/core/src/types.ts:74](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L74)

---

### inspection

> **inspection**: [`MediaInspection`](MediaInspection.md)

Defined in: [packages/core/src/types.ts:76](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L76)

---

### sourceBytes

> **sourceBytes**: `number`

Defined in: [packages/core/src/types.ts:75](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L75)

## Methods

### dispose()?

> `optional` **dispose**(): [`Awaitable`](../type-aliases/Awaitable.md)\<`void`\>

Defined in: [packages/core/src/types.ts:78](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L78)

#### Returns

[`Awaitable`](../type-aliases/Awaitable.md)\<`void`\>

---

### transform()

> **transform**(`emit`): `Promise`\<[`TransformResult`](TransformResult.md)\>

Defined in: [packages/core/src/types.ts:77](https://github.com/NanaAb-116/renditionkit/blob/main/packages/core/src/types.ts#L77)

#### Parameters

##### emit

[`EmitRendition`](../type-aliases/EmitRendition.md)

#### Returns

`Promise`\<[`TransformResult`](TransformResult.md)\>
