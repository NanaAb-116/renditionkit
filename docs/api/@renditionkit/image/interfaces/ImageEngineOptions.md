[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/image](../README.md) / ImageEngineOptions

# Interface: ImageEngineOptions

Defined in: [engine.ts:17](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L17)

## Properties

### animated?

> `optional` **animated?**: `"reject"` \| `"first-frame"`

Defined in: [engine.ts:24](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L24)

Animated sources are rejected by default rather than silently losing frames.

---

### formats?

> `optional` **formats?**: readonly [`ImageRenditionFormat`](../type-aliases/ImageRenditionFormat.md)[]

Defined in: [engine.ts:19](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L19)

---

### generateThumbhash?

> `optional` **generateThumbhash?**: `boolean`

Defined in: [engine.ts:25](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L25)

---

### maxInputPixels?

> `optional` **maxInputPixels?**: `number`

Defined in: [engine.ts:21](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L21)

---

### quality?

> `optional` **quality?**: `Partial`\<`Record`\<[`ImageRenditionFormat`](../type-aliases/ImageRenditionFormat.md), `number`\>\>

Defined in: [engine.ts:28](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L28)

---

### renditionVersion?

> `optional` **renditionVersion?**: `number`

Defined in: [engine.ts:20](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L20)

---

### sharpConcurrency?

> `optional` **sharpConcurrency?**: `number`

Defined in: [engine.ts:27](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L27)

Global libvips concurrency. Defaults to one thread per operation.

---

### validationWidth?

> `optional` **validationWidth?**: `number`

Defined in: [engine.ts:22](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L22)

---

### widths?

> `optional` **widths?**: readonly `number`[]

Defined in: [engine.ts:18](https://github.com/NanaAb-116/renditionkit/blob/7d57dadab6320d563c460f656947b5deae76d0ee/packages/image/src/engine.ts#L18)
