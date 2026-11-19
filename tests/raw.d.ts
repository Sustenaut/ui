// Vite's ?raw import: a file's text, as the theme-token scenario reads LiveRun.tsx.
declare module "*?raw" {
  const text: string;
  export default text;
}
