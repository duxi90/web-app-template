# AGENTS.md — instructions for AI assistants

This file is read by AI assistants working in this repo (Cursor, Cline, Aider,
generic LLMs). Claude Code uses `CLAUDE.md` for the same purpose.

<!-- seed-only:start -->

## Seed-mode instructions (delete after bootstrap)

If a user has just pointed you at this repository's URL and asked you to
**initialize a new project from this template**, you are operating in
**seed mode**. Read `INIT.md` first, then `init/SYSTEM_PROMPT.md`, and follow
the bootstrap protocol there.

You may not have an `AskUserQuestion` tool. In that case:

- Ask each question as a numbered prose prompt and **wait for the user's reply**
  before asking the next.
- Echo the chosen option back ("→ static export") so there's a paper trail.
- All other rules in `init/SYSTEM_PROMPT.md` apply unchanged.

If the user only has a chat window (no shell), print the shell commands they
need to run. Pause after each command and ask them to paste the output before
proceeding.

<!-- seed-only:end -->

## Project-mode instructions (after bootstrap)

This is a `{{PROJECT_NAME}}` project — Next.js + TypeScript on Bun, built
from the [webapp-template] seed.

### Stack

- **Runtime/PM**: Bun ≥1.2 (workspaces + catalog)
- **Framework**: Next.js 16, React 19
- **Styling**: Tailwind CSS v4 (CSS-first config in `packages/config-tailwind`)
- **Content**: see `packages/content/` — schema in `velite.config.ts` (or
  `lib/*-server.ts` if the `content-mdx-only` recipe was applied)
- **Lint**: ESLint flat config rooted in `packages/config-eslint`
- **TS**: shared `tsconfig`s in `packages/config-typescript`

### Commands

```bash
bun run dev         # turbo run dev — starts every app
bun run build       # turbo run build
bun run lint        # turbo run lint
bun run typecheck   # turbo run typecheck
bun run test        # turbo run test
bun run format      # prettier --write .
```

### Conventions

- **Workspaces**: internal deps use `"workspace:*"`; shared third-party deps
  use `"<name>": "catalog:"`. Bump shared versions in the root `package.json`'s
  `workspaces.catalog`.
- **No `any`.** ESLint enforces this; do not silence with `// eslint-disable`.
- **Server-only code** lives in `*-server.ts` files. Client-safe types go in
  sibling files without the `-server` suffix.
- **Markdown content** goes under `packages/content/posts/` (or wherever your
  content recipe placed it). Never load `.md` from inside `app/` —
  always go through `{{PACKAGE_SCOPE}}/content`.

### Don't

- Don't add `// @ts-ignore` or `// @ts-expect-error` to silence type errors;
  fix the type instead.
- Don't introduce a new package without adding it to `workspaces.catalog` if
  any other workspace already uses it.
- Don't bypass `bun run lint` with `--no-verify` on commits.

[webapp-template]: https://github.com/{{REPO_OWNER}}/webapp-template
