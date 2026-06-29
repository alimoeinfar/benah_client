import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const PIPELINE_URL = process.env.PIPELINE_URL || "http://localhost:8001";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
      {
        source: "/pipeline-api/:path*",
        destination: `${PIPELINE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
