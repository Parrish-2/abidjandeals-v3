/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
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
          // Empêche le clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Empêche le sniffing de type MIME
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Protection XSS basique
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Force HTTPS pendant 1 an
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Contrôle les infos de référence
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Désactive les fonctionnalités navigateur inutiles
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
