import { describe, it, expect } from "vitest";
import { AIRequestSchema, TranslateRequestSchema, SessionRequestSchema } from "./types";

describe("AIRequestSchema", () => {
  it("validates a correct request", () => {
    const result = AIRequestSchema.safeParse({
      prompt: "תקן טקסט",
      text: "שלום עולם",
      apiKey: "AIza-test-key",
      provider: "gemini",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = AIRequestSchema.safeParse({ prompt: "test" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid provider", () => {
    const result = AIRequestSchema.safeParse({
      prompt: "test",
      text: "test",
      apiKey: "key",
      provider: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("TranslateRequestSchema", () => {
  it("validates gemini provider", () => {
    const result = TranslateRequestSchema.safeParse({
      text: "שלום",
      sourceLang: "he",
      targetLang: "en",
      apiKey: "key",
      provider: "gemini",
    });
    expect(result.success).toBe(true);
  });

  it("rejects openai provider", () => {
    const result = TranslateRequestSchema.safeParse({
      text: "test",
      sourceLang: "en",
      targetLang: "he",
      apiKey: "key",
      provider: "openai",
    });
    expect(result.success).toBe(false);
  });

  it("accepts auto source language", () => {
    const result = TranslateRequestSchema.safeParse({
      text: "Hello",
      sourceLang: "auto",
      targetLang: "he",
      apiKey: "key",
      provider: "groq",
    });
    expect(result.success).toBe(true);
  });
});

describe("SessionRequestSchema", () => {
  it("validates a code", () => {
    const result = SessionRequestSchema.safeParse({ code: "abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty code", () => {
    const result = SessionRequestSchema.safeParse({ code: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing code", () => {
    const result = SessionRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
