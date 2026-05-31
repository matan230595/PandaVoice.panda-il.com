import { Hono } from 'hono';
import { TranslateRequestSchema } from '@/shared/types';

const app = new Hono();

const languageNames: Record<string, string> = {
  he: 'Hebrew',
  en: 'English',
  ar: 'Arabic',
  ru: 'Russian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
};

app.post('/translate', async (c) => {
  try {
    const parsed = TranslateRequestSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const { text, sourceLang, targetLang, apiKey, provider } = parsed.data;
    const targetLanguage = languageNames[targetLang] || targetLang;

    const prompt = sourceLang === 'auto'
      ? `Detect the language of the following text and translate it to ${targetLanguage}. Return only the translation, without any explanations or additional text:\n\n${text}`
      : `Translate the following text from ${languageNames[sourceLang] || sourceLang} to ${targetLanguage}. Return only the translation, without any explanations or additional text:\n\n${text}`;

    let translation = '';

    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (!response.ok) throw new Error('Gemini API error');

      const data: GeminiResponse = await response.json();
      translation = data.candidates[0].content.parts[0].text;
    } else if (provider === 'groq') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) throw new Error('Groq API error');

      const data: OpenAIResponse = await response.json();
      translation = data.choices[0].message.content;
    }

    return c.json({ translation: translation.trim() });
  } catch (error) {
    console.error('Translation error:', error);
    return c.json({ error: 'Translation failed' }, 500);
  }
});

export default app;
