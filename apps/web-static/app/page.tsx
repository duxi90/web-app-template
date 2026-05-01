import { posts } from "@repo/content";
import { Button } from "@repo/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">webapp-template</h1>
        <p className="text-lg text-[var(--color-muted-foreground)]">
          A seed repo for Next.js + Cloudflare projects, with an AI bootstrap agent that tailors it
          to your needs.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/posts/hello-world">Read the demo post</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-[var(--color-muted-foreground)]">
            Run <code className="rounded bg-[var(--color-muted)] px-1.5 py-0.5">bun run build</code>{" "}
            once to generate typed content data.
          </p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li
                key={post.slug}
                className="border-b border-[var(--color-border)] pb-3 last:border-0"
              >
                <Link href={`/posts/${post.slug}`} className="group block">
                  <h3 className="font-medium group-hover:underline">{post.title}</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">{post.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
