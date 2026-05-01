// Re-export Velite-generated typed posts. The `.velite` dir is created by
// `bun run --filter @repo/content build` (or `bun run build` from the repo root).
//
// Until that runs once, the import below resolves to `[]` via the fallback
// shipped in this file — apps still typecheck on a fresh clone.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeneratedPosts = ReadonlyArray<any>;

let generated: GeneratedPosts = [];
try {
  generated = (await import("../.velite/index.js").catch(() => ({ posts: [] }))).posts ?? [];
} catch {
  generated = [];
}

export const posts = generated;
export type Post = (typeof posts)[number];
