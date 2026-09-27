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
