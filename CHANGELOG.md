# Changelog

Notable changes to `@particle-academy/classroom`.

**BREAKING** marks anything that can stop working on upgrade. This package is
pre-1.0, so breaking changes land in MINOR releases — read those entries before
upgrading.

---

## [Unreleased]

### Fixed

- **The publish workflow could not publish.** It ran
  `npx -y npm@latest publish --provenance`, and `npm@latest` now resolves to
  12.0.2 — npm 12 broke the `--provenance`/sigstore path, which is why the rest
  of the kit pins `11.18.0`. Latent rather than visible, because a publish
  workflow only runs on a tag: it would have surfaced as a failed release.

### Added

- This changelog. Entries start here rather than being reconstructed for
  0.1.0 → 0.2.0 after the fact.

---

## 0.2.0 and earlier

Published to npm before this changelog existed. See the git history.
