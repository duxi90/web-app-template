#!/usr/bin/env bun
/**
 * Apply bootstrap recipes to a target directory.
 *
 * Usage:
 *   bun run scripts/bootstrap-apply.ts --fixture init/test-fixtures/static-minimal.yaml --target /path/to/out
 *   bun run scripts/bootstrap-apply.ts --fixture <fixture> --in-place
 *
 * In `--in-place` mode the seed checkout itself is mutated and `init/` is
 * removed at the end. Otherwise the seed stays read-only and the assembled
 * project is written to `--target`.
 *
 * This script is the deterministic counterpart to the AI-driven interview.
 * Both must produce identical output for a given answer set; this is how CI
 * proves the recipe library is consistent.
 */

import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

import { parse as parseYaml } from "yaml";

interface Fixture {
  project_name: string;
  package_scope: string;
  repo_owner?: string;
  apply: string[];
  remove?: string[];
}

interface RecipeManifest {
  id: string;
  title: string;
  provides: string[];
  requires: string[];
  conflicts: string[];
  files?: { src: string; dst: string }[];
  patches?: Patch[];
  env_required?: { key: string; doc: string }[];
}

type Patch =
  | { file: string; op: "json-merge"; path: string; value: unknown }
  | { file: string; op: "json-merge-array"; path: string; value: unknown[] }
  | { file: string; op: "text-append"; value: string };

interface Substitutions {
  PROJECT_NAME: string;
  PACKAGE_SCOPE: string;
  REPO_OWNER: string;
  REPO_NAME: string;
  YEAR: string;
  CF_ACCOUNT_ID_PLACEHOLDER: string;
  CF_KV_NAMESPACE_ID_PLACEHOLDER: string;
  VERCEL_PROJECT_ID_PLACEHOLDER: string;
}

function buildSubstitutions(fixture: Fixture): Substitutions {
  return {
    PROJECT_NAME: fixture.project_name,
    PACKAGE_SCOPE: fixture.package_scope,
    REPO_OWNER: fixture.repo_owner ?? "your-org",
    REPO_NAME: fixture.project_name,
    YEAR: String(new Date().getUTCFullYear()),
    CF_ACCOUNT_ID_PLACEHOLDER: "REPLACE_ME_ACCOUNT_ID",
    CF_KV_NAMESPACE_ID_PLACEHOLDER: "REPLACE_ME_KV_ID",
    VERCEL_PROJECT_ID_PLACEHOLDER: "REPLACE_ME_VERCEL_PROJECT_ID",
  };
}

function applySubstitutions(input: string, subs: Substitutions): string {
  // Replace {{TOKEN}} with values, but guard against `@{{PACKAGE_SCOPE}}` →
  // double-`@` collisions (PACKAGE_SCOPE already starts with `@`). When the
  // template literally writes `@{{PACKAGE_SCOPE}}`, strip the redundant `@`.
  const guarded = input.replaceAll("@{{PACKAGE_SCOPE}}", "{{PACKAGE_SCOPE}}");
  return guarded.replace(/{{(\w+)}}/g, (match, key: string) => {
    const value = (subs as Record<string, string>)[key];
    return value ?? match;
  });
}

function isBinary(filePath: string): boolean {
  return /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|pdf|zip|mp[34]|webm|svg)$/i.test(filePath);
}

function copyFileWithSubst(
  src: string,
  dst: string,
  subs: Substitutions,
  rewriteSeedIdentity = false,
): void {
  mkdirSync(dirname(dst), { recursive: true });
  if (isBinary(src)) {
    cpSync(src, dst);
    return;
  }
  let content = readFileSync(src, "utf8");
  if (rewriteSeedIdentity) {
    // Rewrite the seed's package scope (`@repo/...`, `"@repo"`) to the target's
    // chosen scope. Leave attribution links to "webapp-template" alone — the
    // root package.json's `name` field is patched separately in `pruneTarget`.
    content = content
      .replaceAll("@repo/", `${subs.PACKAGE_SCOPE}/`)
      .replaceAll('"@repo"', `"${subs.PACKAGE_SCOPE}"`);
  }
  writeFileSync(dst, applySubstitutions(content, subs));
}

