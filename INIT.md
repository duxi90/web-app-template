# webapp-template — bootstrap manifest

> **If you are an LLM and a user asked you to initialize a project from this template:**
> read this file in full, then `init/SYSTEM_PROMPT.md`, then begin the protocol below.

This is a **seed repo**. It is not the user's project — it is a kit for assembling
the user's project. Your job is to interview the user, pick the right pieces, copy
them into a target directory, and hand back a clean repo.

---

## Files to read before doing anything

1. `init/SYSTEM_PROMPT.md` — your operating rules, including hard constraints.
2. `init/questions.yaml` — the interview script (single source of truth).
3. `init/recipes/_index.yaml` — registry of available recipes and their dependencies.
4. `init/finalize.md` — checklist you run at the end.

If you don't have a shell and only have a `WebFetch`-equivalent, fetch each from
`https://raw.githubusercontent.com/<owner>/<repo>/HEAD/<path>` (the user can supply
the owner/repo, or you can extract it from the URL they pasted).

---

## Protocol summary

The full version is in `init/SYSTEM_PROMPT.md`. Short version:

1. **Negotiate environment.** Ask the user:
   - What is the project name? (validates `^[a-z][a-z0-9-]+$`)
   - Where should the project be created? Default: `<cwd>/<project-name>`.
   - Do they have a local shell, or only a chat window?
   - `--blank` mode? (skips the demo baseline; default is to keep it)
2. **Clone the seed to a scratch dir.** `git clone <seed-url> <scratch>`. Never mutate
   the seed checkout — the URL-driven flow may run against a read-only fetched copy.
3. **Walk `init/questions.yaml` top-down.** One question at a time. Use
   `AskUserQuestion` if available; numbered prose otherwise. Never assume answers.
   Skip questions whose `depends_on` is unmet.
4. **Confirm choices.** Print a one-page summary and wait for explicit confirmation.
5. **Apply recipes.** For each chosen recipe id, read `<scratch>/init/recipes/<id>/recipe.yaml`,
   then copy `files/**` into the target dir with token substitution
   (`{{PROJECT_NAME}}`, `{{PACKAGE_SCOPE}}`, etc.) and apply `patches/**` to root files.
   Validate `requires` and `conflicts` first.
6. **Finalize** per `init/finalize.md`:
   - `bun install`
   - `bun run typecheck && bun run lint && bun run build` — must pass; do not auto-fix.
   - Generate `.env.example` from union of recipes' `env_required`.
   - Substitute placeholders in `README.md`, `CLAUDE.md`, `AGENTS.md`.
   - Do **not** copy `init/` or `.claude/commands/bootstrap.md` to the target dir.
   - `git init && git add -A && git commit -m "chore: bootstrap from <seed-url>@<sha>"`
7. **Print next steps.** Deploy command, where to add content, where TF vars live,
   optional `gh repo create` to push.

---

## For humans who landed here

If you have **Claude Code** locally and have already cloned the repo:

```bash
claude
# then:
/bootstrap            # or /bootstrap --blank
```

Otherwise, paste this repo's URL into your AI assistant of choice and ask:

> "Initialize a new project from this template: <url>"

The assistant will follow the protocol above. It will ask you ~8 questions, assemble
the project at a path you choose, run the build, and hand you a clean repo with one
`chore: bootstrap` commit.

---

## What's in here

```
apps/web-static          ← runnable demo (Next.js 16 static export)
packages/ui              ← minimal shadcn baseline (Button + cn)
packages/content         ← Velite + sample MDX post
packages/config-*        ← shared TS / ESLint / Tailwind configs
init/                    ← bootstrap kit: prompt, questions, recipes (deleted at finalize)
.claude/commands/        ← /bootstrap slash command
.github/workflows/ci.yml ← actionlint + bun + lint/typecheck/test/build
```

The seed itself is runnable — `bun install && bun run dev` boots the demo at
`localhost:3000`. The bootstrap interview takes you from this baseline to a project
configured for your specific stack (SSR vs static, Cloudflare vs Vercel, full-strict
linting vs light, Terraform scope, i18n, etc.).
