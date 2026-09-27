[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/bullmq](../README.md) / MediaJobData

# Interface: MediaJobData

Defined in: [types.ts:4](https://github.com/NanaAb-116/renditionkit/blob/main/packages/bullmq/src/types.ts#L4)

## Extended by

- [`DeadLetterData`](DeadLetterData.md)

## Properties

### assetId

> **assetId**: `string`

Defined in: [types.ts:5](https://github.com/NanaAb-116/renditionkit/blob/main/packages/bullmq/src/types.ts#L5)

---

### enqueueToken?

> `optional` **enqueueToken?**: `string`

Defined in: [types.ts:7](https://github.com/NanaAb-116/renditionkit/blob/main/packages/bullmq/src/types.ts#L7)

Internal token used to identify the winner of concurrent enqueue calls.
