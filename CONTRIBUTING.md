# Contributing

Thank you for contributing to RenditionKit.

1. Open an issue for substantial behavior or API changes.
2. Add tests that demonstrate the behavior being changed.
3. Run `pnpm check` before opening a pull request.
4. Add a Changeset for changes to published packages.

Keep the core queue-, database-, and vendor-neutral. Vendor integrations belong
in adapters, while media-specific processing belongs in engine packages.
