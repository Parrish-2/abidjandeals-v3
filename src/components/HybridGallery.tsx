'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { Maximize2, Volume2, VolumeX, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface HybridGalleryProps {
    images: string[]
    videoUrl?: string | null
    alt?: string
}

export function HybridGallery({ images, videoUrl, alt = 'Photo' }: HybridGalleryProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Position draggable de la vidéo PiP
    const pipX = useMotionValue(16)
    const pipY = useMotionValue(16)

    // Suivi index actuel du carousel
    useEffect(() => {
        if (!emblaApi) return
        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
        emblaApi.on('select', onSelect)
        return () => { emblaApi.off('select', onSelect) }
    }, [emblaApi])

    // Sync muted state avec la vidéo
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted
        }
    }, [isMuted])

    const scrollTo = useCallback((index: number) => {
        emblaApi?.scrollTo(index)
    }, [emblaApi])

    function handleVideoDragStart(e: React.PointerEvent) {
        // Empêche le swipe du carousel quand on drag la vidéo
        e.stopPropagation()
    }

    function handleVideoClick(e: React.MouseEvent) {
        e.stopPropagation()
        if (!isExpanded) {
            setIsExpanded(true)
            setIsMuted(false)
            if (videoRef.current) {
                videoRef.current.muted = false
                videoRef.current.play()
            }
        }
    }

    function handleClose(e: React.MouseEvent) {
        e.stopPropagation()
        setIsExpanded(false)
        setIsMuted(true)
        if (videoRef.current) {
            videoRef.current.muted = true
        }
    }

    const hasImages = images && images.length > 0
    const hasVideo = !!videoUrl

    return (
        <div ref={containerRef} className="relative w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden select-none">

            {/* ── CARROUSEL (arrière-plan) ── */}
            <div ref={emblaRef} className="w-full h-full overflow-hidden">
                <div className="flex h-full touch-pan-y">
                    {hasImages ? images.map((src, i) => (
                        <div key={i} className="flex-none w-full h-full relative">
                            <Image
                                src={src}
                                alt={`${alt} ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 60vw"
                                priority={i === 0}
                            />
                        </div>
                    )) : (
                        <div className="flex-none w-full h-full flex items-center justify-center text-gray-300 text-6xl">
                            📷
                        </div>
                    )}
                </div>
            </div>

            {/* ── Indicateurs de slides ── */}
            {hasImages && images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === selectedIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            )}

            {/* ── VIDÉO PiP DRAGGABLE (premier plan) ── */}
            {hasVideo && !isExpanded && (
                <motion.div
                    drag
                    dragConstraints={containerRef}
                    dragMomentum={false}
                    dragElastic={0}
                    style={{ x: pipX, y: pipY, position: 'absolute', zIndex: 20 }}
                    onPointerDownCapture={handleVideoDragStart}
                    className="cursor-grab active:cursor-grabbing"
                >
                    <div
                        className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-white/80"
                        style={{ width: '30%', aspectRatio: '9/16', minWidth: 80 }}
                        onClick={handleVideoClick}
                    >
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay hint */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Maximize2 size={20} className="text-white" />
                        </div>
                        {/* Badge vidéo */}
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            📹 Vidéo
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── VIDÉO AGRANDIE (plein cadre) ── */}
            <AnimatePresence>
                {hasVideo && isExpanded && (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute inset-0 z-30 bg-black"
                    >
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                        />

                        {/* Contrôles vidéo agrandie */}
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m) }}
                                className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                            >
                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
