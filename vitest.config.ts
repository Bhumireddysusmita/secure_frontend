import { defineConfig } from "vitest/config";

// Unit tests only; the Playwright suite in e2e/ is run by `npm run test:e2e`.
export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
});
