# Using @particle-academy/classroom — guide for agents

How an agent installs and uses this package in a consumer app. What the package
is, is in [README.md](./README.md). Notes for working ON this repo's code are in
[CONTRIBUTING.md](./CONTRIBUTING.md).

The learner surface for `particle-academy/laravel-courses`: browse a curriculum,
work through a course, sit a test, collect a certificate.

## Install

```bash
npm install @particle-academy/classroom
```

- **Peers** (the host provides them): `@particle-academy/react-fancy`,
  `react ^19`, `react-dom ^19`, `axios >=1`. **Node:** `>=22`.
- **Tailwind v4 hosts need the `@source` line.** This package ships compiled;
  Tailwind must scan the installed `dist`, or you get correct markup with none of
  its classes generated and no error anywhere:

  ```css
  @source '../../node_modules/@particle-academy/classroom/dist/**/*.{js,cjs,mjs}';
  ```

## Find it on the Fancy MCP server

The catalog server is `https://ui.particle.academy/mcp` (streamable HTTP, no API
key; MCP id `fancy-ui`). This package's registry slugs (`package` =
`classroom`): `curriculum-overview`, `course-player`, `lesson-view`,
`test-runner`, `question-renderer`, `certificate-view`. Use
`install-instructions` / `get-component` with a slug, or `search-components`
("course", "quiz") to find them. Vendored source:
`npx fancy-cli@latest add <slug>`.

## API essentials

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
`AnswerValue` into the shape `submitAttempt` wants. The domain types (`Course`,
`Lesson`, `Test`, `Enrollment`, `Certificate`, ...) are exported from the root.

Components are controlled (`value` + `onChange`) and carry stable `data-*`
handles on interactive elements.

## Traps

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
- **`axios` is a peer**, so the host owns interceptors and auth headers.
