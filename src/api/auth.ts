import { Hono } from 'hono';
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from '@getmocha/users-service/backend';
import { getCookie, setCookie } from 'hono/cookie';

const app = new Hono<{ Bindings: Env }>();

app.get('/oauth/google/redirect_url', async (c) => {
  const { MOCHA_USERS_SERVICE_API_URL, MOCHA_USERS_SERVICE_API_KEY } = c.env;
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: MOCHA_USERS_SERVICE_API_URL,
    apiKey: MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post('/sessions', async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: 'No authorization code provided' }, 400);
  }

  const { MOCHA_USERS_SERVICE_API_URL, MOCHA_USERS_SERVICE_API_KEY } = c.env;
  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: MOCHA_USERS_SERVICE_API_URL,
    apiKey: MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });

  return c.json({ success: true }, 200);
});

app.get('/users/me', authMiddleware, async (c) => {
  return c.json(c.get('user'));
});

app.get('/logout', async (c) => {
  const { MOCHA_USERS_SERVICE_API_URL, MOCHA_USERS_SERVICE_API_KEY } = c.env;
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: MOCHA_USERS_SERVICE_API_URL,
      apiKey: MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

export default app;
