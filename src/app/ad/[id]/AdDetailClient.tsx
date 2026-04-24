'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdCard } from '@/components/AdCard'
import { useI18n } from '@/contexts/i18nContext'
import BoostCTA from '@/components/boost/BoostCTA'
import {
  MapPin, Tag, Eye, Heart, Share2,
  MessageCircle, Phone, Zap, CheckCircle,
  Shield, Clock, ImageOff, AlertTriangle,
  X, Volume2, VolumeX, Maximize2,
} from 'lucide-react'

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

interface Ad {
  id: string
  title: string
  description: string
  price: number
  city: string
  quartier?: string
  category_id: string
  subcategory?: string
  etat?: string
  marque?: string
  images: string[]
  video_url?: string
  tel?: string
  whatsapp?: string
  views: number
  boost_level?: 'STANDARD' | 'PREMIUM' | 'URGENT' | null
  created_at: string
  user_id: string
  status: string
  nombre_pieces?: string
  superficie?: number
  caution?: number
  avance?: string
  type_document?: string
  profiles?: {
    id: string
    prenom: string
    nom: string
    avatar_url?: string
    tel?: string
    note?: number
    verified_seller?: boolean
    trust_badge?: boolean
    nb_annonces?: number
    logo_url?: string
    boutique_name?: string
    boutique_slug?: string
    boutique_active?: boolean
  }
}

type MediaItem = { type: 'image'; src: string } | { type: 'video'; src: string }

const CAT_LABELS: Record<string, string> = {
  'immobilier': 'Immobilier',
  'vehicules-equipements': 'Vehicules & Equip.',
  'hightech-informatique': 'High-Tech & Info',
  'mode': 'Mode & Beaute',
  'maison': 'Maison & Deco',
  'services': 'Services & Emploi',
  'sport-loisirs': 'Sport & Loisirs',
  'autres': 'Autres & Divers',
  'cat_auto': 'Automobile',
  'cat_tech': 'High-Tech',
}

function MediaImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300">
        <ImageOff size={40} strokeWidth={1.2} />
        <p className="text-sm font-medium">Photo indisponible</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <ImageOff size={32} className="text-gray-300" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

function MediaVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  return (
    <>
      <div className="relative w-full h-full bg-black">
        <video ref={videoRef} src={src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        <div className="absolute bottom-3 right-3 flex gap-2 z-20">
          <button onClick={() => setMuted(m => !m)} className="bg-black/60 text-white rounded-full px-3 py-1.5 text-xs font-medium hover:bg-black/80 transition flex items-center gap-1.5">
            {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            {muted ? 'Son' : 'Muet'}
          </button>
          <button onClick={() => setExpanded(true)} className="bg-black/60 text-white rounded-full px-3 py-1.5 text-xs font-medium hover:bg-black/80 transition flex items-center gap-1.5">
            <Maximize2 size={12} /> Plein ecran
          </button>
        </div>
        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-medium z-20">Video</div>
      </div>
      {expanded && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center" onClick={() => setExpanded(false)}>
          <video src={src} autoPlay loop controls className="max-w-full max-h-full" onClick={e => e.stopPropagation()} />
          <button onClick={() => setExpanded(false)} className="absolute top-4 right-4 text-white text-3xl hover:text-orange-400 transition">X</button>
        </div>
      )}
    </>
  )
}

