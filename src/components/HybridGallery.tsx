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
const isVid = (u: string) => VIDEO_EXTS.some(e => u.toLowerCase().endsWith(e))

export function HybridGallery({ images, videoUrl, alt = 'Photo' }: HybridGalleryProps) {
  const raw = images ?? []

  // SÃ©paration stricte images / vidÃ©o
  const cleanImages  = raw.filter(u => !isVid(u))
  const extractedVid = raw.find(u => isVid(u)) ?? null
  const finalVideo   = videoUrl ?? extractedVid

  const total    = cleanImages.length
  const hasVideo = !!finalVideo

  const [idx,              setIdx]              = useState(0)
  const [muted,            setMuted]            = useState(true)
  const [pipHidden,        setPipHidden]        = useState(false)
  const [showHint,         setShowHint]         = useState(true)
  const [dragging,         setDragging]         = useState(false)
  const [fullscreen,       setFullscreen]       = useState(false)

  const stageRef          = useRef<HTMLDivElement>(null)
  const ribbonRef         = useRef<HTMLDivElement>(null)
  const videoRef          = useRef<HTMLVideoElement>(null)
  const fsVideoRef        = useRef<HTMLVideoElement>(null)
  const touchX            = useRef(0)
  const touchY            = useRef(0)
  const dragControls      = useDragControls()

  useEffect(() => {
    if (!hasVideo || pipHidden) return
    const t = setTimeout(() => setShowHint(false), 3000)
    return () => clearTimeout(t)
  }, [hasVideo, pipHidden])

  useEffect(() => {
    if (videoRef.current)   videoRef.current.muted   = muted
    if (fsVideoRef.current) fsVideoRef.current.muted = muted
  }, [muted, fullscreen])

  const goTo = useCallback((i: number) => {
    if (i < 0 || i >= total) return
    setIdx(i)
    const ribbon = ribbonRef.current
    if (ribbon) {
      const thumb = ribbon.children[i] as HTMLElement
      if (thumb) ribbon.scrollTo({ left: thumb.offsetLeft - ribbon.clientWidth / 2 + 30, behavior: 'smooth' })
    }
  }, [total])

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX
    touchY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragging) return
    const dx = e.changedTouches[0].clientX - touchX.current
    const dy = e.changedTouches[0].clientY - touchY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) goTo(idx + (dx < 0 ? 1 : -1))
  }

  const share = () => {
    if (navigator.share) navigator.share({ url: window.location.href }).catch(() => {})
    else navigator.clipboard?.writeText(window.location.href)
  }

  if (!total && !hasVideo) {
    return (
      <div className="w-full aspect-square bg-gray-900 flex items-center justify-center rounded-2xl text-gray-500 text-5xl">ðŸ“·</div>
    )
  }

  const PIP_W = 96
  const PIP_H = Math.round(PIP_W * 16 / 9)
  const getConstraints = () => {
    if (!stageRef.current) return { top: 8, left: 8, right: 0, bottom: 0 }
    const { width, height } = stageRef.current.getBoundingClientRect()
    return { top: 8, left: 8, right: width - PIP_W - 8, bottom: height - PIP_H - 8 }
  }

  return (
    <div className="w-full select-none bg-black rounded-2xl overflow-hidden relative">

      {/* â”€â”€ CARROUSEL â”€â”€ */}
      <div
        ref={stageRef}
        className="relative w-full aspect-square overflow-hidden bg-black"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Track â€” uniquement cleanImages */}
        {total > 0 && (
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-${idx * 100}%)`, width: `${total * 100}%`, zIndex: 1 }}
          >
            {cleanImages.map((src, i) => (
              <div key={i} className="relative h-full" style={{ width: `${100 / total}%` }}>
                <img src={src} alt={`${alt} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
        )}

        {/* â”€â”€ PiP VidÃ©o â”€â”€ */}
        {hasVideo && !pipHidden && !fullscreen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragConstraints={getConstraints()}
            dragMomentum={false}
            dragElastic={0}
            initial={{ x: 16, y: 16 }}
            style={{ position: 'absolute', zIndex: 20, cursor: 'grab' }}
            whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setTimeout(() => setDragging(false), 50)}
            onTouchStart={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap z-30 border border-white/10"
                >
                  âœ¥ Glisser
                </motion.div>
              )}
            </AnimatePresence>

            <div
              onClick={() => { if (!dragging) setFullscreen(true) }}
              className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-white/80 bg-black"
              style={{ width: PIP_W, aspectRatio: '9/16' }}
            >
              <video
                ref={videoRef}
                src={finalVideo!}
                autoPlay loop playsInline
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
                aria-label="Masquer"
              >âœ•</button>
            </div>
          </motion.div>
        )}

        {/* RÃ©afficher vidÃ©o */}
        {hasVideo && pipHidden && (
          <button
            onClick={() => setPipHidden(false)}
            className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-black/75 text-white text-xs font-medium px-3 py-2 rounded-full border border-white/20"
          >
            â–¶ VidÃ©o
          </button>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-4 bg-gradient-to-b from-black/40 to-transparent">
          <button onClick={() => window.history.back()}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white"
            aria-label="Retour">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <button onClick={share}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white"
            aria-label="Partager">
            <Share2 size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* FlÃ¨ches desktop */}
        {total > 1 && (
          <>
            <button onClick={() => goTo(idx - 1)} disabled={idx === 0}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 items-center justify-center text-gray-800 shadow-md font-bold disabled:opacity-30">
              â€¹
            </button>
            <button onClick={() => goTo(idx + 1)} disabled={idx === total - 1}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 items-center justify-center text-gray-800 shadow-md font-bold disabled:opacity-30">
              â€º
            </button>
          </>
        )}
      </div>

      {/* â”€â”€ RUBAN â”€â”€ */}
      {total > 1 && (
        <div className="bg-black px-4 pb-4 pt-3 border-t border-white/5">
          <div ref={ribbonRef} className="flex gap-2.5 overflow-x-auto flex-nowrap"
            style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
            {cleanImages.map((src, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="relative flex-none rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  width: 60, height: 60,
                  border: idx === i ? '2px solid #FF6000' : '2px solid transparent',
                  opacity: idx === i ? 1 : 0.5,
                }}
                aria-current={idx === i}>
                <img src={src} alt={`Vignette ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ FULLSCREEN â”€â”€ */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 bg-black flex flex-col"
          >
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
              <button onClick={() => setFullscreen(false)}
                className="flex items-center gap-2 text-white text-sm font-medium bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Minimize2 size={16} /> Retour aux photos
              </button>
              <button onClick={() => setMuted(m => !m)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-2">
              <video ref={fsVideoRef} src={finalVideo!} autoPlay loop playsInline muted={muted}
                className="max-w-full max-h-full rounded-xl object-contain shadow-2xl" />
            </div>
            <div className="p-4 text-center text-xs text-white/40 bg-gradient-to-t from-black/60 to-transparent">
              PrÃ©sentation vidÃ©o du produit
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

