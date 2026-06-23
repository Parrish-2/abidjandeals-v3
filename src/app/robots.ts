import type { MetadataRoute } from 'next'

// ✅ FIX : URL depuis variable d'env — plus de domaine staging hardcodé
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://abidjandeals.ci'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Pages admin
          '/admin',
          '/admin/',
          '/moderation',
          '/moderation/',
          // Pages privées (redirigent les non-connectés → gaspillage crawl budget)
          '/dashboard',
          '/dashboard/',
          '/messages',
          '/messages/',
          '/favorites',
          '/favorites/',
          '/publier',
          '/publier/',
          '/verification-documents',
          '/verification-documents/',
          // Pages de profil avec données perso
          '/profile/',
          // Paramètres de tri — évite URLs dupliquées à l'infini
          '/search?*sort=price_desc*',
          '/search?*sort=price_asc*',
        ],
      },
      {
        // Bloquer les scrapers agressifs
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot'],
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}