'use client'

// src/components/AdCard.tsx

import Link from 'next/link'
import { Heart, Eye, MapPin, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { formatFCFA } from '@/lib/format'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { BoostLevel } from '@/types/admin'

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
    img?: string              // ← conservé pour rétrocompatibilité
    media?: MediaItem[]       // ← NOUVEAU : tableau mixte photos + vidéos
    emoji?: string
    category: string
    is_boosted?: boolean
    boost_until?: string | null
    boost_level?: BoostLevel | null
  }
}

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  boost:  { label: 'Boosté',  className: 'bg-orange-500 text-white' },
  new:    { label: 'Nouveau', className: 'bg-emerald-500 text-white' },
  urgent: { label: 'Urgent',  className: 'bg-red-500 text-white' },
  pro:    { label: 'Pro',     className: 'bg-violet-600 text-white' },
}

const BOOST_LEVEL_LABEL: Record<BoostLevel, string> = {
  STANDARD: '⚡ Sponsorisé',
  PREMIUM:  '★ Sponsorisé Premium',
  URGENT:   '🔥 Sponsorisé Urgent',
}

const BOOST_LEVEL_STYLE: Record<BoostLevel, { bg: string; border: string; text: string; icon: string }> = {
  STANDARD: { bg: 'bg-orange-50',  border: 'border-orange-100', text: 'text-orange-600', icon: 'text-orange-500' },
  PREMIUM:  { bg: 'bg-violet-50',  border: 'border-violet-100', text: 'text-violet-700', icon: 'text-violet-500' },
  URGENT:   { bg: 'bg-red-50',     border: 'border-red-100',    text: 'text-red-600',    icon: 'text-red-500'    },
}

const BOOST_LEVEL_RING: Record<BoostLevel, string> = {
  STANDARD: 'ring-2 ring-orange-400 shadow-md shadow-orange-100',
  PREMIUM:  'ring-2 ring-violet-400 shadow-md shadow-violet-100',
  URGENT:   'ring-2 ring-red-400 shadow-md shadow-red-100',
}

// ─── Construit le tableau MediaItem depuis les données de l'annonce ───────────
function buildMediaItems(ad: AdCardProps['ad']): MediaItem[] {
  if (ad.media && ad.media.length > 0) return ad.media
  if (ad.img) return [{ type: 'image', url: ad.img }]
  return []
}

export function AdCard({ ad }: AdCardProps) {
  const [liked, setLiked]             = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const { user, setAuthModalOpen }    = useStore()
  const badge                         = ad.badge ? BADGE_CONFIG[ad.badge] : null

  const isBoosted =
    ad.is_boosted &&
    (!ad.boost_until || new Date(ad.boost_until) > new Date())

  const boostLevel: BoostLevel = ad.boost_level ?? 'STANDARD'
  const boostStyle = isBoosted ? BOOST_LEVEL_STYLE[boostLevel] : null
  const boostLabel = isBoosted ? BOOST_LEVEL_LABEL[boostLevel] : null
  const boostRing  = isBoosted ? BOOST_LEVEL_RING[boostLevel] : ''

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

        {/* ── Zone média : slider unifié photos + vidéo ─────────────────────── */}
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
          <span className="text-xs text-gray-500 truncate">{ad.seller}</span>
          {ad.etat && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ad.etat === 'Neuf' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
              {ad.etat}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
