import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  // External packages for serverless compatibility (works with both Turbopack and Webpack)
  serverExternalPackages: ['typeorm', 'pg', 'pg-native', 'strnum'],

  // Empty turbopack config to acknowledge we're using Turbopack
  turbopack: {},
};

export default nextConfig;
