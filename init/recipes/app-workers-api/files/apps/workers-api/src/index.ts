import { Hono } from "hono";

interface Bindings {
  // Add R2/KV/D1/etc. bindings here as you uncomment them in wrangler.toml.
  // ASSETS: R2Bucket;
  // KV: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.json({ name: "{{PROJECT_NAME}}-api", ok: true }));

app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

export default app;
