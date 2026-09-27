[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / @renditionkit/image

# @renditionkit/image

Validated, bounded, colour-managed image renditions powered by Sharp.

```sh
pnpm add @renditionkit/core @renditionkit/image
```

```ts
import { createImageEngine } from "@renditionkit/image";

const engine = createImageEngine({
  widths: [400, 800, 1600, 2400],
  formats: ["avif", "webp"],
});
```

## Interfaces

- [ImageEngineOptions](interfaces/ImageEngineOptions.md)
- [ImageInspectionMetadata](interfaces/ImageInspectionMetadata.md)
- [ImageTransformMetadata](interfaces/ImageTransformMetadata.md)

## Type Aliases

- [ImageRenditionFormat](type-aliases/ImageRenditionFormat.md)

## Variables

- [DEFAULT\_IMAGE\_WIDTHS](variables/DEFAULT_IMAGE_WIDTHS.md)

## Functions

- [createImageEngine](functions/createImageEngine.md)
- [sniffImageContentType](functions/sniffImageContentType.md)
- [widthsForSource](functions/widthsForSource.md)
