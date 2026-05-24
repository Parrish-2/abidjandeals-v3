'use client'
import Link from 'next/link'
import { AdCard } from '@/components/AdCard'

interface AdsSectionProps {
  title: string
  ads: any[]
  seeAllHref: string
}

export function AdsSection({ title, ads, seeAllHref }: AdsSectionProps) {
  if (!ads.length) return null

  // Trie les annonces boostées (encore actives) en haut, puis les autres
  const sorted = [...ads].sort((a, b) => {
    const aActive = a.is_boosted && (!a.boost_until || new Date(a.boost_until) > new Date())
    const bActive = b.is_boosted && (!b.boost_until || new Date(b.boost_until) > new Date())
    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1
    return 0
  })

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-sans font-bold text-2xl text-dark">{title}</h2>
        <Link
          href={seeAllHref}
          className="text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors"
        >
          Voir tout →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {sorted.slice(0, 8).map(ad => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  )
}