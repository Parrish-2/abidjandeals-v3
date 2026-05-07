'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import {
  Phone, MessageCircle, Heart, Share2, MapPin, Tag,
  ChevronLeft, ChevronRight, Eye, Clock, ShieldCheck,
  Star, BadgeCheck, ArrowLeft, Package, X, ZoomIn,
} from 'lucide-react'
import { formatFCFA, formatRelativeDate } from '@/lib/format'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdDetail {
  id: string
  title: string
  description: string
  price: number
  category_id: string
  subcategory?: string
  etat?: string
  marque?: string
  city: string
  quartier?: string
  tel?: string
  whatsapp?: string
  images: string[]
  video_url?: string
  views: number
  status: string
  created_at: string
  boost_level?: string
  user_id: string
  profiles?: {
    prenom: string
    nom: string
    avatar_url?: string
    verified_seller?: boolean
    trust_badge?: boolean
    is_pro?: boolean
    bio?: string
    note?: number
    nb_annonces?: number
    boutique_name?: string
  }
}

// ── Supabase ──────────────────────────────────────────────────────────────────

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Gallery ───────────────────────────────────────────────────────────────────

function Gallery({ images, videoUrl, title }: { images: string[]; videoUrl?: string; title: string }) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)

  const allMedia: { type: 'image' | 'video'; url: string }[] = [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
  ]

  if (allMedia.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-900 rounded-2xl flex items-center justify-center">
        <Package size={64} className="text-gray-700" />
      </div>
    )
  }

  const item = allMedia[current]
  const prev = () => setCurrent(i => (i - 1 + allMedia.length) % allMedia.length)
  const next = () => setCurrent(i => (i + 1) % allMedia.length)

  return (
    <>
      <div className="relative w-full bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={title}
            className="w-full h-full object-contain cursor-zoom-in"
            onClick={() => setLightbox(true)}
          />
        ) : (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay={videoPlaying}
            preload="auto"
            playsInline
            className="w-full h-full object-contain"
            onClick={() => setVideoPlaying(true)}
          />
        )}

        {/* Navigation arrows */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Counter */}
        {allMedia.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur">
            {current + 1} / {allMedia.length}
          </div>
        )}

        {/* Zoom icon for images */}
        {item.type === 'image' && (
          <button
            onClick={() => setLightbox(true)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-all"
          >
            <ZoomIn size={14} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {allMedia.map((m, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-orange-500' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {m.type === 'image' ? (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-xl">▶️</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && item.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            onClick={() => setLightbox(false)}
          >
            <X size={20} />
          </button>
          <img
            src={item.url}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [ad, setAd] = useState<AdDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [showTel, setShowTel] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch ad
  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          id, title, description, price, category_id, subcategory,
          etat, marque, city, quartier, tel, whatsapp,
          images, video_url, views, status, created_at, boost_level, user_id,
          profiles (
            prenom, nom, avatar_url, verified_seller, trust_badge,
            is_pro, bio, note, nb_annonces, boutique_name
          )
        `)
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setAd({ ...data, profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles } as unknown as AdDetail)
        // Increment views
        supabase.from('ads').update({ views: (data.views ?? 0) + 1 }).eq('id', id).then(() => {})
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Chargement de l&apos;annonce…</p>
        </div>
      </div>
    )
  }

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (notFound || !ad) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold text-white text-center">Annonce introuvable</h1>
        <p className="text-gray-400 text-center max-w-sm">
          Cette annonce n&apos;existe plus ou a été supprimée.
        </p>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </button>
      </div>
    )
  }

  const images = Array.isArray(ad.images) ? ad.images : []
  const seller = ad.profiles
  const sellerName = seller ? `${seller.prenom} ${seller.nom}` : 'Vendeur'
  const initials = seller ? `${seller.prenom?.[0] ?? ''}${seller.nom?.[0] ?? ''}`.toUpperCase() : '?'
  const whatsappUrl = `https://wa.me/225${(ad.whatsapp || ad.tel || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${ad.title}" sur AbidjanDeals.`)}`

  return (
    <div className="min-h-screen bg-[#0F1117]">

      {/* Header breadcrumb */}
      <div className="border-b border-white/5 bg-[#0F1117]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={15} />
            <span>Retour</span>
          </button>
          <span className="text-gray-700">/</span>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link>
          {ad.category_id && (
            <>
              <span className="text-gray-700">/</span>
              <Link href={`/search?category=${ad.category_id}`} className="text-gray-400 hover:text-white transition-colors truncate max-w-[120px]">
                {ad.category_id.replace('cat_', '')}
              </Link>
            </>
          )}
          <span className="text-gray-700">/</span>
          <span className="text-white truncate max-w-[160px]">{ad.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Gallery */}
            <div className="bg-[#161B27] rounded-2xl p-3 border border-white/5">
              <Gallery images={images} videoUrl={ad.video_url} title={ad.title} />
            </div>

            {/* Title + Price */}
            <div className="bg-[#161B27] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {ad.etat && (
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${
                      ad.etat === 'Neuf'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-gray-500/15 text-gray-300 border border-gray-500/20'
                    }`}>
                      {ad.etat}
                    </span>
                  )}
                  <h1 className="text-xl font-bold text-white leading-snug">{ad.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {ad.views} vues
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {formatRelativeDate(ad.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {ad.quartier ? `${ad.quartier}, ` : ''}{ad.city}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setIsFav(f => !f)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                      isFav
                        ? 'bg-red-500/15 border-red-500/30 text-red-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-all relative"
                  >
                    <Share2 size={16} />
                    {copied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                        Copié !
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-3xl font-extrabold text-orange-500">{formatFCFA(ad.price)}</p>
                {ad.marque && (
                  <p className="mt-1 text-sm text-gray-400 flex items-center gap-1.5">
                    <Tag size={12} /> Marque : <span className="text-white font-medium">{ad.marque}</span>
                  </p>
                )}
                {ad.subcategory && (
                  <p className="mt-1 text-sm text-gray-400 flex items-center gap-1.5">
                    <Package size={12} /> {ad.subcategory}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {ad.description && (
              <div className="bg-[#161B27] rounded-2xl p-5 border border-white/5">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h2>
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">{ad.description}</p>
              </div>
            )}

            {/* Safety tips */}
            <div className="bg-amber-500/8 border border-amber-500/15 rounded-2xl p-4">
              <p className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <ShieldCheck size={15} /> Conseils de sécurité
              </p>
              <ul className="text-amber-300/70 text-xs space-y-1 list-disc list-inside">
                <li>Rencontrez le vendeur en lieu public</li>
                <li>Ne payez jamais à distance avant de voir le produit</li>
                <li>Vérifiez le produit avant tout paiement</li>
              </ul>
            </div>
          </div>

          {/* ── RIGHT COLUMN ───────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* CTA Buttons */}
            <div className="bg-[#161B27] rounded-2xl p-5 border border-white/5 space-y-3">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contacter le vendeur</h2>

              {/* WhatsApp */}
              {(ad.whatsapp || ad.tel) && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-900/20"
                >
                  <MessageCircle size={18} />
                  Contacter sur WhatsApp
                </a>
              )}

              {/* Phone */}
              {ad.tel && (
                <button
                  onClick={() => setShowTel(t => !t)}
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-white/8 border border-white/10 text-white font-semibold text-sm hover:bg-white/12 transition-all"
                >
                  <Phone size={16} />
                  {showTel ? ad.tel : 'Afficher le numéro'}
                </button>
              )}
            </div>

            {/* Seller card */}
            <div className="bg-[#161B27] rounded-2xl p-5 border border-white/5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Vendeur</h2>
              <div className="flex items-center gap-3">
                {seller?.avatar_url ? (
                  <img src={seller.avatar_url} alt={sellerName} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-white text-sm truncate">{sellerName}</p>
                    {seller?.verified_seller && <BadgeCheck size={14} className="text-blue-400 flex-shrink-0" />}
                    {seller?.trust_badge && <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />}
                  </div>
                  {seller?.is_pro && (
                    <span className="text-xs bg-violet-500/15 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-semibold">
                      PRO
                    </span>
                  )}
                  {seller?.note !== undefined && seller.note > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-400">{seller.note.toFixed(1)}</span>
                      {seller.nb_annonces !== undefined && (
                        <span className="text-xs text-gray-600">· {seller.nb_annonces} annonces</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {seller?.bio && (
                <p className="text-xs text-gray-400 mt-3 leading-relaxed line-clamp-3">{seller.bio}</p>
              )}

              <Link
                href={`/vendeur?id=${ad.user_id}`}
                className="block mt-4 text-center text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                Voir toutes ses annonces →
              </Link>
            </div>

            {/* Location */}
            <div className="bg-[#161B27] rounded-2xl p-5 border border-white/5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Localisation</h2>
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium text-sm">{ad.city}</p>
                  {ad.quartier && <p className="text-gray-400 text-xs mt-0.5">{ad.quartier}</p>}
                </div>
              </div>
            </div>

            {/* Ad ID */}
            <p className="text-center text-xs text-gray-700">
              Réf : {ad.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
