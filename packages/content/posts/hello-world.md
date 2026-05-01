---
title: Hello, world
slug: hello-world
date: 2026-04-30
summary: A starter post that proves the content pipeline works end-to-end.
tags: [seed, demo]
---

This is the seed post that ships with the template. If you can see it rendered
in the dev server, the **content pipeline is wired up correctly**:

- Velite parsed this file's frontmatter against a Zod schema.
- Tailwind v4 styles came from `@repo/config-tailwind`.
- The page that rendered it lives in the chosen app (`apps/web-static` by default).

## What to do next

1. Replace this post with your own under `packages/content/posts/`.
2. Adjust the schema in `packages/content/velite.config.ts` if you need extra
   frontmatter fields — Velite will give you typed TypeScript bindings for free.
3. Run `bun run build` whenever you change the schema; `bun run dev` watches
   content automatically.

```ts
// Type-safe access from any app
import { posts } from "@repo/content";

posts[0]?.title; // string
```

That's it. Now go write something.
