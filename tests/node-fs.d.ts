// The one Node function the tests use, so typechecking needs no @types/node.
declare module "node:fs" {
  export function readFileSync(path: URL, encoding: "utf8"): string;
}
