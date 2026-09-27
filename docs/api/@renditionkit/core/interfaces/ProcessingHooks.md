[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/core](../README.md) / ProcessingHooks

# Interface: ProcessingHooks

Defined in: [packages/core/src/types.ts:169](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L169)

## Methods

### onReady()?

> `optional` **onReady**(`asset`, `ready`): [`Awaitable`](../type-aliases/Awaitable.md)\<`void`\>

Defined in: [packages/core/src/types.ts:170](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L170)

#### Parameters

##### asset

[`MediaAsset`](MediaAsset.md)

##### ready

[`ReadyAsset`](ReadyAsset.md)

#### Returns

[`Awaitable`](../type-aliases/Awaitable.md)\<`void`\>

---

### onRejected()?

> `optional` **onRejected**(`asset`, `rejection`): [`Awaitable`](../type-aliases/Awaitable.md)\<`void`\>

Defined in: [packages/core/src/types.ts:171](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/core/src/types.ts#L171)

#### Parameters

##### asset

[`MediaAsset`](MediaAsset.md)

##### rejection

[`Rejection`](Rejection.md)

#### Returns

[`Awaitable`](../type-aliases/Awaitable.md)\<`void`\>
