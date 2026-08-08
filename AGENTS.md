# AGENTS.md — @particle-academy/classroom

The learner surface for `particle-academy/laravel-courses`: browse a curriculum,
work through a course, sit a test, collect a certificate. `CLAUDE.md` symlinks
here.

## The surface

| Component | Renders |
|---|---|
| `CurriculumOverview` | curriculum → its courses, with enrollment state |
| `CoursePlayer` | modules + lessons, progress, what's next |
| `LessonView` | one lesson (`text`, `video` or `mixed`) |
| `TestRunner` | an attempt: questions, answers, submission |
| `QuestionRenderer` | one question of any of the four types |
| `CertificateView` | an issued certificate + its verification code |

`CoursesClient` wraps the package's REST surface — `listCurriculums`, `enroll`,
`markLessonComplete`, `startAttempt`, `submitAttempt`, `issueCertificate`,
`certificatePdfUrl`. `answerValueToPayload()` converts a component's
`AnswerValue` into the shape `submitAttempt` wants.

## Rules

- **Controlled, per the Fancy component contract.** `value` + `onChange`; no
  internal-only state an agent might need to read or write. Stable `data-*`
  handles on interactive elements — agents never guess DOM.
- **`setLearner(id)` is a convenience, not authentication.** It sends the learner
  id with requests, and the server only honours it when the host has explicitly
  set `laravel-courses.allow_input_user_id` — which **defaults to false**,
  because when it was true any caller could claim to be any learner and every
  ownership check in the package became decorative. Assume auth middleware; do
  not design flows that depend on the fallback.
- **A test can be attached at course, module OR lesson level.** All three count
  toward progress as of laravel-courses 0.1.0. Don't assume course-level.
- **`passed` is nullable and that is meaningful.** An attempt containing a
  `short_answer` returns `passed: null` until a human grades it — *not* `false`.
  Rendering null as a failure tells a learner they failed a test they may well
  have passed. Show "awaiting grading".
- **Peer, not dependency, on `react-fancy`** (`>=4`). It was `>=4 <5`, and that
  cap is what stopped this package co-installing with react-fancy 5 when the kit
  0.5 floors shipped it — a resolver reading the new major as a conflict rather
  than an upgrade, reporting nothing. Sibling ranges do not cap the major here.
  `axios` is likewise a peer, so the host owns interceptors and auth headers.

## Testing

`npm test` (vitest + jsdom). 25 tests covering `answerValueToPayload` across all
four question types — it is the wire format a graded answer is submitted in, and
getting a shape wrong there marks a learner's correct answer wrong rather than
throwing — plus the video-embed allowlist.

Still uncovered and worth doing next: the **`passed: null`** rendering path. An
attempt containing a `short_answer` returns null until a human grades it, and
rendering null as a failure tells a learner they failed a test they may have
passed.

## Publishing

Pure OIDC via GitHub Actions Trusted Publishing — no tokens. `publish.yml` fires
on `v*.*.*` and needs `permissions: id-token: write`.

**npm is pinned to `11.18.0`, deliberately.** OIDC needs 11.5+, the runner ships
10.x, and `npm@latest` (12.x) broke `--provenance`/sigstore. This package once
carried `npm@latest` and **could not have published**; a publish workflow only
runs on a tag, so it stays invisible until a release fails.

## Tailwind v4 consumers — the `@source` line

This package ships **compiled**. Tailwind must scan the installed `dist`, or you
get correct markup with **none of its classes generated and no error anywhere**:

```css
@source '../../node_modules/@particle-academy/classroom/dist/**/*.{js,cjs,mjs}';
```

Reported by the GuardCard agent, who has hit this silent failure three times
across different Fancy packages. It is the single highest-value line in this
file for a Tailwind v4 host.

## Colour rules — read before adding a class

**Never force a colour with `!`.** Every card once carried `!bg-white` and every
heading `!text-secondary-900`. That mixes a **literal** background with a
**semantic** foreground, so on a dark host the text resolved light and rendered
white-on-white — invisible, and un-overridable because of the `!`. It survived
because the only consumer at the time ran a light theme.

- Let react-fancy's `Card` / `Heading` / `Text` supply colour. They already
  carry `dark:` variants; overriding them is what broke this.
- If a surface must look the same on every theme — `CertificateView` is paper —
  use **literal** values for foreground AND background. Never mix one of each.
- Structural overrides (`!rounded-xl`, `!shadow-sm`, spacing) are fine.
