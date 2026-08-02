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
- **Peer, not dependency, on `react-fancy`** (`>=4 <5` — bounded; an unbounded
  peer silently accepts a future major that breaks you). `axios` is likewise a
  peer, so the host owns interceptors and auth headers.

## Testing

No suite yet — this package predates its own tests. The behaviour worth covering
first is `answerValueToPayload` across all four question types and the
`passed: null` rendering path, because both fail in ways that look like a
learner's fault rather than a bug.

## Publishing

Pure OIDC via GitHub Actions Trusted Publishing — no tokens. `publish.yml` fires
on `v*.*.*` and needs `permissions: id-token: write`.

**npm is pinned to `11.18.0`, deliberately.** OIDC needs 11.5+, the runner ships
10.x, and `npm@latest` (12.x) broke `--provenance`/sigstore. This package once
carried `npm@latest` and **could not have published**; a publish workflow only
runs on a tag, so it stays invisible until a release fails.
