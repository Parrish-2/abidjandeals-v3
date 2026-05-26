'use client'

import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { ArrowLeft, Minimize2, Share2, Volume2, VolumeX } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface HybridGalleryProps {
  images: string[]
  videoUrl?: string | null
  alt?: string
}

const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.mkv', '.avi']
const isVideoUrl = (u: string) => VIDEO_EXTS.some(ext => u.toLowerCase().endsWith(ext))

export function HybridGallery({ images, videoUrl, alt = 'Photo' }: HybridGalleryProps) {
  const cleanImages = (images ?? []).filter(u => !isVideoUrl(u))
  const finalVideoUrl = videoUrl ?? (images ?? []).find(u => isVideoUrl(u)) ?? null

  const hasVideo = !!finalVideoUrl
  const hasImages = cleanImages.length > 0
  const total = cleanImages.length

  const [activeIdx, setActiveIdx] = useState(0)
  const [muted, setMuted] = useState(true)
  const [pipHidden, setPipHidden] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreenVideo, setIsFullscreenVideo] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null)
  const ribbonRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const dragControls = useDragControls()

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
    if (fullscreenVideoRef.current) fullscreenVideoRef.current.muted = muted
  }, [muted, isFullscreenVideo])

  useEffect(() => {
    if (!hasVideo || pipHidden) return
    const t = setTimeout(() => setShowHint(false), 3000)
    return () => clearTimeout(t)
  }, [hasVideo, pipHidden])

  // ⚡ Fonction de navigation en boucle continue
  const goTo = useCallback((direction: 'prev' | 'next') => {
    if (total <= 1) return
    setActiveIdx(prev => {
      if (direction === 'next') return (prev + 1) % total
      return (prev - 1 + total) % total
    })
  }, [total])

  const selectMedia = useCallback((idx: number) => {
    if (idx < 0 || idx >= total) return
    setActiveIdx(idx)
    // Scroll de la ribbon (inchangé)
    const ribbon = ribbonRef.current
    if (ribbon) {
      const thumb = ribbon.children[idx] as HTMLElement
      if (thumb) {
        ribbon.scrollTo({
          left: thumb.offsetLeft - ribbon.clientWidth / 2 + 32,
          behavior: 'smooth',
        })
      }
    }
  }, [total])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDragging) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      goTo(dx < 0 ? 'next' : 'prev') // inverse car swipe gauche = suivant
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ url: window.location.href }).catch(() => { })
    } else {
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  if (!hasImages && !hasVideo) {
    return (
      <div className="w-full aspect-square bg-gray-900 flex items-center justify-center rounded-2xl text-gray-500 text-5xl">
        📷
      </div>
    )
  }

  const PIP_W = 96
  const PIP_H = Math.round(PIP_W * 16 / 9)

  const getDragConstraints = () => {
    if (!stageRef.current) return { top: 8, left: 8, right: 0, bottom: 0 }
    const { width, height } = stageRef.current.getBoundingClientRect()
    return {
      top: 8,
      left: 8,
      right: width - PIP_W - 8,
      bottom: height - PIP_H - 8,
    }
  }

  return (
    <div className="w-full select-none bg-black rounded-2xl overflow-hidden relative">

      {/* ── CARROUSEL IMAGES ── */}
      <div
        ref={stageRef}
        className="relative w-full aspect-square overflow-hidden bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasImages && (
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translateX(-${activeIdx * (100 / total)}%)`,
              width: `${total * 100}%`,
              zIndex: 1,
            }}
          >
            {cleanImages.map((src, i) => (
              <div
                key={i}
                className="relative h-full flex-shrink-0"
                style={{ width: `${100 / total}%` }}
              >
                <Image
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── PiP Vidéo draggable (inchangé) ── */}
        {hasVideo && !pipHidden && !isFullscreenVideo && (
          <motion.div
            drag
            dragControls={dragControls}
            dragConstraints={getDragConstraints()}
            dragMomentum={false}
            dragElastic={0.1}
            initial={{ x: 16, y: 16 }}
            style={{ position: 'absolute', zIndex: 20, cursor: 'grab' }}
            whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
            onTouchStart={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap z-30 border border-white/10"
                >
                  ✥ Glisser
                </motion.div>
              )}
            </AnimatePresence>

            <div
              onClick={() => { if (!isDragging) setIsFullscreenVideo(true) }}
              className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-white/80 bg-black active:scale-95 transition-transform duration-150"
              style={{ width: PIP_W, aspectRatio: '9/16' }}
            >
              <video
                ref={videoRef}
                src={finalVideoUrl!}
                autoPlay
                loop
                playsInline
                muted={muted}
                preload="metadata"
                className="w-full h-full object-cover pointer-events-none"
              />
              <button
                onClick={e => { e.stopPropagation(); setMuted(m => !m) }}
                className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white border border-white/10"
                aria-label={muted ? 'Activer le son' : 'Couper le son'}
              >
                {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); setPipHidden(true) }}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center border border-white/10"
                aria-label="Masquer la vidéo"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {hasVideo && pipHidden && (
          <button
            onClick={() => setPipHidden(false)}
            className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-black/75 text-white text-xs font-medium px-3 py-2 rounded-full border border-white/20"
          >
            ▶ Voir la vidéo
          </button>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-4 bg-gradient-to-b from-black/40 to-transparent">
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white"
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white"
            aria-label="Partager"
          >
            <Share2 size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Flèches desktop – en boucle continue */}
        {total > 1 && (
          <>
            <button
              onClick={() => goTo('prev')}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 items-center justify-center text-gray-800 shadow-md font-bold"
            >
              ‹
            </button>
            <button
              onClick={() => goTo('next')}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 items-center justify-center text-gray-800 shadow-md font-bold"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* ── RUBAN VIGNETTES (inchangé) ── */}
      {total > 1 && (
        <div className="bg-black px-4 pb-4 pt-3 border-t border-white/5">
          <div
            ref={ribbonRef}
            className="flex gap-2.5 overflow-x-auto flex-nowrap"
            style={{ scrollbarWidth: 'none' } as React.CSSProperties}
          >
            {cleanImages.map((src, idx) => (
              <button
                key={idx}
                onClick={() => selectMedia(idx)}
                className="relative flex-none rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  width: 60,
                  height: 60,
                  border: activeIdx === idx ? '2px solid #FF6000' : '2px solid transparent',
                  opacity: activeIdx === idx ? 1 : 0.5,
                }}
                aria-current={activeIdx === idx}
              >
                <Image
                  src={src}
                  alt={`Vignette ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="60px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── FULLSCREEN VIDÉO (inchangé) ── */}
      <AnimatePresence>
        {isFullscreenVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 bg-black flex flex-col justify-between"
          >
            <div className="flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
              <button
                onClick={() => setIsFullscreenVideo(false)}
                className="flex items-center gap-2 text-white text-sm font-medium bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
              >
                <Minimize2 size={16} /> Retour aux photos
              </button>
              <button
                onClick={() => setMuted(m => !m)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-2">
              <video
                ref={fullscreenVideoRef}
                src={finalVideoUrl!}
                autoPlay
                loop
                playsInline
                muted={muted}
                className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
              />
            </div>
            <div className="p-4 text-center text-xs text-white/40 bg-gradient-to-t from-black/60 to-transparent">
              Présentation vidéo du produit
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}