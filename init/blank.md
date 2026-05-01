# --blank mode

When the user passes `--blank`, strip the demo baseline before applying recipes.
This is for friends who want a clean slate and don't need a working preview.

## Paths to remove from the target dir

```
apps/web-static/                          # the entire baseline static app
packages/content/posts/hello-world.mdx    # the sample post
```

## Paths to keep

Everything else stays — the shared configs (`packages/config-*`), the empty
`packages/ui` shell, the empty `packages/content` shell. Recipes will fill them
back in based on the user's answers.

## After applying --blank

The agent should still validate that at least one recipe in the apply set
provides `app:*` (i.e. `app-web-ssr`, `app-web-static`, or `app-workers-api`).
If none does, surface a warning: the user is creating a project with no app at
all, which is unusual. Confirm before continuing.
