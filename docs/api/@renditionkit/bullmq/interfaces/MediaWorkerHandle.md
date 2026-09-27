[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/bullmq](../README.md) / MediaWorkerHandle

# Interface: MediaWorkerHandle

Defined in: [worker.ts:13](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/worker.ts#L13)

## Properties

### deadLetterQueue

> `readonly` **deadLetterQueue**: `Queue`\<[`DeadLetterData`](DeadLetterData.md)\>

Defined in: [worker.ts:15](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/worker.ts#L15)

---

### worker

> `readonly` **worker**: `Worker`\<[`MediaJobData`](MediaJobData.md)\>

Defined in: [worker.ts:14](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/worker.ts#L14)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [worker.ts:16](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/worker.ts#L16)

#### Returns

`Promise`\<`void`\>
