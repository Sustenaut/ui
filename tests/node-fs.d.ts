// What the tests use of Node, so typechecking needs no @types/node.
declare module "node:fs" {
  export function readFileSync(path: URL, encoding: "utf8"): string;
}

interface ImportMeta {
  readonly url: string;
}
