// What the tests use of Node, so typechecking needs no @types/node.
declare module "node:fs" {
  export function readFileSync(path: URL, encoding: "utf8"): string;
}

// The same declaration as Vite's and @types/node's, so it merges with either.
interface ImportMeta {
  url: string;
}
