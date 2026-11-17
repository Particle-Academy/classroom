# Contributing to @particle-academy/classroom

Notes for anyone, human or agent, working ON this package's code. How to USE the
package is in [AGENTS.md](./AGENTS.md); what it is, is in [README.md](./README.md).
`CLAUDE.md` is a symlink to this file, so Claude Code reads these notes when it
works in this repo.

## Build

Built with [`tsup`](https://tsup.egoist.dev) to `dist/` (ESM + CJS + type
declarations). `npm run build` locally; `npm run lint` is `tsc --noEmit`. CI
type-checks and builds on every push, and tagging `v*.*.*` publishes to npm.

## Local development

Consumed side-by-side inside the GuardCard.net `.agi` envelope: the host app
(`repos/gc-website`) resolves the `@classroom` alias to this repo's `./src`, so
edits here are picked up on the host's next build (`reload`) — no rebuild of this
package needed during local dev.

## Rules

- **Controlled, per the Fancy component contract.** `value` + `onChange`; no
  internal-only state an agent might need to read or write. Stable `data-*`
  handles on interactive elements — agents never guess DOM.
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
