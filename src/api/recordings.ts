import { Hono } from 'hono';
import { authMiddleware } from '@getmocha/users-service/backend';

const app = new Hono<{ Bindings: Env }>();

app.post('/upload', authMiddleware, async (c) => {
  const user = c.get('user') as { id: string } | undefined;
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File | null;
    const title = formData.get('title') as string | null;

    if (!audioFile) {
      return c.json({ error: 'חסר קובץ אודיו' }, 400);
    }

    const timestamp = Date.now();
    const key = `recordings/${timestamp}-${audioFile.name}`;

    await c.env.R2_BUCKET.put(key, audioFile.stream(), {
      httpMetadata: { contentType: audioFile.type },
    });

    const result = await c.env.DB.prepare(
      `INSERT INTO recordings (user_id, title, audio_key, file_size_bytes)
       VALUES (?, ?, ?, ?)`
    ).bind(
      user.id,
      title || `הקלטה ${new Date().toLocaleDateString('he-IL')}`,
      key,
      audioFile.size
    ).run();

    return c.json({
      success: true,
      id: result.meta.last_row_id,
      key,
    });
  } catch (error) {
    console.error('שגיאה בהעלאת הקלטה:', error);
    return c.json({ error: 'שגיאה בהעלאת ההקלטה' }, 500);
  }
});

app.get('/list', authMiddleware, async (c) => {
  const user = c.get('user') as { id: string } | undefined;
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const result = await c.env.DB.prepare(
      `SELECT id, title, audio_key, duration_seconds, file_size_bytes, created_at
       FROM recordings WHERE user_id = ?
       ORDER BY created_at DESC`
    ).bind(user.id).all();

    return c.json({ recordings: result.results });
  } catch (error) {
    console.error('שגיאה בטעינת הקלטות:', error);
    return c.json({ error: 'שגיאה בטעינת ההקלטות' }, 500);
  }
});

app.get('/:id/audio', authMiddleware, async (c) => {
  const user = c.get('user') as { id: string } | undefined;
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');

    const recording = await c.env.DB.prepare(
      `SELECT audio_key, title FROM recordings WHERE id = ? AND user_id = ?`
    ).bind(id, user.id).first<{ audio_key: string; title: string }>();

    if (!recording) {
      return c.json({ error: 'ההקלטה לא נמצאה' }, 404);
    }

    const object = await c.env.R2_BUCKET.get(recording.audio_key);

    if (!object) {
      return c.json({ error: 'קובץ האודיו לא נמצא' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('content-disposition', `attachment; filename="${recording.title}.webm"`);

    return c.body(object.body, { headers });
  } catch (error) {
    console.error('שגיאה בהורדת הקלטה:', error);
    return c.json({ error: 'שגיאה בהורדת ההקלטה' }, 500);
  }
});

app.delete('/:id', authMiddleware, async (c) => {
  const user = c.get('user') as { id: string } | undefined;
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');

    const recording = await c.env.DB.prepare(
      `SELECT audio_key FROM recordings WHERE id = ? AND user_id = ?`
    ).bind(id, user.id).first<{ audio_key: string }>();

    if (!recording) {
      return c.json({ error: 'ההקלטה לא נמצאה' }, 404);
    }

    await c.env.R2_BUCKET.delete(recording.audio_key);

    await c.env.DB.prepare(
      `DELETE FROM recordings WHERE id = ?`
    ).bind(id).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('שגיאה במחיקת הקלטה:', error);
    return c.json({ error: 'שגיאה במחיקת ההקלטה' }, 500);
  }
});

export default app;
