/* Prefix for files served out of `public/`.
 *
 * GitHub Pages serves a project site under `/<repo>/`, so every absolute path
 * in the markup needs that prefix or it resolves against the domain root and
 * 404s. Next rewrites its own `next/link` and bundle URLs from `basePath`, but
 * a literal `src="/figs/…"` is just a string and is left alone — hence this.
 *
 * NEXT_PUBLIC_BASE_PATH is inlined at build time and empty everywhere else, so
 * `npm run dev` and any root-domain deploy are unaffected. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE}${path}`;
