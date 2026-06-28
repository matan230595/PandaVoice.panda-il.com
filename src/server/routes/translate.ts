import { Hono } from 'hono';
import { TranslateRequestSchema } from '@/shared/types';
import { checkRateLimit, getClientIp } from '@/server/middleware/rateLimit';

interface GeminiResponse {
  candidates: { content: { parts: { text: string }[] } }[];
}
interface OpenAIResponse {
  choices: { message: { content: string } }[];
}

const languageNames: Record<string, string> = {
  he: 'Hebrew', en: 'English', ar: 'Arabic', ru: 'Russian',
  es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
};

const app = new Hono();

app.post('/translate', async (c) => {
  const ip = getClientIp(c.req.raw.headers);
  if (!checkRateLimit(ip)) return c.json({ error: 'יותר מדי בקשות, נסה שוב בעוד דקה' }, 429);
  try {
    const parsed = TranslateRequestSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: 'Missing required fields' }, 400);

    const { text, sourceLang, targetLang, apiKey, provider } = parsed.data;
    const targetLanguage = languageNames[targetLang] || targetLang;

    const prompt = sourceLang === 'auto'
      ? `Detect the language of the following text and translate it to ${targetLanguage}. Return only the translation, without any explanations:\n\n${text}`
      : `Translate the following text from ${languageNames[sourceLang] || sourceLang} to ${targetLanguage}. Return only the translation, without any explanations:\n\n${text}`;

    let translation = '';

    if (provider === 'gemini') {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: AbortSignal.timeout(30000),
        }
      );
      if (!res.ok) throw new Error('Gemini API error');
      const data = await res.json() as GeminiResponse;
      translation = data.candidates[0].content.parts[0].text;

    } else if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'mixtral-8x7b-32768', messages: [{ role: 'user', content: prompt }] }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error('Groq API error');
      const data = await res.json() as OpenAIResponse;
      translation = data.choices[0].message.content;

    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error('OpenAI API error');
      const data = await res.json() as OpenAIResponse;
      translation = data.choices[0].message.content;
    }

    return c.json({ translation: translation.trim() });
  } catch (error) {
    console.error('Translation error:', error);
    return c.json({ error: 'Translation failed' }, 500);
  }
});

export default app;
