// Shim: keep `import { posts } from "{{PACKAGE_SCOPE}}/content"` working in
// app code, even though content-mdx-only doesn't pre-build a posts array.
// Apps that need typed access should import from `./posts-server` directly.
import type { Post } from "./types";

export const posts: ReadonlyArray<Post> = [];
export type { Post };