function copyDir(
  srcDir: string,
  dstDir: string,
  subs: Substitutions,
  rewriteSeedIdentity = false,
): void {
  for (const entry of recursiveList(srcDir)) {
    if (entry.includes("/node_modules/") || entry.endsWith("/node_modules")) continue;
    if (entry.includes("/.turbo/") || entry.includes("/.next/") || entry.includes("/.velite/"))
      continue;
    const rel = relative(srcDir, entry);
    const dst = join(dstDir, rel);
    copyFileWithSubst(entry, dst, subs, rewriteSeedIdentity);
  }
}

function recursiveList(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    let entries: string[];
    try {
      entries = readdirSync(cur);
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = join(cur, e);
      const s = statSync(full);
      if (s.isDirectory()) stack.push(full);
      else out.push(full);
    }
  }
  return out;
}

function setByJsonPath(
  obj: Record<string, unknown>,
  path: string,
  mutator: (v: unknown) => unknown,
): void {
  if (path === "$") {
    const next = mutator(obj);
    if (next && typeof next === "object") Object.assign(obj, next);
    return;
  }
  const parts = path.replace(/^\$\.?/, "").split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    if (!(key in cur) || typeof cur[key] !== "object" || cur[key] === null) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1]!;
  cur[last] = mutator(cur[last]);
}

function applyJsonPatch(filePath: string, patch: Patch): void {
  if (patch.op === "text-append") {
    const existing = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
    writeFileSync(filePath, existing + patch.value);
    return;
  }
  const raw = readFileSync(filePath, "utf8");
  const json = JSON.parse(raw) as Record<string, unknown>;
  if (patch.op === "json-merge") {
    setByJsonPath(json, patch.path, (cur) => {
      if (cur && typeof cur === "object" && !Array.isArray(cur)) {
        return { ...(cur as Record<string, unknown>), ...(patch.value as Record<string, unknown>) };
      }
      if (Array.isArray(cur) && Array.isArray(patch.value)) {
        return [...new Set([...cur, ...patch.value])];
      }
      return patch.value;
    });
  } else if (patch.op === "json-merge-array") {
    setByJsonPath(json, patch.path, (cur) => {
      const base = Array.isArray(cur) ? cur : [];
      return [...new Set([...base, ...patch.value])];
    });
  }
  writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n");
}

function loadRecipeManifest(seedRoot: string, id: string): RecipeManifest {
  const manifestPath = join(seedRoot, "init", "recipes", id, "recipe.yaml");
  if (!existsSync(manifestPath)) {
    throw new Error(`Recipe '${id}' not found at ${manifestPath}`);
  }
  return parseYaml(readFileSync(manifestPath, "utf8")) as RecipeManifest;
}

function loadIndex(seedRoot: string): Record<string, RecipeManifest> {
  const indexPath = join(seedRoot, "init", "recipes", "_index.yaml");
  const parsed = parseYaml(readFileSync(indexPath, "utf8")) as {
    recipes: Record<string, Omit<RecipeManifest, "id">>;
  };
  const out: Record<string, RecipeManifest> = {};
  for (const [id, meta] of Object.entries(parsed.recipes)) {
    out[id] = { id, ...meta };
  }
  return out;
}

function resolveApplySet(index: Record<string, RecipeManifest>, requested: string[]): string[] {
  const provides: Record<string, string> = {};
  const requestedSet = new Set(requested);
  for (const id of requestedSet) {
    const meta = index[id];
    if (!meta) throw new Error(`Unknown recipe: ${id}`);
    for (const p of meta.provides) provides[p] = id;
  }
  for (const id of requestedSet) {
    const meta = index[id]!;
    for (const req of meta.requires) {
      if (!provides[req])
        throw new Error(
          `Recipe '${id}' requires '${req}' but no recipe in the apply set provides it.`,
        );
    }
    for (const conflict of meta.conflicts) {
      if (requestedSet.has(conflict))
        throw new Error(`Recipe '${id}' conflicts with '${conflict}'.`);
    }
  }
  return Array.from(requestedSet);
}

