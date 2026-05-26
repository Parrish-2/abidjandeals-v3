'use client'

import { AdCard } from '@/components/AdCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Types alignés sur AdCard
type BoostLevel = 'STANDARD' | 'PREMIUM' | 'URGENT'

interface MediaItem {
  url: string
  type: 'image' | 'video'
  thumbnail?: string
}

interface Ad {
  id: number | string
  title: string
  price: number
  city: string
  quartier?: string
  etat?: string
  seller: string
  certified?: boolean
  views: number
  badge?: string | null
  img?: string
  media?: MediaItem[]
  emoji?: string
  category: string
  is_boosted?: boolean
  boost_until?: string | null
  boost_level?: BoostLevel | null
}

interface AdsSectionProps {
  title: string
  ads: Ad[]
  seeAllHref: string
  currentPage: number      // ← présentes
  totalPages: number
  total: number
}

export function AdsSection({
  title,
  ads,
  seeAllHref,
  currentPage,
  totalPages,
  total,
}: AdsSectionProps) {
  const router = useRouter()

  if (!ads.length) return null

  const sorted = [...ads].sort((a, b) => {
    const aActive = a.is_boosted && (!a.boost_until || new Date(a.boost_until) > new Date())
    const bActive = b.is_boosted && (!b.boost_until || new Date(b.boost_until) > new Date())
    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1
    return 0
  })

  const goTo = (page: number) => {
    router.push(`/?page=${page}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | '...')[] = [1]
    if (currentPage > 3) pages.push('...')
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sans font-bold text-2xl text-dark">{title}</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {total} annonce{total > 1 ? 's' : ''} · Page {currentPage} sur {totalPages}
          </p>
        </div>
        <Link
          href={seeAllHref}
          className="text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {sorted.map(ad => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={16} />
            Précédent
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goTo(p as number)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${currentPage === p
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'
                    }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Suivant
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  )
}