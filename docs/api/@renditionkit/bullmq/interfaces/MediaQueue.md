[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/bullmq](../README.md) / MediaQueue

# Interface: MediaQueue

Defined in: [queue.ts:24](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/queue.ts#L24)

## Properties

### queue

> `readonly` **queue**: `Queue`\<[`MediaJobData`](MediaJobData.md)\>

Defined in: [queue.ts:25](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/queue.ts#L25)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [queue.ts:30](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/queue.ts#L30)

#### Returns

`Promise`\<`void`\>

---

### enqueue()

> **enqueue**(`assetId`, `options?`): `Promise`\<\{ `created`: `boolean`; `job`: `Job`\<[`MediaJobData`](MediaJobData.md)\>; \}\>

Defined in: [queue.ts:26](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/queue.ts#L26)

#### Parameters

##### assetId

`string`

##### options?

[`EnqueueOptions`](EnqueueOptions.md)

#### Returns

`Promise`\<\{ `created`: `boolean`; `job`: `Job`\<[`MediaJobData`](MediaJobData.md)\>; \}\>
