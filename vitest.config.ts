import { defineConfig } from "vitest/config";

// The unit tests: each component and JSON Forms renderer drawn in jsdom. The LCOV report goes to the CI's
// sonar job (coverage/lcov.info).
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.tsx"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      reporter: ["text-summary", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
