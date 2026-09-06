import type { NextConfig } from "next";

/* Set by the Pages workflow to "/<repo>"; empty for local dev and for any
   deploy that serves from a domain root. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  /* Emit results/index.html rather than results.html. GitHub Pages resolves a
     bare /results only if that directory exists; unlike Netlify it will not
     fall back to a sibling .html file, so without this the page 404s. */
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
