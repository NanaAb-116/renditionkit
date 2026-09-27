[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/bullmq](../README.md) / DeadLetterData

# Interface: DeadLetterData

Defined in: [worker.ts:6](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/worker.ts#L6)

## Extends

- [`MediaJobData`](MediaJobData.md)

## Properties

### assetId

> **assetId**: `string`

Defined in: [types.ts:5](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/types.ts#L5)

#### Inherited from

[`MediaJobData`](MediaJobData.md).[`assetId`](MediaJobData.md#assetid)

---

### attempts

> **attempts**: `number`

Defined in: [worker.ts:10](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/worker.ts#L10)

---

### enqueueToken?

> `optional` **enqueueToken?**: `string`

Defined in: [types.ts:7](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/types.ts#L7)

Internal token used to identify the winner of concurrent enqueue calls.

#### Inherited from

[`MediaJobData`](MediaJobData.md).[`enqueueToken`](MediaJobData.md#enqueuetoken)

---

### error

> **error**: `string`

Defined in: [worker.ts:9](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/worker.ts#L9)

---

### failedAt

> **failedAt**: `string`

Defined in: [worker.ts:8](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/worker.ts#L8)

---

### jobId

> **jobId**: `string` \| `null`

Defined in: [worker.ts:7](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/bullmq/src/worker.ts#L7)
