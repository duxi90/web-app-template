import { Hono } from "hono";

// Bindings interface — extend with R2Bucket / KVNamespace / D1Database etc. as you
// add them to wrangler.toml. Empty for now; cast `unknown` keeps eslint happy.
type Bindings = Record<string, unknown>;

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.json({ name: "{{PROJECT_NAME}}-api", ok: true }));

app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

export default app;
