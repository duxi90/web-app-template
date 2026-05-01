---
title: Hello, world
date: 2026-04-30
summary: A starter post for the plain markdown content layer.
tags: [seed]
---

This is the seed post that ships with the `content-mdx-only` recipe. No build
step, no Velite — just `fs.readdir` at request time via `getAllPosts()`.

```ts
import { getAllPosts } from "{{PACKAGE_SCOPE}}/content/server";
const posts = getAllPosts();
```
