# @particle-academy/classroom

[![Fancified](art/fancified.svg)](https://particle.academy)

Classroom UX for the [Fancy Dev Kit](https://github.com/Particle-Academy) — the
course-taking and testing surface that renders online courses served by the
`particle-academy/laravel-courses` API.

Built **strictly on Fancy Dev Kit primitives** (`@particle-academy/react-fancy`):
`Card`, `Button`, `Heading`, `Text`, `Badge`, `Progress`, `Sidebar`,
`Breadcrumbs`, and friends. Raw HTML is limited to layout/inline scaffolding.

> **Status.** Bootstrapped from the needs of the GuardCard.net rebuild, then
> lifted into its own repo. It is now maintained as part of the Fancy Dev Kit.

<!-- fancy-agents-note:start -->
> **For agents.** Every Fancy package, this one included, is listed on the
> Fancy MCP catalog server at `https://ui.particle.academy/mcp` (streamable HTTP, no API key;
> MCP id `fancy-ui`), with install commands and docs. How an agent installs
> and uses this package is in [AGENTS.md](https://github.com/Particle-Academy/classroom/blob/main/AGENTS.md).
<!-- fancy-agents-note:end -->

## Install

```sh
npm install @particle-academy/classroom
```

Ships compiled to `dist/` (ESM + CJS + type declarations).

## What's inside

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
- `react` / `react-dom` (^19)
- `axios` (>= 1)

Working on this package's code? See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © Particle Academy
