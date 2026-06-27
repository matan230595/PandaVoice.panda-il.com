import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getDB } from '@/server/db';
import type { Context } from 'hono';

const app = new Hono();

function getAudioDir(): string {
  const dir = process.env.AUDIO_DIR || join(process.cwd(), 'data', 'audio');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function resolveUserId(c: Context): string | null {
  const token = getCookie(c, 'session');
  if (!token) return null;
  try {
    const row = getDB()
      .prepare(
        `SELECT u.id FROM sessions s JOIN users u ON s.user_id = u.id
         WHERE s.token = ? AND s.expires_at > datetime('now')`
      )
      .get(token) as { id: string } | undefined;
    return row?.id ?? null;
  } catch {
    return null;
  }
}

app.post('/upload', async (c) => {
  const userId = resolveUserId(c);
  if (!userId) return c.json({ error: 'לא מחובר' }, 401);

  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File | null;
    const title = formData.get('title') as string | null;

    if (!audioFile) return c.json({ error: 'חסר קובץ אודיו' }, 400);
    if (audioFile.size > 50 * 1024 * 1024) return c.json({ error: 'הקובץ גדול מדי (מקסימום 50MB)' }, 413);
    if (!audioFile.type.startsWith('audio/')) return c.json({ error: 'יש להעלות קובץ אודיו בלבד' }, 415);

    const timestamp = Date.now();
    const filename = `${timestamp}-${audioFile.name}`;
    const audioDir = getAudioDir();
    const filepath = join(audioDir, filename);

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    writeFileSync(filepath, buffer);

    const db = getDB();
    const result = db
      .prepare(
        `INSERT INTO recordings (user_id, title, audio_key, file_size_bytes)
         VALUES (?, ?, ?, ?)`
      )
      .run(
        userId,
        title || `הקלטה ${new Date().toLocaleDateString('he-IL')}`,
        filename,
        audioFile.size
      );

    return c.json({ success: true, id: result.lastInsertRowid, key: filename });
  } catch (error) {
    console.error('שגיאה בהעלאת הקלטה:', error);
    return c.json({ error: 'שגיאה בהעלאת ההקלטה' }, 500);
  }
});

app.get('/list', (c) => {
  const userId = resolveUserId(c);
  if (!userId) return c.json({ error: 'לא מחובר' }, 401);

  try {
    const rows = getDB()
      .prepare(
        `SELECT id, title, audio_key, duration_seconds, file_size_bytes, created_at
         FROM recordings WHERE user_id = ? ORDER BY created_at DESC`
      )
      .all(userId);
    return c.json({ recordings: rows });
  } catch (error) {
    console.error('שגיאה בטעינת הקלטות:', error);
    return c.json({ error: 'שגיאה בטעינת ההקלטות' }, 500);
  }
});

app.get('/:id/audio', (c) => {
  const userId = resolveUserId(c);
  if (!userId) return c.json({ error: 'לא מחובר' }, 401);

  try {
    const id = c.req.param('id');
    const recording = getDB()
      .prepare(`SELECT audio_key, title FROM recordings WHERE id = ? AND user_id = ?`)
      .get(id, userId) as { audio_key: string; title: string } | undefined;

    if (!recording) return c.json({ error: 'ההקלטה לא נמצאה' }, 404);

    const filepath = join(getAudioDir(), recording.audio_key);
    if (!existsSync(filepath)) return c.json({ error: 'קובץ האודיו לא נמצא' }, 404);

    const buffer = readFileSync(filepath);
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/webm',
        'Content-Disposition': `attachment; filename="${recording.title}.webm"`,
      },
    });
  } catch (error) {
    console.error('שגיאה בהורדת הקלטה:', error);
    return c.json({ error: 'שגיאה בהורדת ההקלטה' }, 500);
  }
});

app.delete('/:id', (c) => {
  const userId = resolveUserId(c);
  if (!userId) return c.json({ error: 'לא מחובר' }, 401);

  try {
    const id = c.req.param('id');
    const recording = getDB()
      .prepare(`SELECT audio_key FROM recordings WHERE id = ? AND user_id = ?`)
      .get(id, userId) as { audio_key: string } | undefined;

    if (!recording) return c.json({ error: 'ההקלטה לא נמצאה' }, 404);

    const filepath = join(getAudioDir(), recording.audio_key);
    if (existsSync(filepath)) unlinkSync(filepath);

    getDB().prepare(`DELETE FROM recordings WHERE id = ?`).run(id);

    return c.json({ success: true });
  } catch (error) {
    console.error('שגיאה במחיקת הקלטה:', error);
    return c.json({ error: 'שגיאה במחיקת ההקלטה' }, 500);
  }
});

export default app;
