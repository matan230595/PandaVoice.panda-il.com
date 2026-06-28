/// <reference types="vitest/config" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/react-app/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["src/**/*.integration.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      include: ["src/server/**/*.ts", "src/shared/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.integration.test.ts"],
      thresholds: { lines: 50, functions: 50, branches: 40, statements: 50 },
    },
  },
});
