'use client'

import { motion, useDragControls } from 'framer-motion'
import { ArrowLeft, Share2, Volume2, VolumeX } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface HybridGalleryProps {
  images: string[]
  videoUrl?: string | null
  alt?: string
}

export function HybridGallery({ images, videoUrl, alt = 'Photo' }: HybridGalleryProps) {
  const hasVideo = !!videoUrl
  const hasImages = images && images.length > 0
  const total = hasImages ? images.length : 0

  const [activeIdx, setActiveIdx] = useState(0)
  const [muted, setMuted] = useState(true)
  const [pipHidden, setPipHidden] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const ribbonRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const dragControls = useDragControls()

  // Cache le hint après 3 secondes
  useEffect(() => {
    if (!hasVideo || pipHidden) return
    const t = setTimeout(() => setShowHint(false), 3000)
    return () => clearTimeout(t)
  }, [hasVideo, pipHidden])

  // Réaffiche le hint quand on réouvre la vidéo
  useEffect(() => {
    if (!pipHidden) setShowHint(true)
  }, [pipHidden])

  const selectMedia = useCallback((idx: number) => {
    if (idx < 0 || idx >= total) return
    setActiveIdx(idx)
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
    // Swipe horizontal uniquement (pas vertical)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      selectMedia(activeIdx + (dx < 0 ? 1 : -1))
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
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-2xl text-gray-300 text-5xl">
        📷
      </div>
    )
  }

  const counter = total > 0 ? `${activeIdx + 1}/${total}` : '1/1'

  // Calcul des contraintes PiP strictement dans le cadre
  // PiP : 90px large, ratio 9/16 → hauteur ≈ 160px
  const PIP_W = 90
  const PIP_H = Math.round(PIP_W * 16 / 9)

  const getDragConstraints = () => {
    if (!stageRef.current) return { top: 0, left: 0, right: 0, bottom: 0 }
    const { width, height } = stageRef.current.getBoundingClientRect()
    return {
      top: 0,
      left: 0,
      right: width - PIP_W,
      bottom: height - PIP_H,
    }
  }

  return (
    <div className="w-full select-none bg-black rounded-2xl overflow-hidden">

      {/* ── ZONE PRINCIPALE ── */}
      <div
        ref={stageRef}
        className="relative w-full aspect-square overflow-hidden bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >

        {/* Images en fond — slide horizontal */}
        {hasImages && (
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translateX(-${activeIdx * 100}%)`,
              width: `${total * 100}%`,
              zIndex: 1,
            }}
          >
            {images.map((src, i) => (
              <div key={i} className="relative h-full" style={{ width: `${100 / total}%` }}>
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

        {/* ── Vidéo PiP draggable ── */}
        {hasVideo && !pipHidden && (
          <motion.div
            drag
            dragControls={dragControls}
            dragConstraints={getDragConstraints()}
            dragMomentum={false}
            dragElastic={0}
            initial={{ x: 12, y: 12 }}
            style={{ position: 'absolute', zIndex: 20, cursor: 'grab' }}
            whileDrag={{ cursor: 'grabbing', scale: 1.04 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
          >
            {/* Hint déplaçable */}
            {showHint && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: -24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  fontSize: 9,
                  padding: '3px 8px',
                  borderRadius: 20,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 30,
                }}
              >
                ✥ Déplaçable
              </motion.div>
            )}

            <div
              className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-white/70"
              style={{ width: PIP_W, aspectRatio: '9/16' }}
            >
              <video
                ref={videoRef}
                src={videoUrl!}
                autoPlay
                loop
                playsInline
                muted={muted}
                preload="metadata"
                className="w-full h-full object-cover"
              />

              {/* Bouton son */}
              <button
                onClick={e => { e.stopPropagation(); setMuted(m => !m) }}
                className="absolute bottom-1 left-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white"
                aria-label={muted ? 'Activer le son' : 'Couper le son'}
              >
                {muted ? <VolumeX size={11} /> : <Volume2 size={11} />}
              </button>

              {/* Bouton fermer */}
              <button
                onClick={e => { e.stopPropagation(); setPipHidden(true) }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center"
                aria-label="Masquer la vidéo"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Bouton réafficher vidéo */}
        {hasVideo && pipHidden && (
          <button
            onClick={() => setPipHidden(false)}
            className="absolute bottom-14 left-3 z-20 flex items-center gap-1.5 bg-black/60 text-white text-[11px] px-3 py-1.5 rounded-full border border-white/20 hover:bg-black/80 transition-colors"
          >
            ▶ Vidéo
          </button>
        )}

        {/* Top bar — Retour & Partage */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 pt-3">
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white"
            aria-label="Retour"
          >
            <ArrowLeft size={17} strokeWidth={2.2} />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white"
            aria-label="Partager"
          >
            <Share2 size={15} strokeWidth={2.2} />
          </button>
        </div>

        {/* Compteur */}
        {total > 0 && (
          <div className="absolute bottom-3 right-3 z-10 bg-black/50 backdrop-blur-sm border border-white/15 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full tabular-nums">
            {counter}
          </div>
        )}

        {/* Flèches desktop */}
        {total > 1 && (
          <>
            <button
              onClick={() => selectMedia(activeIdx - 1)}
              disabled={activeIdx === 0}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 items-center justify-center text-gray-700 shadow text-lg disabled:opacity-30"
              aria-label="Image précédente"
            >
              ‹
            </button>
            <button
              onClick={() => selectMedia(activeIdx + 1)}
              disabled={activeIdx === total - 1}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 items-center justify-center text-gray-700 shadow text-lg disabled:opacity-30"
              aria-label="Image suivante"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* ── RIBBON vignettes ── */}
      {total > 1 && (
        <div className="bg-black px-3 pb-3 pt-2.5">
          <div
            ref={ribbonRef}
            className="flex gap-2 overflow-x-auto flex-nowrap"
            style={{ scrollbarWidth: 'none' } as React.CSSProperties}
          >
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={() => selectMedia(idx)}
                className="relative flex-none rounded-lg overflow-hidden transition-all duration-200"
                style={{
                  width: 64,
                  height: 64,
                  border: activeIdx === idx ? '2px solid #FF6000' : '2px solid transparent',
                  opacity: activeIdx === idx ? 1 : 0.55,
                }}
                aria-label={`Image ${idx + 1}`}
                aria-current={activeIdx === idx}
              >
                <Image
                  src={src}
                  alt={`Vignette ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}