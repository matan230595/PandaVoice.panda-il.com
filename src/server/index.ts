import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { getCookie } from 'hono/cookie';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initDB, getDB } from '@/server/db';
import aiRoutes from '@/server/routes/ai';
import translateRoutes from '@/server/routes/translate';
import recordingsRoutes from '@/server/routes/recordings';
import authRoutes from '@/server/routes/auth';
import { requireAuth } from '@/server/middleware/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dist/server/index.js → dist/ is one level up; client files (index.html, assets/) live there
const clientPath = join(__dirname, '..');

initDB();

const app = new Hono();

app.get('/api/users/me', (c) => {
  const token = getCookie(c, 'session');
  if (!token) return c.json({ error: 'Not authenticated' }, 401);
  try {
    const row = getDB()
      .prepare(
        `SELECT u.id, u.email, u.name, u.avatar
         FROM sessions s JOIN users u ON s.user_id = u.id
         WHERE s.token = ? AND s.expires_at > datetime('now')`
      )
      .get(token) as { id: string; email: string; name: string; avatar: string | null } | undefined;
    if (!row) return c.json({ error: 'Not authenticated' }, 401);
    return c.json(row);
  } catch {
    return c.json({ error: 'Not authenticated' }, 401);
  }
});

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.route('/api', authRoutes);
app.route('/api', aiRoutes);
app.route('/api', translateRoutes);
app.use('/api/recordings/*', requireAuth);
app.route('/api/recordings', recordingsRoutes);

// Serve static assets (JS, CSS, images) from dist/
app.use('/*', serveStatic({ root: clientPath }));

// SPA fallback — serve index.html for all non-asset routes
app.get('/*', async (c) => {
  try {
    const html = readFileSync(join(clientPath, 'index.html'), 'utf-8');
    return c.html(html);
  } catch {
    return c.text('Build not found. Run: npm run build:all', 500);
  }
});

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, () => {
  console.log(`PandaVoice running on http://localhost:${port}`);
});
