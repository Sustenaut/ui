// Vite's ?raw imports: a file's text, for tests that read a stylesheet.
declare module "*?raw" {
  const text: string;
  export default text;
}
