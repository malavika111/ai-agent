import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Required for pdf-parse and other node-only modules in API routes
  serverExternalPackages: ["pdf-parse", "@ffmpeg-installer/ffmpeg", "fluent-ffmpeg"],
};

export default nextConfig;
