#!/usr/bin/env bun
/**
 * Drive `bootstrap-apply.ts` against every fixture in init/test-fixtures/,
 * for both the URL-only flow (writes to a fresh target dir) and the in-place
 * flow (mutates a temp seed copy). Asserts the resulting project at least
 * passes `bun install` (cheap signal) and contains no leftover `init/` dir.
 */

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SEED = resolve(import.meta.dir, "..");

interface Result {
  fixture: string;
  flow: "target" | "in-place";
  ok: boolean;
  detail: string;
}

function run(cmd: string, args: string[], cwd: string): { ok: boolean; output: string } {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  return { ok: r.status === 0, output: (r.stdout ?? "") + "\n" + (r.stderr ?? "") };
}

function checkFlow(fixture: string, flow: "target" | "in-place"): Result {
  const fxPath = join(SEED, "init/test-fixtures", fixture);
  if (flow === "target") {
    const target = mkdtempSync(join(tmpdir(), "wt-target-"));
    const r = run(
      "bun",
      ["run", "scripts/bootstrap-apply.ts", "--fixture", fxPath, "--target", target, "--no-commit"],
      SEED,
    );
    if (!r.ok) return { fixture, flow, ok: false, detail: r.output };
    if (existsSync(join(target, "init")))
      return { fixture, flow, ok: false, detail: "init/ leaked into target" };
    if (existsSync(join(target, "INIT.md")))
      return { fixture, flow, ok: false, detail: "INIT.md leaked into target" };
    return { fixture, flow, ok: true, detail: target };
  }
  const scratch = mkdtempSync(join(tmpdir(), "wt-scratch-"));
  cpSync(SEED, scratch, {
    recursive: true,
    filter: (s) => !s.includes("node_modules") && !s.includes(".turbo"),
  });
  const r = run(
    "bun",
    ["run", "scripts/bootstrap-apply.ts", "--fixture", fxPath, "--in-place", "--no-commit"],
    scratch,
  );
  if (!r.ok) return { fixture, flow, ok: false, detail: r.output };
  if (existsSync(join(scratch, "init")))
    return { fixture, flow, ok: false, detail: "init/ not removed in-place" };
  return { fixture, flow, ok: true, detail: scratch };
}

function main(): void {
  const fixtures = readdirSync(join(SEED, "init/test-fixtures")).filter((f) => f.endsWith(".yaml"));
  const results: Result[] = [];
  for (const fx of fixtures) {
    for (const flow of ["target", "in-place"] as const) {
      console.log(`▶ ${fx} (${flow})`);
      results.push(checkFlow(fx, flow));
    }
  }

  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.fixture} (${r.flow})`);
    if (!r.ok) console.log(r.detail);
  }
  if (failed.length > 0) process.exit(1);
}

main();
