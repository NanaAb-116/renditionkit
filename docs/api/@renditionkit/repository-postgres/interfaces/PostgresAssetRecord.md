[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/repository-postgres](../README.md) / PostgresAssetRecord

# Interface: PostgresAssetRecord

Defined in: repository-postgres/src/index.ts:24

A durable application-owned record that points at one original media object.

## Extends

- [`MediaAsset`](../../core/interfaces/MediaAsset.md)

## Properties

### attempt

> **attempt**: `number`

Defined in: repository-postgres/src/index.ts:36

---

### attributes

> **attributes**: `Readonly`\<`Record`\<`string`, `unknown`\>\>

Defined in: repository-postgres/src/index.ts:26

Opaque application data passed back to repository methods and hooks.

#### Overrides

[`MediaAsset`](../../core/interfaces/MediaAsset.md).[`attributes`](../../core/interfaces/MediaAsset.md#attributes)

---

### checksum

> **checksum**: `string` \| `null`

Defined in: repository-postgres/src/index.ts:28

---

### createdAt

> **createdAt**: `Date`

Defined in: repository-postgres/src/index.ts:39

---

### error

> **error**: [`Rejection`](../../core/interfaces/Rejection.md) \| \{ `code`: `"processing_failed"`; `message`: `string`; \} \| `null`

Defined in: repository-postgres/src/index.ts:38

---

### id

> **id**: `string`

Defined in: core/dist/types.d.ts:4

#### Inherited from

[`MediaAsset`](../../core/interfaces/MediaAsset.md).[`id`](../../core/interfaces/MediaAsset.md#id)

---

### inspection

> **inspection**: [`MediaInspection`](../../core/interfaces/MediaInspection.md) \| `null`

Defined in: repository-postgres/src/index.ts:31

---

### jobId

> **jobId**: `string` \| `null`

Defined in: repository-postgres/src/index.ts:37

---

### mediaType

> **mediaType**: `string`

Defined in: core/dist/types.d.ts:6

Engine discriminator such as `image` today or `video` in the future.

#### Inherited from

[`MediaAsset`](../../core/interfaces/MediaAsset.md).[`mediaType`](../../core/interfaces/MediaAsset.md#mediatype)

---

### namespace

> **namespace**: `string`

Defined in: repository-postgres/src/index.ts:25

Isolates keys and deduplication domains in multi-tenant applications.

#### Overrides

[`MediaAsset`](../../core/interfaces/MediaAsset.md).[`namespace`](../../core/interfaces/MediaAsset.md#namespace)

---

### processingStartedAt

> **processingStartedAt**: `Date` \| `null`

Defined in: repository-postgres/src/index.ts:35

---

### renditions

> **renditions**: readonly [`StoredRendition`](../../core/interfaces/StoredRendition.md)[] \| `null`

Defined in: repository-postgres/src/index.ts:32

---

### renditionVersion

> **renditionVersion**: `number`

Defined in: repository-postgres/src/index.ts:34

---

### sourceBytes

> **sourceBytes**: `number` \| `null`

Defined in: repository-postgres/src/index.ts:29

---

### sourceContentType

> **sourceContentType**: `string` \| `null`

Defined in: repository-postgres/src/index.ts:30

---

### sourceKey

> **sourceKey**: `string`

Defined in: core/dist/types.d.ts:8

Object key understood by the configured storage adapter.

#### Inherited from

[`MediaAsset`](../../core/interfaces/MediaAsset.md).[`sourceKey`](../../core/interfaces/MediaAsset.md#sourcekey)

---

### status

> **status**: [`AssetStatus`](../type-aliases/AssetStatus.md)

Defined in: repository-postgres/src/index.ts:27

---

### transformMetadata

> **transformMetadata**: `Readonly`\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: repository-postgres/src/index.ts:33

---

### updatedAt

> **updatedAt**: `Date`

Defined in: repository-postgres/src/index.ts:40
