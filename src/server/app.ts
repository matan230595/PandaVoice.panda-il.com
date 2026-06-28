import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { getDB } from '@/server/db';
import aiRoutes from '@/server/routes/ai';
import translateRoutes from '@/server/routes/translate';
import recordingsRoutes from '@/server/routes/recordings';
import authRoutes from '@/server/routes/auth';
import { requireAuth } from '@/server/middleware/auth';
import { securityHeaders } from '@/server/middleware/securityHeaders';
import type { AppVariables } from '@/server/types';

export function createApiApp() {
  const app = new Hono<AppVariables>();

  app.use('*', securityHeaders);

  // HTTPS redirect in production (behind Cloudflare/Apache proxy)
  if (process.env.NODE_ENV === 'production') {
    app.use('*', async (c, next) => {
      const proto = c.req.header('x-forwarded-proto');
      if (proto && proto !== 'https') {
        const host = c.req.header('host') ?? '';
        return c.redirect(`https://${host}${c.req.path}`, 301);
      }
      await next();
    });
  }

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
  app.use('/api/ai', requireAuth);
  app.use('/api/translate', requireAuth);
  app.route('/api', aiRoutes);
  app.route('/api', translateRoutes);
  app.use('/api/recordings/*', requireAuth);
  app.route('/api/recordings', recordingsRoutes);

  return app;
}
