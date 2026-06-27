import { Hono } from 'hono';

interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>();

app.get('/api/health', (c) =>
  c.json({ status: 'ok', runtime: 'cloudflare-worker', timestamp: new Date().toISOString() })
);

export default app;
