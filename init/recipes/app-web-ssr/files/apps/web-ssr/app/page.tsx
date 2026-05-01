import { posts } from "{{PACKAGE_SCOPE}}/content";

export const dynamic = "force-dynamic";

const PROJECT_NAME = "{{PROJECT_NAME}}";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{PROJECT_NAME} (SSR)</h1>
      <p className="text-[var(--color-muted-foreground)]">
        Server-rendered on Cloudflare Workers via OpenNext. {posts.length} post(s) loaded.
      </p>
    </div>
  );
}
