'use client'

// src/components/AdCard.tsx

import { formatFCFA } from '@/lib/format'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import type { BoostLevel } from '@/types/admin'
import { CheckCircle, Eye, Heart, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// ─── Import du slider unifié ──────────────────────────────────────────────────
import MediaSlider, { type MediaItem } from './MediaSlider'

interface AdCardProps {
  ad: {
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
    seller_is_pro?: boolean   // ← NOUVEAU : badge Pro vendeur (optionnel)
  }
}

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  boost: { label: 'Boosté', className: 'bg-orange-500 text-white' },
  new: { label: 'Nouveau', className: 'bg-emerald-500 text-white' },
  urgent: { label: 'Urgent', className: 'bg-red-500 text-white' },
  pro: { label: 'Pro', className: 'bg-violet-600 text-white' },
}

const BOOST_LEVEL_LABEL: Record<BoostLevel, string> = {
  STANDARD: '⚡ Sponsorisé',
  PREMIUM: '★ Sponsorisé Premium',
  URGENT: '🔥 Sponsorisé Urgent',
}

const BOOST_LEVEL_STYLE: Record<BoostLevel, { bg: string; border: string; text: string; icon: string }> = {
  STANDARD: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', icon: 'text-orange-500' },
  PREMIUM: { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', icon: 'text-violet-500' },
  URGENT: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', icon: 'text-red-500' },
}

const BOOST_LEVEL_RING: Record<BoostLevel, string> = {
  STANDARD: 'ring-2 ring-orange-400 shadow-md shadow-orange-100',
  PREMIUM: 'ring-2 ring-violet-400 shadow-md shadow-violet-100',
  URGENT: 'ring-2 ring-red-400 shadow-md shadow-red-100',
}

function buildMediaItems(ad: AdCardProps['ad']): MediaItem[] {
  if (ad.media && ad.media.length > 0) return ad.media
  if (ad.img) return [{ type: 'image', url: ad.img }]
  return []
}

export function AdCard({ ad }: AdCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const { user, setAuthModalOpen } = useStore()

  // ── Charge l'état réel du favori depuis la DB au montage ──────────────────
  useEffect(() => {
    if (!user) { setLiked(false); return }
    let cancelled = false
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('ad_id', String(ad.id))
      .maybeSingle()
      .then(({ data }) => { if (!cancelled) setLiked(!!data) })
    return () => { cancelled = true }
  }, [user, ad.id])

  const badge = ad.badge ? BADGE_CONFIG[ad.badge] : null

  const isBoosted =
    ad.is_boosted &&
    (!ad.boost_until || new Date(ad.boost_until) > new Date())

  const boostLevel: BoostLevel = ad.boost_level ?? 'STANDARD'
  const boostStyle = isBoosted ? BOOST_LEVEL_STYLE[boostLevel] : null
  const boostLabel = isBoosted ? BOOST_LEVEL_LABEL[boostLevel] : null
  const boostRing = isBoosted ? BOOST_LEVEL_RING[boostLevel] : ''

  const mediaItems = buildMediaItems(ad)

  async function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      setAuthModalOpen(true)
      toast('Connectez-vous pour ajouter aux favoris', { icon: '🔐' })
      return
    }

    setLikeLoading(true)
    try {
      if (liked) {
        await supabase.from('favorites').delete()
          .eq('user_id', user.id)
          .eq('ad_id', String(ad.id))
        setLiked(false)
        toast.success('Retiré des favoris')
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          ad_id: String(ad.id),
        })
        setLiked(true)
        toast.success('Ajouté aux favoris ❤️')
      }
    } catch {
      toast.error('Erreur, réessayez')
    }
    setLikeLoading(false)
  }

  return (
    <Link href={`/ad/${ad.id}`} className="group block">
      <div className={`card overflow-hidden hover:-translate-y-1 transition-all duration-300 ${boostRing}`}>

        {/* ── Bandeau Sponsorisé ─────────────────────────────────────────────── */}
        {isBoosted && boostStyle && boostLabel && (
          <div className={`flex items-center gap-1.5 ${boostStyle.bg} border-b ${boostStyle.border} px-3 py-1.5`}>
            <span className={`${boostStyle.icon} text-xs`}>
              {boostLevel === 'PREMIUM' ? '★' : boostLevel === 'URGENT' ? '🔥' : '⭐'}
            </span>
            <span className={`${boostStyle.text} text-xs font-semibold tracking-wide uppercase`}>
              {boostLabel}
            </span>
          </div>
        )}

        {/* ── Zone média ────────────────────────────────────────────────────── */}
        <div className="relative">
          {mediaItems.length > 0 ? (
            <MediaSlider
              media={mediaItems}
              alt={ad.title}
              aspectClass="aspect-[4/3]"
            />
          ) : (
            <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-5xl">
              {ad.emoji || '📦'}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {badge && (
            <span className={`absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-full pointer-events-none ${badge.className}`}>
              {badge.label}
            </span>
          )}

          <button
            onClick={handleFavorite}
            disabled={likeLoading}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all
              ${liked
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>

          {ad.certified && (
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full pointer-events-none">
              <CheckCircle size={10} />
              Certifié
            </div>
          )}
        </div>

        {/* ── Infos de l'annonce ────────────────────────────────────────────── */}
        <div className="p-4">
          <h3 className="font-semibold text-dark text-sm line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug mb-2">
            {ad.title}
          </h3>
          <div className="text-orange-500 font-bold text-base font-sans mb-3">
            {formatFCFA(ad.price)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={11} />
              <span>{ad.quartier ? `${ad.quartier}, ` : ''}{ad.city}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Eye size={11} />
              <span>{ad.views}</span>
            </div>
          </div>
        </div>

        {/* ── Pied de carte ─────────────────────────────────────────────────── */}
        <div className="px-4 pb-3 flex items-center justify-between border-t border-gray-50 pt-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-500 truncate">{ad.seller}</span>
            {/* ── Badge Pro vendeur ── */}
            {ad.seller_is_pro && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                background: '#0F1117',
                color: '#F5C842',
                border: '1px solid #F5C842',
                borderRadius: 4,
                padding: '1px 6px',
                flexShrink: 0,
                letterSpacing: '0.03em',
              }}>
                PRO
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* ── Bouton WhatsApp share ── */}
            <button
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                const text = encodeURIComponent(
                  `"${ad.title}" - ${ad.price ? new Intl.NumberFormat('fr-CI').format(ad.price) + ' FCFA' : ''}\nhttps://www.kivoo.ci/ad/${ad.id}`
                )
                window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener')
              }}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 transition-colors"
              title="Partager sur WhatsApp"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
            {ad.etat && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ad.etat === 'Neuf' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                {ad.etat}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
