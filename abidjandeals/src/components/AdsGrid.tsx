'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Eye, ImageOff, Heart } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/contexts/i18nContext'

interface Ad {
  id: string
  title: string
  price: number
  images: string[] | null       // ✅ etait photos
  city: string
  category_id: string           // ✅ etait category
  views: number
  created_at: string
  boost_level: 'STANDARD' | 'PREMIUM' | 'URGENT' | null  // ✅ etait is_boosted + boost_until
}

const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIklEQVQI' +
  'W2NkYGD4z8BAAhgHkVkMpBhBZhCZAWQGkRkAXkABFgDtJiUAAAAASUVORK5CYII='

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  immobilier:        { bg: 'bg-emerald-50', text: 'text-emerald-400' },
  vehicules:         { bg: 'bg-blue-50',    text: 'text-blue-400'    },
  electronique:      { bg: 'bg-violet-50',  text: 'text-violet-400'  },
  'composants-pc':   { bg: 'bg-blue-50',    text: 'text-blue-400'    },
  mode:              { bg: 'bg-rose-50',    text: 'text-rose-400'    },
  maison:            { bg: 'bg-amber-50',   text: 'text-amber-400'   },
  services:          { bg: 'bg-indigo-50',  text: 'text-indigo-400'  },
  'equipements-pro': { bg: 'bg-orange-50',  text: 'text-orange-400'  },
  'sport-loisirs':   { bg: 'bg-cyan-50',    text: 'text-cyan-400'    },
}

function ImagePlaceholder({ category }: { category: string }) {
  const { t } = useI18n()
  const colors = CATEGORY_COLORS[category] ?? { bg: 'bg-gray-50', text: 'text-gray-300' }
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-1.5 ${colors.bg}`}>
      <ImageOff size={28} className={colors.text} strokeWidth={1.5} />
      <span className="text-[10px] text-gray-400 font-medium">{t('ad.no_photo')}</span>
    </div>
  )
}

// ✅ Bouton favori corrige avec gestion d erreur visible
function FavoriteButton({ adId }: { adId: string }) {
  const { user, setAuthModalOpen } = useStore()
  const [liked,   setLiked]   = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { setAuthModalOpen(true); return }
    setLoading(true)
    try {
      if (liked) {
        const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('ad_id', adId)
        if (!error) setLiked(false)
      } else {
        const { error } = await supabase.from('favorites').insert({ user_id: user.id, ad_id: adId })
        if (!error) setLiked(true)
      }
    } catch (err) {
      console.error('Favori error:', err)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleFavorite}
      disabled={loading}
      className={`absolute top-2 right-2 z-10 p-2 rounded-full shadow-md transition-all ${
        liked
          ? 'bg-red-500 text-white scale-110'
          : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
      }`}
    >
      <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
    </button>
  )
}

function EmptyState() {
  const { user, setAuthModalOpen, setPendingAction } = useStore()
  const { t } = useI18n()
  const router = useRouter()

  function handlePublish() {
    if (!user) { setPendingAction('publish'); setAuthModalOpen(true); return }
    router.push('/publier')
  }

  return (
    <div className="py-16 px-6 bg-white rounded-2xl border border-gray-100 flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center text-5xl mb-6 shadow-sm">
        🛍️
      </div>
      <h3 className="font-sans font-extrabold text-2xl text-dark mb-3 text-center">
        {t('home.recent_ads')}
      </h3>
      <p className="text-gray-500 text-base max-w-md text-center leading-relaxed mb-8">
        {t('ads.no_results')}
      </p>
      <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
        <button
          onClick={handlePublish}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-7 py-3 rounded-2xl transition-all hover:scale-105 text-sm shadow-sm shadow-orange-200"
        >
          🚀 {t('publish.title')}
        </button>
        <Link
          href="/search"
          className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold px-7 py-3 rounded-2xl transition-all hover:scale-105 text-sm"
        >
          {t('search.see_all_ads')}
        </Link>
      </div>
      <div className="flex items-center justify-center gap-6 flex-wrap pt-6 border-t border-gray-100 w-full max-w-lg">
        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <span className="text-green-500">✅</span> {t('hero.cta_free').split('·')[0].trim()}
        </span>
        <span className="w-px h-4 bg-gray-200 hidden sm:block" />
        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <span className="text-blue-500">🔒</span> {t('trust.certified')}
        </span>
        <span className="w-px h-4 bg-gray-200 hidden sm:block" />
        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <span className="text-green-400">💬</span> {t('trust.whatsapp')}
        </span>
      </div>
    </div>
  )
}

export function AdsGridSkeleton() {
  return (
    <div className="w-full px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-5 w-20 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-100" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdsGrid({ initialAds }: { initialAds: Ad[] }) {
  const { t } = useI18n()

  return (
    <div className="w-full px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-sans font-semibold text-2xl text-dark">{t('home.recent_ads')}</h2>
        <Link href="/search" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
          {t('home.see_all')}
        </Link>
      </div>

      {initialAds.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {initialAds.map((ad, index) => {
              // ✅ boost_level remplace is_boosted + boost_until
              const isBoosted = !!ad.boost_level
              // ✅ images[0] remplace photos[0]
              const photo = ad.images?.[0] ?? null

              return (
                <Link
                  key={ad.id}
                  href={`/ad/${ad.id}`}
                  className={`relative bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all group ${
                    isBoosted
                      ? 'border-2 border-orange-400 shadow-sm shadow-orange-100'
                      : 'border border-gray-100 hover:border-orange-200'
                  }`}
                >
                  <FavoriteButton adId={ad.id} />

                  {isBoosted && (
                    <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 border-b border-orange-100">
                      <span className="text-xs">⭐</span>
                      <span className="text-orange-600 text-xs font-semibold uppercase tracking-wide">
                        {t('ads.sponsored')}
                      </span>
                    </div>
                  )}

                  <div className="aspect-square overflow-hidden bg-gray-50 relative">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={ad.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={index < 6}
                        quality={75}
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      // ✅ category_id remplace category
                      <ImagePlaceholder category={ad.category_id} />
                    )}
                  </div>

                  <div className="p-3">
                    <p className="font-semibold text-dark text-[13px] line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug mb-1">
                      {ad.title}
                    </p>
                    <p className="text-orange-500 font-bold text-[15px]">
                      {Number(ad.price).toLocaleString('fr-CI')} FCFA
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <MapPin size={10} /> {ad.city}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Eye size={10} /> {ad.views || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold rounded-2xl transition-all duration-200 hover:scale-105"
            >
              {t('search.see_all_ads')} →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