function applyRecipe(
  seedRoot: string,
  target: string,
  recipe: RecipeManifest,
  subs: Substitutions,
): void {
  if (recipe.files) {
    for (const f of recipe.files) {
      const srcAbs = join(seedRoot, "init", "recipes", recipe.id, f.src.replace(/\/\*\*$/, ""));
      const dstAbs = join(target, f.dst);
      if (!existsSync(srcAbs)) {
        console.warn(`  ! recipe ${recipe.id}: src ${f.src} not found, skipping`);
        continue;
      }
      const s = statSync(srcAbs);
      if (s.isDirectory()) {
        copyDir(srcAbs, dstAbs, subs);
      } else {
        copyFileWithSubst(srcAbs, dstAbs, subs);
      }
    }
  }
  if (recipe.patches) {
    for (const patch of recipe.patches) {
      const filePath = join(target, patch.file);
      if (!existsSync(filePath) && patch.op !== "text-append") {
        console.warn(`  ! recipe ${recipe.id}: patch target ${patch.file} not found, skipping`);
        continue;
      }
      applyJsonPatch(filePath, patch);
    }
  }
}

function copyBaseline(
  seedRoot: string,
  target: string,
  subs: Substitutions,
  includeBaselineApp: boolean,
): void {
  const alwaysCopy = [
    ".editorconfig",
    ".gitignore",
    ".husky",
    ".markdownlint.jsonc",
    ".nvmrc",
    ".prettierignore",
    ".prettierrc",
    ".stylelintrc.json",
    ".syncpackrc.json",
    "LICENSE",
    "bunfig.toml",
    "commitlint.config.mjs",
    "eslint.config.mjs",
    "knip.json",
    "package.json",
    "tsconfig.json",
    "turbo.json",
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    ".github/workflows/ci.yml",
    "packages/config-typescript",
    "packages/config-tailwind",
    "packages/config-eslint",
    "packages/ui",
    "packages/content",
  ];
  const baselineOnly = ["apps/web-static"];

  const items = includeBaselineApp ? [...alwaysCopy, ...baselineOnly] : alwaysCopy;

  for (const item of items) {
    const src = join(seedRoot, item);
    const dst = join(target, item);
    if (!existsSync(src)) continue;
    const s = statSync(src);
    if (s.isDirectory()) copyDir(src, dst, subs, true);
    else copyFileWithSubst(src, dst, subs, true);
  }
}

function stripSeedOnlyMarkers(target: string): void {
  const docs = ["README.md", "AGENTS.md", "CLAUDE.md", "INIT.md"];
  for (const f of docs) {
    const filePath = join(target, f);
    if (!existsSync(filePath)) continue;
    const content = readFileSync(filePath, "utf8");
    const cleaned = content.replace(
      /<!-- seed-only:start -->[\s\S]*?<!-- seed-only:end -->\n?\n?/g,
      "",
    );
    writeFileSync(filePath, cleaned);
  }
}

