/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimize build performance
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
  },
}

module.exports = nextConfig;
