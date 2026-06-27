import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { randomBytes } from 'crypto';
import { getDB } from '@/server/db';

const app = new Hono();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ??
  'https://dev.panda-il.com/api/oauth/google/callback';
const SESSION_DAYS = 30;

app.get('/oauth/google/redirect_url', (c) => {
  if (!GOOGLE_CLIENT_ID) {
    return c.json({ error: 'Google OAuth not configured on this server' }, 503);
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
  });
  return c.json({
    redirectUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  });
});

app.get('/oauth/google/callback', async (c) => {
  const code = c.req.query('code');
  if (!code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return c.redirect('/?error=auth_failed');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!tokenRes.ok) throw new Error('Token exchange failed');
    const tokens = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!userRes.ok) throw new Error('Failed to fetch user info');
    const profile = (await userRes.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    };

    const db = getDB();
    db.prepare(
      `INSERT INTO users (id, email, name, avatar) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         name  = excluded.name,
         avatar = excluded.avatar`
    ).run(profile.sub, profile.email, profile.name, profile.picture ?? null);

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(
      Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
    db.prepare(
      `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`
    ).run(token, profile.sub, expiresAt);

    setCookie(c, 'session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: SESSION_DAYS * 24 * 60 * 60,
      path: '/',
    });

    return c.redirect('/auth/callback');
  } catch (err) {
    console.error('OAuth callback error:', err);
    return c.redirect('/?error=auth_failed');
  }
});

app.get('/logout', (c) => {
  const token = getCookie(c, 'session');
  if (token) {
    try {
      getDB().prepare('DELETE FROM sessions WHERE token = ?').run(token);
    } catch {}
  }
  deleteCookie(c, 'session', { path: '/' });
  return c.json({ ok: true });
});

export default app;
