# `init/` — bootstrap kit

This directory is the AI bootstrap agent's working set. It is **deleted** at
the end of the bootstrap process; it never ends up in the user's final repo.

## Files

| File                   | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `SYSTEM_PROMPT.md`     | Hard rules the agent follows during the interview + apply.   |
| `questions.yaml`       | Interview script — single source of truth for question flow. |
| `flowchart.md`         | Mermaid diagram of the interview (humans audit this).        |
| `blank.md`             | Paths to remove when `--blank` is passed.                    |
| `finalize.md`          | End-of-bootstrap checklist.                                  |
| `recipes/_index.yaml`  | Registry of available recipes + their dep relationships.     |
| `recipes/<id>/`        | One directory per recipe; see `recipes/_index.yaml`.         |
| `test-fixtures/*.yaml` | Canned answer sets for CI bootstrap tests.                   |

## Editing the kit

If you fork this seed and want to add a new recipe, you must:

1. Add a directory under `init/recipes/<your-id>/` with at minimum a
   `recipe.yaml` and a `files/` (or `patches/`) subdir.
2. Register it in `init/recipes/_index.yaml`.
3. Reference it from `init/questions.yaml` via an option's `apply` list, OR
   from a `bool` question's `apply_if_true` list.
4. Add a fixture covering it under `init/test-fixtures/`.
5. Run `bun run test:bootstrap` locally — it runs every fixture through the
   `bootstrap-apply` script and asserts the result builds.

## Editing the questions

The question YAML schema is documented at the top of `questions.yaml`. Two
constraints:

- **Question order is the contract.** Don't reorder unless you also update the
  flowchart and re-run all fixtures.
- **`depends_on` is purely declarative.** The agent skips the question
  silently when unmet; it does not try to "find a path" through the tree.

## Why a kit and not a script

The interview could be a CLI (`create-webapp`-style), but then customizing the
tree means hacking JS code. With YAML + Markdown, the AI agent is the runtime
— a friend can fork the seed, edit `questions.yaml`, add a recipe folder, and
their fork's bootstrap experience changes accordingly. No build step, no
release.
