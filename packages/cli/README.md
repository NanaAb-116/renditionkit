# @renditionkit/cli

Start a RenditionKit BullMQ worker from a JavaScript configuration module.

```sh
renditionkit-worker --config ./renditionkit.config.mjs
```

The configuration's default export is a `MediaWorkerOptions` object or an async
function that returns one.
