import { z } from "zod";

export const AIRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  text: z.string().min(1, "Text is required"),
  apiKey: z.string().min(1, "API key is required"),
  provider: z.enum(["gemini", "groq", "openai"]),
});

export const TranslateRequestSchema = z.object({
  text: z.string().min(1),
  sourceLang: z.string().min(1),
  targetLang: z.string().min(1),
  apiKey: z.string().min(1),
  provider: z.enum(["gemini", "groq"]),
});

export const SessionRequestSchema = z.object({
  code: z.string().min(1),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;
export type SessionRequest = z.infer<typeof SessionRequestSchema>;
