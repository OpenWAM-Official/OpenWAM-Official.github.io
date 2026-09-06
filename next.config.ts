import type { NextConfig } from "next";

/* Set by the Pages workflow to "/<repo>"; empty for local dev and for any
   deploy that serves from a domain root. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
