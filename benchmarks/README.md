# Image memory benchmark

The fixture generator and measured transform run in separate processes. This
prevents fixture construction from contaminating the worker's maximum resident
set size.

```sh
pnpm benchmark:fixture -- ./benchmarks/fixture.jpg 6000 4000
pnpm benchmark:image -- ./benchmarks/fixture.jpg
```

The benchmark reports source bytes, emitted rendition bytes, duration, and the
process maximum resident set size. Run it in the same container and with the
same memory limit intended for production. It is a capacity-planning tool, not
a stable performance assertion in CI.

The generated fixture is ignored by Git.
