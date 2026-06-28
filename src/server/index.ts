import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { initDB, getDB } from '@/server/db';
import { createApiApp } from '@/server/app';

// ─── Env Validation ───────────────────────────────────────────────────────────
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').default('3000'),
  DATA_DIR: z.string().optional(),
  AUDIO_DIR: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  for (const [field, errors] of Object.entries(parsed.error.flatten().fieldErrors)) {
    console.error(`  ${field}: ${errors?.join(', ')}`);
  }
  process.exit(1);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
initDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const clientPath = join(__dirname, '..');

// ─── App ──────────────────────────────────────────────────────────────────────
const app = createApiApp();

app.use('/*', serveStatic({ root: clientPath }));

app.get('/*', async (c) => {
  try {
    const html = readFileSync(join(clientPath, 'index.html'), 'utf-8');
    return c.html(html);
  } catch {
    return c.text('Build not found. Run: npm run build:all', 500);
  }
});

// ─── Server ───────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3000;

const server = serve({ fetch: app.fetch, port }, () => {
  console.log(`PandaVoice running on http://localhost:${port}`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function shutdown(signal: string) {
  console.log(`${signal} received — shutting down`);
  server.close(() => {
    try { getDB().close(); } catch {}
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
