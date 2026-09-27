# Release checklist

Publishing is intentionally a maintainer action. The repository does not publish
from an untrusted pull request.

1. Confirm the `renditionkit` npm name. The unscoped package is self-contained;
   create or join the `renditionkit` npm organization only if the optional
   scoped packages will also be published.
2. Add author and funding metadata if desired.
3. Enable npm two-factor authentication and configure trusted publishing for the
   release workflow.
4. Add a Changeset for every public change.
5. Run `pnpm install --frozen-lockfile && pnpm check` on Node 20, 22, and 24.
6. Run the real Redis, PostgreSQL, and MinIO integration tests and exercise the
   Docker reference app with an actual upload.
7. Review `pnpm pack --dry-run` output for every package. Confirm that only
   distribution files, license, readme, and required schema files are included.
8. Run `pnpm version-packages`, review the generated changelogs and lockfile,
   and merge that result through the normal review process.
9. Publish the standalone package with provenance through the manual release
   workflow, then test installation in a clean project. Use `pnpm release:all`
   only after the npm scope is configured and every scoped package is intended
   to ship.

No release step should introduce generated attribution trailers or change the
authorship of existing work.
