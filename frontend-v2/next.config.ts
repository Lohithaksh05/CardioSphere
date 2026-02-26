import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ── Image optimisation ── */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  /* ── Performance ── */
  reactStrictMode: true,

  /* ── Bundle optimisation — mark heavy client-only libs as external in middleware ── */
  serverExternalPackages: [],

  /* ── Experimental flags for speed ── */
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
    ],
  },
};

export default nextConfig;
