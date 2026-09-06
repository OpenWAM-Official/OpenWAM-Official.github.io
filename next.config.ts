import type { NextConfig } from "next";

/* Empty for a root site (https://<org>.github.io/ or a custom domain), "/<repo>"
   for a project site. The workflow passes whatever configure-pages reports.
   Next rejects a bare "/", which is what that action emits for a root site, so
   normalise it away rather than letting the build fail there. */
const raw = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath = raw === "/" ? "" : raw.replace(/\/$/, "");

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
