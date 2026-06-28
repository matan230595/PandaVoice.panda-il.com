import { z } from "zod";

export const AIRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  text: z.string().min(1).max(50_000),
  apiKey: z.string().min(1).max(500),
  provider: z.enum(["gemini", "groq", "openai"]),
});

export const TranslateRequestSchema = z.object({
  text: z.string().min(1).max(50_000),
  sourceLang: z.string().min(1).max(20),
  targetLang: z.string().min(1).max(20),
  apiKey: z.string().min(1).max(500),
  provider: z.enum(["gemini", "groq", "openai"]),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;
