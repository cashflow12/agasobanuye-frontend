import type { NextConfig } from "next";
const nextConfig: NextConfig = {
 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Add these for production
    unoptimized: process.env.NODE_ENV === 'production', // Disable optimization on Fly.io
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Increase memory limit
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  typescript: {
  ignoreBuildErrors: true,
},

  // Output standalone for better Fly.io compatibility
  output: 'export',
};

export default nextConfig;
