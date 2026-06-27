import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initDB } from '@/server/db';
import aiRoutes from '@/server/routes/ai';
import translateRoutes from '@/server/routes/translate';
import recordingsRoutes from '@/server/routes/recordings';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dist/server/index.js → go up one level to reach dist/ (where Vite puts client files)
const clientPath = join(__dirname, '..');

initDB();

const app = new Hono();

// Static local user — nginx basic auth protects the domain
app.get('/api/users/me', (c) => {
  return c.json({ id: 'local', email: 'admin@pandavoice', name: 'Admin' });
});

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.route('/api', aiRoutes);
app.route('/api', translateRoutes);
app.route('/api/recordings', recordingsRoutes);

// Serve React SPA
app.get('/*', async (c) => {
  if (c.req.path.startsWith('/api')) return c.json({ error: 'Not found' }, 404);
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
