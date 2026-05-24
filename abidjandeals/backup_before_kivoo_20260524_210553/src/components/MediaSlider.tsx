'use client'

// src/components/MediaSlider.tsx
// Slider léger pour les cartes AdCard (grille d'annonces)

import { useCallback, useRef, useState } from 'react'

export interface MediaItem {
  type: 'image' | 'video'
  url: string
}

interface MediaSliderProps {
  media: MediaItem[]
  alt?: string
  aspectClass?: string
}

export default function MediaSlider({
  media,
  alt = 'Photo',
  aspectClass = 'aspect-[4/3]',
}: MediaSliderProps) {
  const images = media.filter(m => m.type === 'image').map(m => m.url)
  const videoUrl = media.find(m => m.type === 'video')?.url ?? ''

  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number>(0)

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(((idx % images.length) + images.length) % images.length)
  }, [images.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) goTo(currentIndex + (dx < 0 ? 1 : -1))
  }

  if (images.length === 0 && !videoUrl) return null

  const displaySrc = images.length > 0 ? images[currentIndex] : null

  return (
    <div className={`relative ${aspectClass} overflow-hidden bg-gray-100 select-none`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image */}
      {displaySrc && (
        <img
          src={displaySrc}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      )}

      {/* Fallback vidéo seule */}
      {!displaySrc && videoUrl && (
        <video
          src={videoUrl}
          muted
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      )}

      {/* Badge vidéo disponible */}
      {videoUrl && images.length > 0 && (
        <div className="absolute bottom-2 left-2 z-10 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          ▶ Vidéo
        </div>
      )}

      {/* Compteur */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 z-10 bg-black/35 text-white text-[10px] rounded-full px-2 py-0.5 tabular-nums">
          {currentIndex + 1}/{images.length}
        </div>
      )}

      {/* Flèches */}
      {images.length > 1 && (
        <>
          <button
            aria-label="Photo précédente"
            onClick={e => { e.preventDefault(); goTo(currentIndex - 1) }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-gray-700 shadow text-sm"
          >‹</button>
          <button
            aria-label="Photo suivante"
            onClick={e => { e.preventDefault(); goTo(currentIndex + 1) }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-gray-700 shadow text-sm"
          >›</button>
        </>
      )}

      {/* Indicateurs */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.preventDefault(); goTo(i) }}
              className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/55'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
