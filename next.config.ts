import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  allowedDevOrigins: ["192.168.86.32"],
};

export default nextConfig;
