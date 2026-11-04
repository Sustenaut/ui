import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Read from disk: Vitest doesn't load CSS, so importing it (even with ?raw) gives an empty string.
const read = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
const theme = read("theme.css");
const tokens = read("tokens.css");

// The custom properties set before and inside the dark-mode block, as name -> value.
function properties(css: string): { light: Record<string, string>; dark: Record<string, string> } {
  const parse = (part: string) =>
    Object.fromEntries([...part.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
  const [light, dark = ""] = css.replace(/\/\*[\s\S]*?\*\//g, "").split("@media (prefers-color-scheme: dark)");
  return { light: parse(light), dark: parse(dark) };
}

describe("tokens.css", () => {
  it("has theme.css's tokens, light and dark, so pages without Tailwind look the same", () => {
    const plain = properties(tokens);
    const tailwind = properties(theme);
    expect(Object.keys(plain.light).length).toBeGreaterThan(20);
    expect(Object.keys(plain.dark).length).toBeGreaterThan(10);
    expect(plain.light).toEqual(tailwind.light);
    expect(plain.dark).toEqual(tailwind.dark);
  });

  it("names Fontsource's variable fonts first", () => {
    const { light } = properties(tokens);
    expect(light["--font-sans"]).toMatch(/^"Nunito Sans Variable"/);
    expect(light["--font-display"]).toMatch(/^"Nunito Variable"/);
  });
});
