# Versioning and compatibility

RenditionKit follows semantic versioning independently for each published
package. A Changeset records every user-visible change and decides which
packages receive patch, minor, or major releases.

Before 1.0, a minor release may contain breaking API changes. Such changes must
still include a migration note. After 1.0, removals and incompatible changes
require a major release.

## Compatibility promises

- Packages support maintained Node.js releases beginning with Node 20.
- Public exports are only the paths declared in each package's `exports` map.
- TypeScript types are part of the public API.
- Database changes are additive within a major version. An incompatible schema
  change requires a documented migration and a major release.
- Serialized BullMQ job data remains readable throughout a major version.
- Object keys are deterministic for a given namespace, asset, rendition
  version, name, and extension.

## Engine evolution

Changing rendition settings does not rewrite an existing output in place.
Increment `renditionVersion`, deploy consumers capable of reading that version,
and then enqueue regeneration. This keeps old and new outputs independently
cacheable and allows rollback.

The future video engine will implement the existing `MediaEngine` contract. It
may add package-specific inspection and transformation metadata, but queue,
repository, and storage adapters do not need a video-specific interface.