function VideoMiniPlayer({ videoUrl, containerRef }: { videoUrl: string; containerRef: React.RefObject<HTMLDivElement> }) {
  const [visible, setVisible] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [muted, setMuted] = useState(true)
  const [pos, setPos] = useState({ x: 12, y: 12 })
  const [dragging, setDragging] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const hasMoved = useRef(false)

  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted }, [muted])

  const onMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !playerRef.current || !containerRef.current) return
    hasMoved.current = true
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const bounds = containerRef.current.getBoundingClientRect()
    const maxX = containerRef.current.offsetWidth - playerRef.current.offsetWidth
    const maxY = containerRef.current.offsetHeight - playerRef.current.offsetHeight
    setPos({
      x: Math.max(0, Math.min(clientX - bounds.left - dragOffset.current.x, maxX)),
      y: Math.max(0, Math.min(clientY - bounds.top - dragOffset.current.y, maxY)),
    })
  }, [containerRef])

  const onUp = useCallback(() => {
    isDragging.current = false; setDragging(false)
    window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp)
  }, [onMove])

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (expanded || (e.target as HTMLElement).closest('button')) return
    isDragging.current = true; hasMoved.current = false; setDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const rect = playerRef.current!.getBoundingClientRect()
    dragOffset.current = { x: clientX - rect.left, y: clientY - rect.top }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onUp)
  }, [expanded, onMove, onUp])

  useEffect(() => () => {
    window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp)
  }, [onMove, onUp])

  const handleVideoClick = () => { if (hasMoved.current) return; setExpanded(true); setMuted(false) }
  const handleCollapse = (e: React.MouseEvent) => { e.stopPropagation(); setExpanded(false); setMuted(true) }

  if (!visible) return null

  if (expanded) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm" onClick={handleCollapse} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 pointer-events-auto bg-black">
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">Video</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); setMuted(m => !m) }} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white">
                  {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <button onClick={handleCollapse} className="p-1.5 rounded-full bg-white/10 hover:bg-red-500/80 transition text-white"><X size={14} /></button>
              </div>
            </div>
            <video ref={videoRef} src={videoUrl} autoPlay loop playsInline muted={muted} className="w-full aspect-video object-cover" />
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      ref={playerRef}
      onMouseDown={onDown} onTouchStart={onDown}
      style={{ position: 'absolute', left: pos.x, top: pos.y, zIndex: 30, width: 160, cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
      className="group"
    >
      <div className="relative rounded-xl overflow-hidden border border-white/20" style={{ background: '#0a0a0a', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <button onClick={e => { e.stopPropagation(); setVisible(false) }} className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center transition opacity-0 group-hover:opacity-100"><X size={10} className="text-white" /></button>
        <button onClick={handleVideoClick} className="absolute bottom-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-black/60 hover:bg-orange-500 flex items-center justify-center transition opacity-0 group-hover:opacity-100"><Maximize2 size={9} className="text-white" /></button>
        <div className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-1 bg-black/50 rounded-full px-1.5 py-0.5"><VolumeX size={9} className="text-white/60" /></div>
        <div onClick={handleVideoClick} className="cursor-pointer">
          <video ref={videoRef} src={videoUrl} autoPlay loop muted playsInline className="w-full aspect-video object-cover block" style={{ pointerEvents: 'none' }} />
        </div>
      </div>
      <div className="absolute -bottom-2 left-2 right-2 h-3 rounded-full blur-md opacity-30 bg-orange-500 -z-10" />
    </div>
  )
}

function MediaCarousel({ images, videoUrl, title }: { images: string[]; videoUrl?: string; title: string }) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const galleryRef = useRef<HTMLDivElement>(null)

  const media: MediaItem[] = [
    ...images.map(src => ({ type: 'image' as const, src })),
    ...(videoUrl ? [{ type: 'video' as const, src: videoUrl }] : []),
  ]

  const prev = useCallback(() => setCurrent(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setCurrent(i => Math.min(media.length - 1, i + 1)), [media.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  if (media.length === 0) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="w-full aspect-[4/3] bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300">
          <ImageOff size={40} strokeWidth={1.2} />
          <p className="text-sm font-medium">Pas de photo</p>
        </div>
      </div>
    )
  }

  const currentItem = media[current]
  const showMiniPlayer = currentItem.type === 'image' && !!videoUrl

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div
        ref={galleryRef}
        className="relative aspect-[4/3] bg-gray-900 overflow-hidden group"
        onTouchStart={e => { touchStartX.current = e.targetTouches[0].clientX }}
        onTouchMove={e => { touchEndX.current = e.targetTouches[0].clientX }}
        onTouchEnd={() => { const diff = touchStartX.current - touchEndX.current; if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev() } }}
      >
        {currentItem.type === 'image' ? <MediaImage src={currentItem.src} alt={`${title} ${current + 1}`} /> : <MediaVideo src={currentItem.src} />}
        {showMiniPlayer && <VideoMiniPlayer videoUrl={videoUrl!} containerRef={galleryRef as React.RefObject<HTMLDivElement>} />}
        {media.length > 1 && (
          <>
            <button onClick={prev} disabled={current === 0} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 z-20">prev</button>
            <button onClick={next} disabled={current === media.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 z-20">next</button>
          </>
        )}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm z-20">{current + 1} / {media.length}</div>
      </div>
      {media.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2">
          {media.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all ${i === current ? 'w-5 h-2 bg-orange-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
          ))}
        </div>
      )}
      {media.length > 1 && (
        <div className="flex gap-2 px-3 pb-3 overflow-x-auto">
          {media.map((m, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-orange-500 opacity-100' : 'border-transparent opacity-55 hover:opacity-80'}`}>
              {m.type === 'image' ? <img src={m.src} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-lg">Video</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdDetailClient({ ad }: { ad: Ad }) {
  const { user, setAuthModalOpen } = useStore()
  useI18n()

  const [related,     setRelated]     = useState<any[]>([])
  const [isFavorite,  setIsFavorite]  = useState(false)
  const [favLoading,  setFavLoading]  = useState(false)
  const [telRevealed, setTelRevealed] = useState(false)

  const seller    = ad.profiles
  const isBoosted = !!ad.boost_level
  const waNum     = (ad.whatsapp || ad.tel || seller?.tel || '').replace(/\D/g, '')
  const waMsg     = encodeURIComponent(`Bonjour, je suis interesse(e) par votre annonce "${ad.title}" a ${ad.price.toLocaleString('fr-CI')} FCFA sur AbidjanDeals.`)
  const waUrl     = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : null
  const dateLabel = new Date(ad.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const isOwner   = user?.id === ad.user_id

  useEffect(() => {
    async function load() {
      if (user) {
        const { data: fav } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('ad_id', ad.id)
          .maybeSingle()
        setIsFavorite(!!fav)
      }

      const { data: rel } = await supabase
        .from('ads')
        .select('id, title, price, images, city, category_id, views, boost_level, etat, seller:profiles(prenom, nom)')
        .eq('status', 'active')
        .eq('category_id', ad.category_id)
        .neq('id', ad.id)
        .order('created_at', { ascending: false })
        .limit(4)

      setRelated((rel || []).map((r: any) => ({
        ...r,
        seller: r.seller?.[0] ? `${r.seller[0].prenom} ${r.seller[0].nom}` : 'Vendeur',
        img: r.images?.[0] ?? null,
        emoji: '📦',
      })))

      supabase.from('ads').update({ views: (ad.views || 0) + 1 }).eq('id', ad.id)
    }
    load()
  }, [ad.id, ad.category_id, ad.views, user])

  const toggleFavorite = useCallback(async () => {
    if (!user) { setAuthModalOpen(true); return }
    if (favLoading) return
    setFavLoading(true)
    const next = !isFavorite
    setIsFavorite(next)
    try {
      if (next) {
        const { error } = await supabase.from('favorites').insert({ user_id: user.id, ad_id: ad.id })
        if (error) { setIsFavorite(!next); toast.error('Erreur: ' + error.message) }
        else toast.success('Ajouté aux favoris')
      } else {
        const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('ad_id', ad.id)
        if (error) { setIsFavorite(!next); toast.error('Erreur: ' + error.message) }
        else toast.success('Retiré des favoris')
      }
    } catch {
      setIsFavorite(!next)
      toast.error('Erreur inattendue')
    }
    setFavLoading(false)
  }, [user, ad.id, isFavorite, favLoading, setAuthModalOpen])

  const handleShare = useCallback(async () => {
    try { await navigator.share({ title: ad.title, url: window.location.href }) }
    catch { await navigator.clipboard.writeText(window.location.href); toast.success('Lien copié !') }
  }, [ad.title])

  const specs = [
    ad.etat          && { label: 'État',       value: ad.etat },
    ad.marque        && { label: 'Marque',     value: ad.marque },
    ad.nombre_pieces && { label: 'Pièces',     value: ad.nombre_pieces },
    ad.superficie    && { label: 'Superficie', value: `${ad.superficie} m²` },
    ad.type_document && { label: 'Document',   value: ad.type_document },
    ad.caution       && { label: 'Caution',    value: `${Number(ad.caution).toLocaleString('fr-CI')} FCFA` },
    ad.avance        && { label: 'Avance',     value: `${ad.avance} mois` },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" />
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">

          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5 flex-wrap">
            <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
            <span>/</span>
            <Link href={`/search?category=${ad.category_id}`} className="hover:text-orange-500 transition-colors">
              {CAT_LABELS[ad.category_id] || ad.category_id}
            </Link>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-[220px]">{ad.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8">

            <div className="space-y-4">
              <MediaCarousel images={ad.images || []} videoUrl={ad.video_url} title={ad.title} />

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    isFavorite
                      ? 'bg-orange-50 border-orange-200 text-orange-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600'
                  }`}
                >
                  <Heart size={13} className={isFavorite ? 'fill-orange-500 text-orange-500' : ''} />
                  {isFavorite ? 'Sauvegardé' : 'Sauvegarder'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <Share2 size={13} /> Partager
                </button>
                <Link
                  href={`/search?category=${ad.category_id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all ml-auto"
                >
                  Annonces similaires
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 text-[15px] mb-3">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {ad.description || 'Aucune description fournie.'}
                </p>
                {specs.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                    {specs.map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{s.label}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
                  <p className="text-sm font-semibold text-blue-800 flex-1">C&apos;est votre annonce</p>
                  <Link
                    href={`/ad/${ad.id}/edit`}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Modifier
                  </Link>
                </div>
              )}

              {related.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900 text-[15px]">Annonces similaires</h2>
                    <Link href={`/search?category=${ad.category_id}`} className="text-sm text-orange-500 hover:text-orange-600 font-medium">Voir tout</Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {related.map(r => <AdCard key={r.id} ad={r} />)}
                  </div>
                </div>
              )}
            </div>

            {/* ── Colonne vendeur ── */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                    <Tag size={9} /> {CAT_LABELS[ad.category_id] || ad.category_id}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    <MapPin size={9} /> {ad.quartier ? `${ad.quartier}, ${ad.city}` : ad.city}
                  </span>
                  {isBoosted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                      <Zap size={9} /> Boosté
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[34px] font-extrabold text-orange-500 leading-none tracking-tight">
                    {ad.price.toLocaleString('fr-CI')}
                  </span>
                  <span className="text-base font-semibold text-gray-400">FCFA</span>
                </div>
                <h1 className="text-[17px] font-bold text-gray-900 leading-snug mb-4">{ad.title}</h1>

                <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gray-100 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400"><Eye size={12} /> {(ad.views || 0) + 1} vues</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400"><Clock size={12} /> {dateLabel}</div>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full flex-shrink-0 overflow-hidden">
                    {seller?.logo_url || seller?.avatar_url ? (
                      <img src={seller.logo_url || seller.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base">
                        {seller?.prenom?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{seller ? `${seller.prenom} ${seller.nom}` : 'Vendeur'}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {seller?.verified_seller && <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><CheckCircle size={10} /> Vendeur vérifié</span>}
                      {seller?.trust_badge && <span className="text-[11px] font-semibold text-amber-600">Badge confiance</span>}
                      {seller?.note && <span className="text-[11px] text-amber-500">{seller.note.toFixed(1)}</span>}
                    </div>
                  </div>
                  {seller?.boutique_active && seller?.boutique_slug && (
                    <Link href={`/boutique/${seller.boutique_slug}`} className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors flex-shrink-0">
                      Boutique
                    </Link>
                  )}
                </div>

                <div className="space-y-2.5">
                  {waUrl && (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] transition-all hover:scale-[1.01]">
                      <WhatsAppIcon size={18} /> Contacter sur WhatsApp
                    </a>
                  )}
                  {(ad.tel || seller?.tel) && (
                    <button
                      onClick={() => { if (!telRevealed) { setTelRevealed(true); return }; window.location.href = `tel:${ad.tel || seller?.tel}` }}
                      className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[14px] transition-all hover:scale-[1.01]"
                    >
                      <Phone size={17} />
                      {telRevealed ? (ad.tel || seller?.tel) : 'Afficher le numéro'}
                    </button>
                  )}
                  <Link
                    href={user ? `/messages?ad=${ad.id}&seller=${ad.user_id}` : '/?auth=login'}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-semibold text-[13px] hover:bg-gray-50 transition-all"
                  >
                    <MessageCircle size={15} /> Envoyer un message
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-gray-500" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Conseils de sécurité</span>
                </div>
                {[
                  "Ne payez jamais à l'avance sans voir l'article",
                  'Privilégiez les rencontres en lieu public',
                  "Vérifiez l'article avant tout paiement",
                  'Méfiez-vous des prix anormalement bas',
                ].map(tip => (
                  <div key={tip} className="flex items-start gap-2.5 mb-2 last:mb-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                    <p className="text-[12.5px] text-gray-500 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => toast('Signalement envoyé', { icon: '🚩' })} className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors mx-auto">
                <AlertTriangle size={12} /> Signaler cette annonce
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {isOwner && (
        <BoostCTA
          adId={ad.id}
          adTitle={ad.title}
          isBoosted={isBoosted}
          boostExpiresAt={null}
          userId={user?.id}
          adUserId={ad.user_id}
        />
      )}
    </div>
  )
}