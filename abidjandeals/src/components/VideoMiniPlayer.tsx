'use client'

// src/components/VideoMiniPlayer.tsx
// Mini lecteur vidéo flottant et draggable
// Intégré dans MediaSlider — visible UNIQUEMENT sur les slides image

import { Maximize2, Volume2, VolumeX, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface VideoMiniPlayerProps {
  videoUrl: string
  containerRef?: React.RefObject<HTMLElement>
  initialPosition?: { x: number; y: number }
  /** Appelé quand l'utilisateur ferme le mini player */
  onClose?: () => void
}

export default function VideoMiniPlayer({
  videoUrl,
  containerRef,
  initialPosition = { x: 12, y: 12 },
  onClose,
}: VideoMiniPlayerProps) {
  const [visible, setVisible] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [muted, setMuted] = useState(true)
  const [pos, setPos] = useState(initialPosition)
  const [dragging, setDragging] = useState(false)
  const [mounted, setMounted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const hasMoved = useRef(false)

  // Animation d'entrée
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10)
    return () => clearTimeout(t)
  }, [])

  // ── Lancement explicite de la lecture ────────────────────────────────────────
  // Le autoPlay seul ne suffit pas si le navigateur n'a pas encore chargé la vidéo.
  // On force load() + play() dès que le composant monte ou que l'URL change.
  useEffect(() => {
    const v = videoRef.current
    if (!v || !videoUrl) return
    v.load()
    const tryPlay = () => {
      v.play().catch(() => {
        // Autoplay bloqué (ex. politique navigateur) → on attend un événement
        const onCanPlay = () => {
          v.play().catch(() => { })
          v.removeEventListener('canplay', onCanPlay)
        }
        v.addEventListener('canplay', onCanPlay)
      })
    }
    if (v.readyState >= 3) {
      tryPlay()
    } else {
      v.addEventListener('loadeddata', tryPlay, { once: true })
    }
    return () => {
      v.removeEventListener('loadeddata', tryPlay)
    }
  }, [videoUrl])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const getClientPos = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    return { x: e.clientX, y: e.clientY }
  }

  // ── Drag ────────────────────────────────────────────────────────────────────

  const onMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return
    hasMoved.current = true

    const { x: cx, y: cy } = getClientPos(e)
    const player = playerRef.current
    if (!player) return

    const containerEl = containerRef?.current
    const containerRect = containerEl?.getBoundingClientRect()

    let newX: number
    let newY: number

    if (containerEl && containerRect) {
      // ✅ FIX : position relative au conteneur, sans double soustraction
      newX = cx - containerRect.left - dragOffset.current.x
      newY = cy - containerRect.top - dragOffset.current.y
      // Contraindre dans les limites du conteneur
      newX = Math.max(0, Math.min(newX, containerEl.offsetWidth - player.offsetWidth))
      newY = Math.max(0, Math.min(newY, containerEl.offsetHeight - player.offsetHeight))
    } else {
      newX = cx - dragOffset.current.x
      newY = cy - dragOffset.current.y
      newX = Math.max(0, Math.min(newX, window.innerWidth - player.offsetWidth))
      newY = Math.max(0, Math.min(newY, window.innerHeight - player.offsetHeight))
    }

    setPos({ x: newX, y: newY })
  }, [containerRef])

  const onUp = useCallback(() => {
    isDragging.current = false
    setDragging(false)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onUp)
  }, [onMove])

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (expanded) return
    const target = e.target as HTMLElement
    if (target.closest('button')) return

    isDragging.current = true
    hasMoved.current = false
    setDragging(true)

    const clientPos = 'touches' in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY }

    const playerRect = playerRef.current!.getBoundingClientRect()
    const containerRect = containerRef?.current?.getBoundingClientRect()

    if (containerRect) {
      // ✅ FIX : offset = position souris relative au coin supérieur gauche du player
      dragOffset.current = {
        x: clientPos.x - playerRect.left + containerRect.left,
        y: clientPos.y - playerRect.top + containerRect.top,
      }
    } else {
      dragOffset.current = {
        x: clientPos.x - playerRect.left,
        y: clientPos.y - playerRect.top,
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }, [expanded, containerRef, onMove, onUp])

  // Nettoyage listeners
  useEffect(() => () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onUp)
  }, [onMove, onUp])

  // ── Sync muted ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  // ── Interactions ────────────────────────────────────────────────────────────

  const handleExpand = () => {
    if (hasMoved.current) return
    setExpanded(true)
    setMuted(false)
  }

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(false)
    setMuted(true)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setVisible(false)
    onClose?.()
  }

  // ── Rendu ───────────────────────────────────────────────────────────────────

  if (!visible) return null

  // ── Mode plein écran ────────────────────────────────────────────────────────
  if (expanded) {
    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-40 bg-black/75"
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={handleCollapse}
        />

        {/* Fenêtre plein écran */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.1)',
              animation: 'miniPlayerExpand 0.22s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">Vidéo</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); setMuted(m => !m) }}
                  className="p-1.5 rounded-full text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'}
                >
                  {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <button
                  onClick={handleCollapse}
                  className="p-1.5 rounded-full text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.7)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay loop playsInline
              preload="auto"
              muted={muted}
              className="w-full aspect-video object-cover block"
              onLoadedData={e => {
                const v = e.currentTarget
                v.muted = muted
                v.play().catch(() => { })
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes miniPlayerExpand {
            from { opacity: 0; transform: scale(0.92) translateY(10px) }
            to   { opacity: 1; transform: scale(1)    translateY(0)     }
          }
        `}</style>
      </>
    )
  }

  // ── Mode mini player ────────────────────────────────────────────────────────
  return (
    <>
      <div
        ref={playerRef}
        onMouseDown={onDown}
        onTouchStart={onDown}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          zIndex: 30,
          width: 156,
          cursor: dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
          // ✅ Animation d'entrée fluide
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(8px)',
          transition: mounted ? 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        }}
        className="group"
      >
        <div
          style={{
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#0a0a0a',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {/* Bouton fermer */}
          <button
            onClick={handleClose}
            aria-label="Fermer la vidéo"
            style={{
              position: 'absolute', top: 6, right: 6, zIndex: 20,
              width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              opacity: 0, transition: 'opacity 0.15s, background 0.15s',
            }}
            className="group-hover:!opacity-100"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ef4444'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.6)'}
          >
            <X size={9} color="#fff" />
          </button>

          {/* Bouton agrandir */}
          <button
            onClick={handleExpand}
            aria-label="Agrandir la vidéo"
            style={{
              position: 'absolute', bottom: 6, right: 6, zIndex: 20,
              width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              opacity: 0, transition: 'opacity 0.15s, background 0.15s',
            }}
            className="group-hover:!opacity-100"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f97316'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.6)'}
          >
            <Maximize2 size={9} color="#fff" />
          </button>

          {/* Badge muet */}
          <div style={{
            position: 'absolute', bottom: 6, left: 6, zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 3,
            background: 'rgba(0,0,0,0.55)', borderRadius: 20,
            padding: '2px 6px',
          }}>
            <VolumeX size={8} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Muet</span>
          </div>

          {/* Indicateur drag */}
          <div style={{
            position: 'absolute', top: 6, left: 6, zIndex: 20,
            opacity: 0, transition: 'opacity 0.15s',
            display: 'flex', gap: 2,
          }} className="group-hover:!opacity-100">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
            ))}
          </div>

          {/* Vidéo */}
          <div onClick={handleExpand} style={{ cursor: 'pointer' }}>
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay loop muted playsInline
              preload="auto"
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
            />
          </div>

          {/* Glow hover */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(249,115,22,0) 0%, transparent 100%)',
            transition: 'background 0.3s', pointerEvents: 'none',
          }} className="group-hover:!bg-[linear-gradient(135deg,rgba(249,115,22,0.06)_0%,transparent_100%)]" />
        </div>

        {/* Ombre orange */}
        <div style={{
          position: 'absolute', bottom: -8, left: 8, right: 8,
          height: 16, borderRadius: '50%',
          background: '#f97316', filter: 'blur(10px)',
          opacity: 0.35, zIndex: -1,
        }} />
      </div>
    </>
  )
}