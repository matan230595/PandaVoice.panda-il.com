import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { getDB } from '@/server/db';
import type { AppVariables } from '@/server/types';

export const requireAuth: MiddlewareHandler<AppVariables> = async (c, next) => {
  const token = getCookie(c, 'session');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const row = getDB()
    .prepare(
      `SELECT u.id, u.email, u.name FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`
    )
    .get(token) as { id: string; email: string; name: string } | undefined;

  if (!row) return c.json({ error: 'Unauthorized' }, 401);
  c.set('user', row);
  await next();
};
