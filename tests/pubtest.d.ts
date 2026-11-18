// pubtest is JavaScript without types: what the suite uses of it.
declare module "@sustenaut/pubtest" {
  export function register(api: unknown, options?: { runner?: "cucumber" | "quickpickle"; client?: unknown }): void;
}
