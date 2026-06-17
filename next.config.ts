import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Allow API routes up to 120s for local Ollama generation
    serverActions: { bodySizeLimit: '2mb' },
  },
  // Increase serverless function timeout
  serverExternalPackages: ['@anthropic-ai/sdk'],
}

export default nextConfig
