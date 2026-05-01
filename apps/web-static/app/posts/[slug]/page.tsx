import { posts } from "@repo/content";
import { notFound } from "next/navigation";

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return posts.map((post) => ({ slug: post.slug as string }));
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <p className="text-sm text-[var(--color-muted-foreground)]">{post.date}</p>
      <h1>{post.title}</h1>
      <p className="lead">{post.summary}</p>
      <div dangerouslySetInnerHTML={{ __html: post.body as string }} />
    </article>
  );
}