function pruneTarget(target: string, projectName: string): void {
  const purge = [
    "init",
    ".claude/commands/bootstrap.md",
    "INIT.md",
    "scripts/bootstrap-apply.ts",
    "scripts/test-bootstrap.ts",
  ];
  for (const p of purge) {
    const full = join(target, p);
    if (existsSync(full)) rmSync(full, { recursive: true, force: true });
  }
  const pkgPath = join(target, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
    pkg["name"] = projectName;
    pkg["description"] = `${projectName} — built from the webapp-template seed.`;
    const scripts = pkg["scripts"] as Record<string, string> | undefined;
    if (scripts) {
      delete scripts["bootstrap:apply"];
      delete scripts["test:bootstrap"];
    }
    const devDeps = pkg["devDependencies"] as Record<string, string> | undefined;
    if (devDeps) {
      delete devDeps["yaml"]; // only used by bootstrap-apply.ts
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
}

function git(target: string, args: string[]): { ok: boolean; stdout: string } {
  const r = spawnSync("git", args, { cwd: target, encoding: "utf8" });
  return { ok: r.status === 0, stdout: r.stdout ?? "" };
}

function finalizeCommit(target: string, seedRoot: string): void {
  const sha = git(seedRoot, ["rev-parse", "--short", "HEAD"]).stdout.trim();
  if (!sha) {
    console.warn(
      "  ! seed has no commits — bootstrap commit will use sha=uninit. Run `git commit` on the seed to fix.",
    );
  }
  if (!existsSync(join(target, ".git"))) git(target, ["init", "-b", "main"]);
  git(target, ["add", "-A"]);
  git(target, ["commit", "-m", `chore: bootstrap from seed@${sha || "uninit"}`]);
}

function checkBunVersion(seedRoot: string): void {
  const result = spawnSync("bun", ["--version"], { encoding: "utf8" });
  if (result.status !== 0) {
    console.warn(
      "  ! Bun is not installed or not on PATH. Install: curl -fsSL https://bun.sh/install | bash",
    );
    return;
  }
  const installed = (result.stdout ?? "").trim();
  const pkgPath = join(seedRoot, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { engines?: { bun?: string } };
  const required = pkg.engines?.bun ?? "";
  const requiredMin = required.replace(/^[~^>=<]+/, "");
  if (requiredMin && compareSemver(installed, requiredMin) < 0) {
    console.warn(
      `  ! Bun ${installed} is older than required ${required}. Upgrade: curl -fsSL https://bun.sh/install | bash`,
    );
  }
}

function compareSemver(a: string, b: string): number {
  const parse = (s: string): number[] => s.split(".").map((n) => parseInt(n, 10) || 0);
  const [aMaj, aMin, aPat] = parse(a);
  const [bMaj, bMin, bPat] = parse(b);
  if (aMaj !== bMaj) return (aMaj ?? 0) - (bMaj ?? 0);
  if (aMin !== bMin) return (aMin ?? 0) - (bMin ?? 0);
  return (aPat ?? 0) - (bPat ?? 0);
}

function saveBootstrapMeta(
  target: string,
  _fixturePath: string,
  fixture: Fixture,
  applySet: string[],
  seedSha: string,
): void {
  // Lightweight YAML emit by hand — keeps the target free of a `yaml` dep.
  const repoOwner = fixture.repo_owner ?? "REPLACE_ME";
  const lines: string[] = [
    `# Captured by the bootstrap-apply script. Re-running it with --fixture .bootstrap.yaml`,
    `# (after manually moving back the bootstrap kit) reproduces this target deterministically.`,
    `seed:`,
    `  url: https://github.com/${repoOwner}/webapp-template`,
    `  sha: ${seedSha || "uninit"}`,
    `bootstrappedAt: ${new Date().toISOString()}`,
    `applied:`,
    ...applySet.map((id) => `  - ${id}`),
    `answers:`,
    `  project_name: ${fixture.project_name}`,
    `  package_scope: "${fixture.package_scope}"`,
    fixture.repo_owner ? `  repo_owner: ${fixture.repo_owner}` : "",
    `  apply:`,
    ...fixture.apply.map((id) => `    - ${id}`),
  ].filter(Boolean);
  writeFileSync(join(target, ".bootstrap.yaml"), lines.join("\n") + "\n");
}

function printNextSteps(
  target: string,
  applySet: string[],
  packageScope: string,
  projectName: string,
): void {
  const usesVelite = applySet.includes("content-velite") || !applySet.includes("content-mdx-only");
  const lines: string[] = [
    "",
    `✓ Project created at ${target}`,
    `✓ Recipes applied: ${applySet.join(", ")}`,
    "",
    "Next steps:",
    `  cd ${target}`,
    `  bun install`,
  ];
  if (usesVelite) {
    lines.push(`  bun run --filter ${packageScope}/content build   # populate Velite output`);
  }
  lines.push(`  bun run dev                                 # http://localhost:3000`);
  lines.push("");
  lines.push("Optional:");
  lines.push(`  gh repo create ${projectName} --source=. --private`);
  lines.push(`  git push -u origin main`);
  lines.push("");
  console.log(lines.join("\n"));
}

interface CliArgs {
  fixture?: string;
  target?: string;
  inPlace: boolean;
  blank: boolean;
  noCommit: boolean;
}

function parseCliArgs(): CliArgs {
  const { values } = parseArgs({
    options: {
      fixture: { type: "string" },
      target: { type: "string" },
      "in-place": { type: "boolean", default: false },
      blank: { type: "boolean", default: false },
      "no-commit": { type: "boolean", default: false },
    },
    allowPositionals: false,
  });
  return {
    fixture: values.fixture as string | undefined,
    target: values.target as string | undefined,
    inPlace: values["in-place"] === true,
    blank: values.blank === true,
    noCommit: values["no-commit"] === true,
  };
}

async function main(): Promise<void> {
  const args = parseCliArgs();
  if (!args.fixture) throw new Error("--fixture is required");
  if (!args.target && !args.inPlace)
    throw new Error("either --target <dir> or --in-place is required");

  const seedRoot = resolve(import.meta.dir, "..");
  checkBunVersion(seedRoot);
  const fixturePath = resolve(args.fixture);
  const fixture = parseYaml(readFileSync(fixturePath, "utf8")) as Fixture;
  if (!fixture.package_scope.startsWith("@")) {
    throw new Error(`fixture.package_scope must start with @ (got: ${fixture.package_scope})`);
  }
  const subs = buildSubstitutions(fixture);

  const target = args.inPlace ? seedRoot : resolve(args.target!);
  if (!args.inPlace) mkdirSync(target, { recursive: true });

  console.log(`→ seed: ${seedRoot}`);
  console.log(`→ target: ${target}${args.inPlace ? " (in-place)" : ""}`);
  console.log(`→ fixture: ${fixturePath}`);

  const index = loadIndex(seedRoot);
  const applySet = resolveApplySet(index, fixture.apply);
  console.log(`→ apply set: ${applySet.join(", ")}`);

  if (!args.inPlace) {
    console.log("→ copying baseline…");
    copyBaseline(seedRoot, target, subs, !args.blank);
  } else if (args.blank) {
    console.log("→ --blank --in-place: removing baseline app…");
    rmSync(join(target, "apps/web-static"), { recursive: true, force: true });
    rmSync(join(target, "packages/content/posts/hello-world.md"), { force: true });
    rmSync(join(target, "packages/content/posts/hello-world.mdx"), { force: true });
  }

  for (const id of applySet) {
    console.log(`→ applying recipe: ${id}`);
    const recipe = loadRecipeManifest(seedRoot, id);
    applyRecipe(seedRoot, target, recipe, subs);
  }

  console.log("→ stripping seed-only markers…");
  stripSeedOnlyMarkers(target);
  console.log("→ pruning bootstrap kit from target…");
  pruneTarget(target, fixture.project_name);

  const seedSha = git(seedRoot, ["rev-parse", "--short", "HEAD"]).stdout.trim();
  saveBootstrapMeta(target, fixturePath, fixture, applySet, seedSha);

  if (!args.noCommit) {
    console.log("→ creating bootstrap commit…");
    finalizeCommit(target, seedRoot);
  }

  console.log("✓ bootstrap-apply complete.");
  printNextSteps(target, applySet, fixture.package_scope, fixture.project_name);
}

main().catch((err) => {
  console.error("✗ bootstrap-apply failed:");
  console.error(err);
  process.exit(1);
});
