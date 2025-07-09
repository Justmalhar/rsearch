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
  env: {
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    SERPER_API_KEY: process.env.SERPER_API_KEY,
    FIRECRAWL_BASE_URL: process.env.FIRECRAWL_BASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OPENAI_ENDPOINT: process.env.OPENAI_ENDPOINT,
    CONTEXT_SIZE: process.env.CONTEXT_SIZE,
  },
  devIndicators: {
    appIsrStatus: false,
  },
}

module.exports = nextConfig;
