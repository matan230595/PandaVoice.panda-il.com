import { Hono } from 'hono';
import { AIRequestSchema } from '@/shared/types';

interface GeminiResponse {
  candidates: { content: { parts: { text: string }[] } }[];
}
interface OpenAIResponse {
  choices: { message: { content: string } }[];
}

const app = new Hono();

app.post('/ai', async (c) => {
  try {
    const parsed = AIRequestSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: 'Missing required fields' }, 400);

    const { prompt, text, apiKey, provider } = parsed.data;
    let result = '';

    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${prompt}\n\nטקסט:\n${text}` }] }] }),
          signal: AbortSignal.timeout(30000),
        }
      );
      if (!res.ok) throw new Error('Gemini API error');
      const data = await res.json() as GeminiResponse;
      result = data.candidates[0].content.parts[0].text;

    } else if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'mixtral-8x7b-32768', messages: [{ role: 'user', content: `${prompt}\n\nטקסט:\n${text}` }] }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error('Groq API error');
      const data = await res.json() as OpenAIResponse;
      result = data.choices[0].message.content;

    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: `${prompt}\n\nטקסט:\n${text}` }] }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error('OpenAI API error');
      const data = await res.json() as OpenAIResponse;
      result = data.choices[0].message.content;
    }

    return c.json({ result });
  } catch (error) {
    console.error('AI error:', error);
    return c.json({ error: 'AI processing failed' }, 500);
  }
});

export default app;
