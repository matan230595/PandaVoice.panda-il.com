import { Hono } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { scryptSync, randomBytes, timingSafeEqual, randomUUID } from 'crypto';
import { getDB } from '@/server/db';
import { checkLoginRateLimit, getClientIp } from '@/server/middleware/rateLimit';

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
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  getDB()
    .prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`)
    .run(token, userId, expiresAt);

  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
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

  const rawEmail = body.email;
  const { password, name } = body;
  const email = rawEmail?.toLowerCase().trim();

  if (!email || !password) return c.json({ error: 'אימייל וסיסמה הם שדות חובה' }, 400);
  if (password.length < 8) return c.json({ error: 'הסיסמה חייבת להכיל לפחות 8 תווים' }, 400);
  if (password.length > 128) return c.json({ error: 'הסיסמה ארוכה מדי' }, 400);

  const db = getDB();
  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
  if (existing) return c.json({ error: 'כתובת האימייל כבר רשומה במערכת' }, 409);

  const id = randomUUID();
  const passwordHash = hashPassword(password);
  const displayName = name?.trim() || email.split('@')[0];

  db.prepare(`INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)`)
    .run(id, email, displayName, passwordHash);
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

  const rawEmail = body.email;
  const { password } = body;
  const email = rawEmail?.toLowerCase().trim();

  if (!email || !password) return c.json({ error: 'אימייל וסיסמה הם שדות חובה' }, 400);

  const ip = getClientIp(c.req.raw.headers);
  if (!checkLoginRateLimit(email, ip)) {
    return c.json({ error: 'יותר מדי ניסיונות כניסה, נסה שוב בעוד 15 דקות' }, 429);
  }

  const db = getDB();
  const user = db
    .prepare(`SELECT id, email, name, password_hash FROM users WHERE email = ?`)
    .get(email) as { id: string; email: string; name: string; password_hash: string | null } | undefined;

  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    return c.json({ error: 'אימייל או סיסמה שגויים' }, 401);
  }

  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(user.id);
  createSession(user.id, c);
  return c.json({ id: user.id, email: user.email, name: user.name });
});

app.post('/auth/logout', (c) => {
  const token = getCookie(c, 'session');
  if (token) {
    try { getDB().prepare(`DELETE FROM sessions WHERE token = ?`).run(token); } catch {}
  }
  deleteCookie(c, 'session', { path: '/' });
  return c.json({ ok: true });
});

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

app.get('/auth/google', (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return c.json({ error: 'Google OAuth not configured' }, 503);

  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? 'https://voice.panda-il.online/api/auth/google/callback';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
  });
  return c.redirect(`${GOOGLE_AUTH_URL}?${params}`);
});

app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.redirect('/?error=oauth_failed');

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? 'https://voice.panda-il.online/api/auth/google/callback';

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    });
    if (!tokenRes.ok) return c.redirect('/?error=oauth_failed');
    const { access_token } = await tokenRes.json() as { access_token: string };

    const userRes = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${access_token}` } });
    if (!userRes.ok) return c.redirect('/?error=oauth_failed');
    const gu = await userRes.json() as { email: string; name: string };

    const email = gu.email.toLowerCase();
    const db = getDB();
    let user = db.prepare(`SELECT id, email, name FROM users WHERE email = ?`).get(email) as { id: string; email: string; name: string } | undefined;

    if (!user) {
      const id = randomUUID();
      const displayName = gu.name || email.split('@')[0];
      db.prepare(`INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, NULL)`).run(id, email, displayName);
      user = { id, email, name: displayName };
    }

    db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(user.id);
    createSession(user.id, c);
    return c.redirect('/');
  } catch {
    return c.redirect('/?error=oauth_failed');
  }
});

export default app;
