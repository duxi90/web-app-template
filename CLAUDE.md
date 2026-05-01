# CLAUDE.md

Guidance for Claude Code when working in this repository.

<!-- seed-only:start -->

## Seed-mode

If a user has pointed you at this repo and asked to **initialize a new project
from this template**, you're in seed mode. Read `INIT.md` first, then
`init/SYSTEM_PROMPT.md`, then run the bootstrap protocol.

The fastest path: type `/bootstrap` (or `/bootstrap --blank`). The slash
command at `.claude/commands/bootstrap.md` loads the system prompt and walks
the interview using `AskUserQuestion`.

The slash command, `init/`, and these "seed-only" sections are removed at
the end of the bootstrap; in a finalized project, none of this exists.

<!-- seed-only:end -->

## Project-mode

`{{PROJECT_NAME}}` — Next.js + TypeScript on Bun, monorepo with Turborepo.

### Commands

```bash
bun run dev         # all apps, hot-reload
bun run build       # turbo orchestrates per-package builds
bun run lint        # ESLint flat config
bun run typecheck   # tsc --noEmit per package
bun run test        # vitest
bun run format      # prettier --write
```

### Layout

```text
apps/                         # one or more Next.js apps (web-ssr, web-static, …)
packages/ui                   # shared UI components (shadcn/ui or bare Tailwind)
packages/content              # content layer (Velite or hand-rolled gray-matter)
packages/config-typescript    # tsconfig presets (base, nextjs, library, node)
packages/config-tailwind      # Tailwind v4 globals.css + postcss config
packages/config-eslint        # flat ESLint configs (base, next, library)
infra/                        # Terraform (if applied)
.github/workflows/            # CI + deploy pipelines
```

### Conventions

- **TypeScript strict.** `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax`, `noImplicitOverride` are all on. Don't use `any`.
- **Server/client split.** `*-server.ts` for Node-only modules; client-safe
  types in sibling files.
- **Catalog deps.** Cross-package shared versions live in root
  `package.json`'s `workspaces.catalog`. Workspaces reference them with
  `"<dep>": "catalog:"`.
- **Content via `{{PACKAGE_SCOPE}}/content` only.** Never read `.md` from
  inside an app directly.

### Content engine notes

- If you used **Velite** (default), the schema in `packages/content/velite.config.ts`
  uses `s.markdown()` — body is HTML at runtime. Render with
  `<div dangerouslySetInnerHTML={{ __html: post.body }} />`.
- To upgrade to **MDX with JSX in content**, swap `s.markdown()` for `s.mdx()` and
  evaluate the emitted JS source at runtime (e.g. via `next-mdx-remote/rsc` or a
  small `new Function(react, jsx)` shim wrapping the body string).
- If you used **`content-mdx-only`**, content lives in
  `packages/content/posts/*.md` and is read at request/build time via
  `getAllPosts()` / `getPostBySlug()` in `packages/content/src/posts-server.ts`.

### Architecture (specific to this project)

> Replace this section after bootstrap with project-specific notes:
> data flow, route structure, deployment specifics, gotchas.
