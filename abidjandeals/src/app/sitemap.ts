import { createSupabaseServer } from '@/lib/supabase-server'
import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.kivoo.ci'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServer()

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/abonnements`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/cgu`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/securite`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/presse`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Pages annonces actives
  const { data: ads } = await supabase
    .from('ads')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1000)

  const adPages: MetadataRoute.Sitemap = (ads ?? []).map(ad => ({
    url: `${BASE_URL}/ad/${ad.id}`,
    lastModified: new Date(ad.updated_at ?? Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Pages boutiques actives
  const { data: boutiques } = await supabase
    .from('profiles')
    .select('boutique_slug, updated_at')
    .eq('boutique_active', true)
    .not('boutique_slug', 'is', null)

  const boutiquePages: MetadataRoute.Sitemap = (boutiques ?? []).map(b => ({
    url: `${BASE_URL}/boutique/${b.boutique_slug}`,
    lastModified: new Date(b.updated_at ?? Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...adPages, ...boutiquePages]
}
