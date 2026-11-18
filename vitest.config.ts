import { quickpickle } from "quickpickle";
import { defineConfig } from "vitest/config";

// The scenarios (tests/features/), Gherkin run by quickpickle on vitest: each component and JSON Forms renderer
// drawn in jsdom. The LCOV report goes to the CI's sonar job (coverage/lcov.info).
export default defineConfig({
  plugins: [quickpickle()],
  test: {
    environment: "jsdom",
    include: ["tests/features/*.feature"],
    setupFiles: [
      "tests/setup.ts",
      "tests/dom.steps.tsx",
      "tests/components.steps.tsx",
      "tests/jsonforms.steps.tsx",
      "tests/shell.steps.tsx",
    ],
    // quickpickle inlined, so vite resolves its imports (pngjs/browser) as Node does not.
    server: { deps: { inline: ["quickpickle"] } },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      reporter: ["text-summary", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
