# {{PROJECT_NAME}}

<!-- seed-only:start -->

Seed repo for Next.js + Cloudflare projects with an AI bootstrap agent.

> **Are you an LLM?** Read [`INIT.md`](./INIT.md). It's the front-door manifest.

## What it is

A monorepo seed that boots a working Next.js 16 + Tailwind v4 + Velite static
site on `bun install && bun run dev`. Pointing an AI agent at the repo runs an
interview that swaps in different "recipes" — SSR on Cloudflare Workers, plain
Markdown without Velite, shadcn/ui or bare Tailwind, Terraform for Cloudflare
or GitHub, i18n, etc. — and produces a tailored project.

## Quick start (humans)

```bash
git clone https://github.com/{{REPO_OWNER}}/webapp-template
cd webapp-template
bun install
bun run --filter @repo/content build   # one-time: generate Velite output
bun run dev                            # http://localhost:3000
```

## Customize for your project

In Claude Code, from inside the cloned repo:

```bash
claude
/bootstrap            # or /bootstrap --blank
```

In any other AI assistant (Cursor, Cline, Claude.ai web, ChatGPT, …):

> "Initialize a new project from this template:
> https://github.com/{{REPO_OWNER}}/webapp-template"

The agent will read [`INIT.md`](./INIT.md), walk an interview, clone the seed
to a scratch dir, assemble your project at a path you choose, run the build,
and hand you a clean repo with one `chore: bootstrap` commit.

## Stack (baseline)

| Layer              | Choice                                                        |
| ------------------ | ------------------------------------------------------------- |
| Package manager    | Bun ≥1.2 (workspaces + catalog)                               |
| Build orchestrator | Turborepo                                                     |
| Framework          | Next.js 16 + React 19                                         |
| Styling            | Tailwind CSS v4                                               |
| Content            | Velite (Zod-typed Markdown)                                   |
| UI primitives      | shadcn/ui (minimal: Button + cn)                              |
| Lint               | ESLint flat + Prettier + knip + syncpack + markdownlint       |
| CI                 | GitHub Actions (actionlint + bun + lint/typecheck/test/build) |

## Recipes (added during bootstrap)

| Category | Available                                                               |
| -------- | ----------------------------------------------------------------------- |
| Apps     | `app-web-static`, `app-web-ssr`, `app-workers-api`                      |
| Content  | `content-velite`, `content-mdx-only`                                    |
| UI       | `ui-shadcn`, `ui-tailwind-only`                                         |
| Infra    | `infra-terraform-cloudflare`, `infra-terraform-github`                  |
| Deploy   | `ci-deploy-static`, `ci-deploy-ssr`, `ci-deploy-vercel`, `ci-terraform` |
| Lint     | `lint-cspell`                                                           |
| Extras   | `i18n-next-intl`, `r2-client`                                           |

Full registry in [`init/recipes/_index.yaml`](./init/recipes/_index.yaml).

<!-- seed-only:end -->

<!-- The block below is what survives in the bootstrapped target. -->

A {{PROJECT_NAME}} project, built from the [webapp-template] seed.

## Quick start

```bash
bun install
bun run --filter {{PACKAGE_SCOPE}}/content build   # populate Velite output
bun run dev                                        # http://localhost:3000
```

## Stack

- **Runtime / package manager**: Bun (workspaces + catalog)
- **Framework**: Next.js 16, React 19
- **Styling**: Tailwind CSS v4
- **Content**: see `packages/content/`
- **Lint**: ESLint flat + Prettier + knip + syncpack + markdownlint

## Common scripts

```bash
bun run dev         # all apps, hot-reload
bun run build       # turbo orchestrates per-package builds
bun run lint        # eslint + markdownlint + knip + syncpack
bun run typecheck   # tsc --noEmit per package
bun run test        # vitest
bun run format      # prettier --write
```

## License

MIT — see [`LICENSE`](./LICENSE).

[webapp-template]: https://github.com/{{REPO_OWNER}}/webapp-template
