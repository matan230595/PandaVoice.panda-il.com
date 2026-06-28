import { describe, it, expect, beforeAll } from 'vitest';
import { mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Set temp DB before importing anything that touches the DB singleton
const testDir = join(tmpdir(), `pv-test-${Date.now()}`);
mkdirSync(testDir, { recursive: true });
process.env.DATA_DIR = testDir;
process.env.NODE_ENV = 'test';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let app: any;

beforeAll(async () => {
  const { initDB } = await import('./db');
  const { createApiApp } = await import('./app');
  initDB();
  app = createApiApp();
});

describe('Health endpoint', () => {
  it('returns 200 with status ok', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const json = await res.json() as { status: string; timestamp: string };
    expect(json.status).toBe('ok');
    expect(json.timestamp).toBeTruthy();
  });
});

describe('Auth — register', () => {
  it('creates a user and returns 201', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test' }),
    });
    expect(res.status).toBe(201);
    const json = await res.json() as { email: string };
    expect(json.email).toBe('test@example.com');
  });

  it('rejects duplicate email with 409', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    expect(res.status).toBe(409);
  });

  it('rejects short password with 400', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com', password: 'short' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('Auth — login', () => {
  it('rejects wrong password with 401', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    });
    expect(res.status).toBe(401);
  });

  it('accepts correct credentials', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    expect(res.status).toBe(200);
  });
});

describe('Protected routes', () => {
  it('blocks /api/ai without auth', async () => {
    const res = await app.request('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test', text: 'test', apiKey: 'k', provider: 'gemini' }),
    });
    expect(res.status).toBe(401);
  });

  it('blocks /api/translate without auth', async () => {
    const res = await app.request('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello', sourceLang: 'en', targetLang: 'he', apiKey: 'k', provider: 'gemini' }),
    });
    expect(res.status).toBe(401);
  });

  it('blocks /api/recordings/list without auth', async () => {
    const res = await app.request('/api/recordings/list');
    expect(res.status).toBe(401);
  });
});
