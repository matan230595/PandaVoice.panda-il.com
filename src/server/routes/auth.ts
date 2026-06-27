import { Hono } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { scryptSync, randomBytes, timingSafeEqual, randomUUID } from 'crypto';
import { getDB } from '@/server/db';

const app = new Hono();

const SESSION_DAYS = 30;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const hashBuffer = Buffer.from(hash, 'hex');
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, derived);
}

function createSession(userId: string, c: Parameters<typeof setCookie>[0]): void {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  getDB()
    .prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`)
    .run(token, userId, expiresAt);

  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

app.post('/auth/register', async (c) => {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'גוף הבקשה אינו תקין' }, 400);
  }

  const { email, password, name } = body;

  if (!email || !password) {
    return c.json({ error: 'אימייל וסיסמה הם שדות חובה' }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }, 400);
  }

  const db = getDB();
  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
  if (existing) {
    return c.json({ error: 'כתובת האימייל כבר רשומה במערכת' }, 409);
  }

  const id = randomUUID();
  const passwordHash = hashPassword(password);
  const displayName = name || email.split('@')[0];

  db.prepare(
    `INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)`
  ).run(id, email, displayName, passwordHash);

  // Delete any stale sessions (shouldn't exist for new user, but be safe)
  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(id);

  createSession(id, c);

  return c.json({ id, email, name: displayName }, 201);
});

app.post('/auth/login', async (c) => {
  let body: { email?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'גוף הבקשה אינו תקין' }, 400);
  }

  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'אימייל וסיסמה הם שדות חובה' }, 400);
  }

  const db = getDB();
  const user = db
    .prepare(`SELECT id, email, name, password_hash FROM users WHERE email = ?`)
    .get(email) as { id: string; email: string; name: string; password_hash: string | null } | undefined;

  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    return c.json({ error: 'אימייל או סיסמה שגויים' }, 401);
  }

  // Delete old sessions before creating new one
  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(user.id);

  createSession(user.id, c);

  return c.json({ id: user.id, email: user.email, name: user.name });
});

app.post('/auth/logout', (c) => {
  const token = getCookie(c, 'session');
  if (token) {
    try {
      getDB().prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
    } catch {}
  }
  deleteCookie(c, 'session', { path: '/' });
  return c.json({ ok: true });
});

export default app;
