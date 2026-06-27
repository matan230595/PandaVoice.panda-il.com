import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "./useAppStore";

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      content: "",
      isDarkMode: false,
      isRecording: false,
      isSpeaking: false,
      seenOnboarding: false,
      apiKeys: {
        gemini: "",
        groq: "",
        hf: "",
        openai: "",
        claude: "",
      },
      ttsSettings: {
        rate: 1,
        pitch: 1,
        voice: "",
        langFilter: "all",
      },
    });
  });

  it("sets content", () => {
    useAppStore.getState().setContent("שלום עולם");
    expect(useAppStore.getState().content).toBe("שלום עולם");
  });

  it("toggles dark mode", () => {
    expect(useAppStore.getState().isDarkMode).toBe(false);
    useAppStore.getState().toggleDarkMode();
    expect(useAppStore.getState().isDarkMode).toBe(true);
    useAppStore.getState().toggleDarkMode();
    expect(useAppStore.getState().isDarkMode).toBe(false);
  });

  it("sets recording state", () => {
    useAppStore.getState().setRecording(true);
    expect(useAppStore.getState().isRecording).toBe(true);
  });

  it("sets speaking state", () => {
    useAppStore.getState().setSpeaking(true);
    expect(useAppStore.getState().isSpeaking).toBe(true);
  });

  it("sets API key", () => {
    useAppStore.getState().setApiKey("gemini", "test-key");
    expect(useAppStore.getState().apiKeys.gemini).toBe("test-key");
  });

  it("updates TTS settings partially", () => {
    useAppStore.getState().setTTSSettings({ rate: 1.5, pitch: 1.2 });
    expect(useAppStore.getState().ttsSettings.rate).toBe(1.5);
    expect(useAppStore.getState().ttsSettings.pitch).toBe(1.2);
    expect(useAppStore.getState().ttsSettings.voice).toBe("");
  });

  it("updates config partially", () => {
    useAppStore.getState().setConfig({ brand: "New Brand" });
    expect(useAppStore.getState().config.brand).toBe("New Brand");
    expect(useAppStore.getState().config.emoji).toBe("🐼");
  });

  it("resets config to defaults", () => {
    useAppStore.getState().setConfig({ brand: "Changed" });
    useAppStore.getState().resetConfig();
    expect(useAppStore.getState().config.brand).toBe("Pandavoice");
  });

  it("sets seen onboarding", () => {
    expect(useAppStore.getState().seenOnboarding).toBe(false);
    useAppStore.getState().setSeenOnboarding();
    expect(useAppStore.getState().seenOnboarding).toBe(true);
  });
});
