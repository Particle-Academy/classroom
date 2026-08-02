# Changelog

Notable changes to `@particle-academy/classroom`.

**BREAKING** marks anything that can stop working on upgrade. This package is
pre-1.0, so breaking changes land in MINOR releases — read those entries before
upgrading.

---

## [Unreleased]

## 0.4.2 — 2026-08-02

### Fixed

- **The test result banner was unreadable on a dark host.** `TestResult` drew
  its pass/fail/pending tint with literal light values (`bg-red-50`,
  `bg-emerald-50`, `bg-blue-50`) and put a theme-aware heading on top, so on a
  dark theme the text went light and vanished into the pale background — a
  learner saw an icon and a subtitle where the verdict should be. The same
  literal-background-plus-semantic-foreground collision as 0.3.0, in a spot with
  no `!` to grep for; found by actually sitting a test in a browser. All three
  tints and their icon chips now carry dark variants.

## 0.4.1 — 2026-08-02

### Fixed

- The per-card action used a zinc ghost until a course was started, which made
  the primary action on every card read as disabled — an unstarted course is the
  one thing you most want clicked. It now carries the `accent` in both states,
  ghost before you start and solid once you have.

## 0.4.0 — 2026-08-02

### Fixed

- **Buttons rendered as bare grey slabs.** They forced
  `!bg-brand hover:!bg-primary-600 !text-white` — tokens that, until
  react-fancy 4.19.0, **nothing defined.** Tailwind generated no such utility,
  the class resolved to nothing, and every call to action came out unstyled.
  Colour now comes from react-fancy's *props* (`<Button color>`,
  `<Badge color>`, `<Progress color>`), which is what they are for.

### Added

- **The components are restylable, three ways.** A library that hardcodes its
  look is a library you fight:
  - **`accent`** — any react-fancy `Color`, driving buttons, progress and
    highlights. Defaults to `violet`.
  - **`classNames`** — per-slot class overrides (`root`, `hero`, `card`,
    `cardTitle`, `cardAction`, …), plus `className` on the root.
  - **`data-classroom-*` attributes** on every slot, so a host can style from
    its own stylesheet without touching props.
- `startLabel`, for hosts that do not say "Start".

### Changed

- **No cosmetic `!important` anywhere.** Radius, shadow and spacing are left to
  react-fancy's defaults or to `classNames`. An `!important` inside a library is
  a decision taken away from the person consuming it — and the reason the
  previous version could not be corrected from outside.
- **A 0%-wide progress bar no longer renders under every card.** It said nothing
  the "Start" button did not, and made an untouched curriculum look broken.
  The bar appears once there is progress.
- Course cards gained a hierarchy: an index, a duration badge, three-line
  description clamping instead of two, a hover lift, and Continue / Review /
  Start depending on state.
- `peerDependencies` on react-fancy bounded to `>=4 <5`. It was `>=4`, with no
  upper bound at all, which silently accepts a future major that breaks it.

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
