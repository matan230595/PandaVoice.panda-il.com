import { describe, it, expect } from 'vitest';
import { AIRequestSchema, TranslateRequestSchema } from './types';

describe('AIRequestSchema', () => {
  it('accepts valid request', () => {
    const result = AIRequestSchema.safeParse({
      prompt: 'סכם את הטקסט',
      text: 'טקסט לדוגמה',
      apiKey: 'key-123',
      provider: 'gemini',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty prompt', () => {
    const result = AIRequestSchema.safeParse({ prompt: '', text: 'טקסט', apiKey: 'k', provider: 'gemini' });
    expect(result.success).toBe(false);
  });

  it('rejects prompt over 2000 chars', () => {
    const result = AIRequestSchema.safeParse({ prompt: 'א'.repeat(2001), text: 'טקסט', apiKey: 'k', provider: 'gemini' });
    expect(result.success).toBe(false);
  });

  it('rejects text over 50000 chars', () => {
    const result = AIRequestSchema.safeParse({ prompt: 'p', text: 'א'.repeat(50001), apiKey: 'k', provider: 'gemini' });
    expect(result.success).toBe(false);
  });

  it('rejects unknown provider', () => {
    const result = AIRequestSchema.safeParse({ prompt: 'p', text: 't', apiKey: 'k', provider: 'bard' });
    expect(result.success).toBe(false);
  });
});

describe('TranslateRequestSchema', () => {
  it('accepts valid request', () => {
    const result = TranslateRequestSchema.safeParse({
      text: 'Hello',
      sourceLang: 'en',
      targetLang: 'he',
      apiKey: 'k',
      provider: 'groq',
    });
    expect(result.success).toBe(true);
  });

  it('rejects text over 50000 chars', () => {
    const result = TranslateRequestSchema.safeParse({
      text: 'א'.repeat(50001),
      sourceLang: 'en',
      targetLang: 'he',
      apiKey: 'k',
      provider: 'openai',
    });
    expect(result.success).toBe(false);
  });
});
