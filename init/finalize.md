# Finalize checklist

Run these in order. Each step blocks on the previous; if any step fails, stop
and surface the error to the user.

## 1. Substitute placeholders

Single grep+replace pass across all files written into `<target>`:

| Token                               | Source                                   |
| ----------------------------------- | ---------------------------------------- |
| `{{PROJECT_NAME}}`                  | answer to `project_name`                 |
| `{{PACKAGE_SCOPE}}`                 | answer to `package_scope`                |
| `{{REPO_OWNER}}`                    | parsed from seed URL or asked from user  |
| `{{REPO_NAME}}`                     | answer to `project_name`                 |
| `{{YEAR}}`                          | current year (UTC)                       |
| `{{CF_ACCOUNT_ID_PLACEHOLDER}}`     | left as a sentinel; user fills in `.env` |
| `{{VERCEL_PROJECT_ID_PLACEHOLDER}}` | same                                     |

Tokens not listed here must NOT appear in the finalized target. Grep for `{{`
after substitution; if any remain, that's a bug — surface it.

## 2. Generate `.env.example`

Walk every applied recipe's `env_required`. Concatenate into
`<target>/.env.example`:

```
# Required by recipe: <recipe-id>
<KEY>=<placeholder-or-empty>     # <doc string>
```

De-duplicate keys; if two recipes require the same key, list both recipes in
the comment.

## 3. Install dependencies

```bash
cd <target>
bun install
```

This generates `bun.lock`, which gets committed.

## 4. Build content (if Velite is in)

```bash
bun run --filter @repo/content build
```

This populates `packages/content/.velite/` so the apps can typecheck against
real generated types.

## 5. Verify

```bash
bun run typecheck
bun run lint
bun run build
```

All three must exit 0. **Do not** auto-fix or downgrade strictness on failure —
stop and surface the error.

## 6. Substitute remaining doc placeholders

The seed's `README.md`, `CLAUDE.md`, `AGENTS.md` contain seed-only sections
marked `<!-- seed-only:start -->` … `<!-- seed-only:end -->`. Strip these
sections from the target's copies.

## 7. Strip the bootstrap kit

```bash
rm -rf <target>/init/
rm -rf <target>/.claude/commands/bootstrap.md
```

Drop these scripts from `<target>/package.json`:

- `bootstrap:apply`
- `test:bootstrap`

Drop their dependencies if they are not used elsewhere. The default seed only
adds `bun` for these (already a runtime), so there's typically nothing to drop.

## 8. Sanity check

Run a final grep:

```bash
grep -r "init/" <target> --exclude-dir=node_modules --exclude-dir=.git \
  --exclude-dir=.next --exclude-dir=.turbo --exclude=bun.lock || true
```

If anything matches, that's a leak — surface it.

## 9. Commit

```bash
cd <target>
git init -b main      # only if the target is not already a git repo
git add -A
git commit -m "chore: bootstrap from <seed-url>@<short-sha>"
```

The short-sha is the seed commit the agent assembled from. Get it via
`git -C <scratch> rev-parse --short HEAD`.

## 10. Print next steps

See the end of `init/SYSTEM_PROMPT.md` for the exact output block. No
celebratory text. No follow-up offers.
