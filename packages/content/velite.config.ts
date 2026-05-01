import { defineCollection, defineConfig, s } from "velite";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.md",
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug("post"),
      date: s.isodate(),
      summary: s.string().max(240),
      tags: s.array(s.string()).default([]),
      draft: s.boolean().default(false),
      cover: s.image().optional(),
      body: s.markdown(),
      raw: s.raw(),
      excerpt: s.excerpt({ length: 200 }),
      metadata: s.metadata(),
    })
    .transform((data) => ({
      ...data,
      permalink: `/posts/${data.slug}`,
    })),
});

export default defineConfig({
  root: ".",
  output: {
    data: ".velite",
    assets: "public/assets",
    base: "/assets/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts },
  markdown: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
  prepare: ({ posts }) => {
    posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  },
});
