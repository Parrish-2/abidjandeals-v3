import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/publier',
        ],
      },
    ],
    sitemap: 'https://www.kivoo.ci/sitemap.xml',
  }
}
