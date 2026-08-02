# Changelog

Notable changes to `@particle-academy/classroom`.

**BREAKING** marks anything that can stop working on upgrade. This package is
pre-1.0, so breaking changes land in MINOR releases — read those entries before
upgrading.

---

## [Unreleased]

## 0.3.0 — 2026-08-02

### Fixed

- **BREAKING (visual) — the components no longer force light-theme colours, so
  they are usable on a dark host.** Every card carried `!bg-white` and every
  heading `!text-secondary-900`, both with Tailwind's important modifier.
  That mixed a **literal** background with a **semantic** foreground: on a host
  whose `secondary-900` is a light token — i.e. any dark theme — the result was
  **white text on a white card**, invisible, and un-overridable because of the
  `!`.

  Found by dogfooding: the Fancy UI showcase mounted `CurriculumOverview` and
  every heading disappeared. It had gone unnoticed because the only other
  consumer runs a light theme, where the forced colours happened to match.

  35 colour overrides removed across `CurriculumOverview`, `CoursePlayer`,
  `LessonView`, `QuestionRenderer` and `TestRunner`. They now inherit
  react-fancy's `Card` / `Heading` / `Text` defaults, which already carry
  `dark:` variants. Structural overrides (`!rounded-xl`, `!shadow-sm`,
  spacing) and brand buttons (`!bg-brand` + `!text-white`, legible either way)
  are untouched.

  **What you must DO: probably nothing.** On a light theme the rendered colours
  are the same — react-fancy's defaults are what the forced values were
  imitating. On a dark theme the components now work, where before they were
  unreadable. If you were deliberately relying on a white card inside a dark
  host, set it yourself on the wrapper.

- **`CertificateView` is now literal throughout.** It already drew cream stock
  (`bg-[#fdfaf3]`) and a gold rule with fixed values, then used semantic
  `secondary-900/700` for the text — so on a dark host the ink turned light and
  vanished against its own paper. A certificate is a paper artifact and should
  look identical on every theme; its colours are now all literal.

### Added

- `AGENTS.md`, and a note that Tailwind v4 consumers must `@source` the
  installed **dist** — these packages ship compiled, so scanning `src` (or
  nothing) yields correct markup with none of its classes generated, and no
  error anywhere.

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
