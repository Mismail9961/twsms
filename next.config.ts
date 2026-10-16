import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    // Use the compiler API supported by the installed TypeScript 5.x version.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
