# @particle-academy/classroom

Classroom UX for the [Fancy UI](https://github.com/Particle-Academy) kit — the
course-taking and testing surface that renders online courses served by the
`particle-academy/laravel-courses` API.

Built **strictly on Fancy UI primitives** (`@particle-academy/react-fancy`):
`Card`, `Action`, `Heading`, `Text`, `Badge`, `Progress`, `Sidebar`,
`Breadcrumbs`, and friends. Raw HTML is limited to layout/inline scaffolding.

> **Status.** Bootstrapped from the needs of the GuardCard.net rebuild, then
> lifted into its own repo. It will eventually be handed off to the Fancy agent
> to own and maintain as part of the Fancy UI kit.

## What's inside

Source-only package — host apps import from `./src` and bundle it (no build
step of its own yet).

| Export | Purpose |
| --- | --- |
| `CurriculumOverview` | Course outline / module + lesson map |
| `CoursePlayer` | The full course-taking shell (sidebar + lesson/test panes) |
| `LessonView` | Renders a single lesson's content |
| `TestRunner` | Drives a test attempt end to end |
| `QuestionRenderer` | Renders one question + captures its answer |
| `CertificateView` | Completion certificate |
| `CoursesClient` | Typed axios client for the `laravel-courses` API |

Plus the full domain type surface (`Course`, `Lesson`, `Test`, `Enrollment`,
`Certificate`, …) — see [`src/index.ts`](./src/index.ts).

```ts
import { CoursePlayer, CoursesClient } from '@particle-academy/classroom';
```

## Peer dependencies

The host app provides these:

- `@particle-academy/react-fancy`
- `react` / `react-dom` (>= 18)
- `axios` (>= 1)

## Local development

Consumed side-by-side inside the GuardCard.net `.agi` envelope: the host app
(`repos/gc-website`) resolves the `@classroom` alias to this repo's `./src`, so
edits here are picked up on the host's next build (`reload`).

## License

TODO — set to match the rest of the Fancy UI kit before first publish.
