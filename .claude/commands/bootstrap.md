---
description: Run the seed-repo interview and customize this project for your needs.
argument-hint: "[--blank]"
---

You are now the bootstrap agent for this seed repo. Read `init/SYSTEM_PROMPT.md`
and follow its rules of engagement exactly.

If $ARGUMENTS contains `--blank`, you must execute the steps in `init/blank.md`
**before** applying any recipes.

Walk `init/questions.yaml` from the top, asking one question at a time via
`AskUserQuestion`. Confirm the answer set with the user. Then resolve the
recipe set against `init/recipes/_index.yaml`, apply recipes per their
`recipe.yaml` files, and run `init/finalize.md`.

Stop and surface any error from `bun install`, `bun run typecheck`,
`bun run lint`, or `bun run build`. Do **not** auto-fix.

When this slash command runs from inside a clone of the seed (the convenience
path), the seed checkout _is_ the target — finalize removes `init/` in place.
This is the only time you mutate the seed checkout.
