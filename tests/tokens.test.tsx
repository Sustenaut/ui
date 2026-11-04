import { describe, expect, it } from "vitest";
import theme from "../src/theme.css?raw";
import tokens from "../src/tokens.css?raw";

// The custom properties set before and inside the dark-mode block, as name -> value.
function properties(css: string): { light: Record<string, string>; dark: Record<string, string> } {
  const read = (part: string) =>
    Object.fromEntries([...part.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
  const [light, dark = ""] = css.replace(/\/\*[\s\S]*?\*\//g, "").split("@media (prefers-color-scheme: dark)");
  return { light: read(light), dark: read(dark) };
}

describe("tokens.css", () => {
  it("has theme.css's tokens, light and dark, so pages without Tailwind look the same", () => {
    const plain = properties(tokens);
    const tailwind = properties(theme);
    expect(Object.keys(plain.light).length).toBeGreaterThan(20);
    expect(plain.light).toEqual(tailwind.light);
    expect(plain.dark).toEqual(tailwind.dark);
  });

  it("names Fontsource's variable fonts first", () => {
    const { light } = properties(tokens);
    expect(light["--font-sans"]).toMatch(/^"Nunito Sans Variable"/);
    expect(light["--font-display"]).toMatch(/^"Nunito Variable"/);
  });
});
