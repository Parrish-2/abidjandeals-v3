/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@vladmandic/face-api',
      ]
    }
    config.ignoreWarnings = [{ module: /@vladmandic\/face-api/ }]
    return config
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
      { protocol: 'https', hostname: '**.supabase.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://vercel.live blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src * data: blob:",
              "media-src 'self' blob: data: https://*.supabase.co https://*.supabase.in https://*.supabase.com",
              "connect-src * blob: data:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "worker-src 'self' blob: data:",
              "frame-src 'self' https://vercel.live",
              "object-src 'none'",
              "manifest-src 'self'",
              "script-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://vercel.live blob:",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
