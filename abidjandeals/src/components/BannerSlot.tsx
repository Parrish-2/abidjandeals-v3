'use client'

// src/components/BannerSlot.tsx

import { supabase } from '@/lib/supabase'
import { useEffect, useRef, useState } from 'react'

export type BannerPosition =
    | 'homepage_top'
    | 'homepage_mid'
    | 'search_sidebar'
    | 'category_top'
    | 'ad_detail'
    | 'sidebar'
    | 'footer'

interface Banner {
    id: string
    company_name: string
    image_url: string
    link_url: string | null
    click_count: number
}

// ── Largeur max par position ───────────────────────────────────────────────
const MAX_WIDTH: Record<BannerPosition, number> = {
    homepage_top: 970,
    homepage_mid: 970,
    category_top: 970,
    search_sidebar: 300,
    ad_detail: 970,
    sidebar: 300,
    footer: 970,
}

const ROTATE_INTERVAL_MS = 6000

interface BannerSlotProps {
    position: BannerPosition
    className?: string
}

export default function BannerSlot({ position, className = '' }: BannerSlotProps) {
    const [banners, setBanners] = useState<Banner[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [visible, setVisible] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const maxWidth = MAX_WIDTH[position]

    // ── 1. Charger les bannières actives ──────────────────────────────────────
    useEffect(() => {
        async function fetchBanners() {
            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('banners')
                .select('id, company_name, image_url, link_url, click_count')
                .eq('placement', position)
                .eq('active', true)
                .or(`contract_end.is.null,contract_end.gt.${now}`)
                .order('created_at', { ascending: false })

            if (error || !data || data.length === 0) return

            // Mélange aléatoire (Fisher-Yates)
            const shuffled = [...data]
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
            }

            setBanners(shuffled)
            setVisible(true)
        }

        fetchBanners()
    }, [position])

    // ── 2. Rotation automatique ───────────────────────────────────────────────
    useEffect(() => {
        if (banners.length <= 1) return
        intervalRef.current = setInterval(() => {
            setCurrentIdx(prev => (prev + 1) % banners.length)
        }, ROTATE_INTERVAL_MS)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [banners.length])

    // ── 3. Comptage des clics ─────────────────────────────────────────────────
    async function handleClick() {
        const banner = banners[currentIdx]
        if (!banner) return
        await supabase
            .from('banners')
            .update({ click_count: (banner.click_count ?? 0) + 1 })
            .eq('id', banner.id)
    }

    if (!visible || banners.length === 0) return null

    const banner = banners[currentIdx]

    return (
        <div className={`w-full ${className}`}>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 pl-0.5">
                Publicité
            </p>

            <div
                className="relative mx-auto rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                style={{ maxWidth }}
            >
                {banner.link_url ? (
                    <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        onClick={handleClick}
                        className="block w-full"
                    >
                        <img
                            src={banner.image_url}
                            alt={`Publicité ${banner.company_name}`}
                            className="w-full h-auto block hover:opacity-95 transition-opacity"
                        />
                    </a>
                ) : (
                    <img
                        src={banner.image_url}
                        alt={`Publicité ${banner.company_name}`}
                        className="w-full h-auto block"
                    />
                )}

                {/* Indicateurs de rotation */}
                {banners.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCurrentIdx(i)
                                    if (intervalRef.current) clearInterval(intervalRef.current)
                                    intervalRef.current = setInterval(() => {
                                        setCurrentIdx(prev => (prev + 1) % banners.length)
                                    }, ROTATE_INTERVAL_MS)
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIdx ? 'bg-white scale-125' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
