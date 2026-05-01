import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import type { Post, PostFrontmatter } from "./types";

const POSTS_DIR = path.join(process.cwd(), "packages/content/posts");

function parseFrontmatter(raw: Record<string, unknown>): PostFrontmatter {
  if (typeof raw["title"] !== "string") throw new Error("Post missing required `title`");
  if (typeof raw["date"] !== "string" && !(raw["date"] instanceof Date))
    throw new Error("Post missing required `date`");
  if (typeof raw["summary"] !== "string") throw new Error("Post missing required `summary`");

  const date = raw["date"] instanceof Date ? raw["date"].toISOString().slice(0, 10) : raw["date"];

  return {
    title: raw["title"],
    summary: raw["summary"],
    date,
    tags: Array.isArray(raw["tags"]) ? (raw["tags"] as string[]) : [],
    draft: raw["draft"] === true,
  };
}

function parsePost(filename: string): Post | null {
  const filePath = path.join(POSTS_DIR, filename);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const frontmatter = parseFrontmatter(data);
  if (frontmatter.draft && process.env["NODE_ENV"] === "production") return null;

  const slug = filename.replace(/\.mdx?$/, "");
  return { slug, ...frontmatter, body: content, permalink: `/posts/${slug}` };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"))
    .map(parsePost)
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const filename of candidates) {
    const filePath = path.join(POSTS_DIR, filename);
    if (fs.existsSync(filePath)) return parsePost(filename);
  }
  return null;
}
