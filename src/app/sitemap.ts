// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://abidjandeals.ci'
const PAGE_SIZE = 1000

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL,                       lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE_URL}/search`,           lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
  { url: `${BASE_URL}/vendeur`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/cgu`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE_URL}/confidentialite`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE_URL}/securite`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE_URL}/contact`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/charte-securite`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
]

const CATEGORIES = [
  'hightech-informatique',
  'vehicules-equipements',
  'immobilier',
  'maison',
  'services',
  'mode-beaute',
  'emploi',
  'loisirs',
  'alimentation',
  'autres',
]

const CATEGORY_PAGES: MetadataRoute.Sitemap = CATEGORIES.map(slug => ({
  url: `${BASE_URL}/search?category=${slug}`,
  lastModified: new Date(),
  changeFrequency: 'daily' as const,
  priority: 0.8,
}))

async function getAllAdUrls(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin()
  const pages: MetadataRoute.Sitemap = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('ads')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error(`[sitemap] page ${from / PAGE_SIZE + 1} error:`, error.message)
      break
    }

    if (!data || data.length === 0) {
      hasMore = false
      break
    }

    for (const ad of data) {
      // ✅ FIX CRITIQUE : URL avec UUID complet — correspond exactement
      // à la route réelle /ad/[id] dans Next.js
      // L'ancien slug tronqué générait des URLs 404 dans Google
      pages.push({
        url: `${BASE_URL}/ad/${ad.id}`,
        lastModified: ad.updated_at ? new Date(ad.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    if (data.length < PAGE_SIZE) {
      hasMore = false
    } else {
      from += PAGE_SIZE
    }

    // Sécurité : limite Google 50 000 URLs par fichier sitemap
    if (from >= 49_000) {
      console.warn('[sitemap] limite 49 000 atteinte — implémenter sitemap index')
      hasMore = false
    }
  }

  return pages
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const adPages = await getAllAdUrls()
  return [...STATIC_PAGES, ...CATEGORY_PAGES, ...adPages]
}