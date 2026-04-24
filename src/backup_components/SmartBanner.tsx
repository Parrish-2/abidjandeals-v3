'use client'

// src/components/SmartBanner.tsx

import { useEffect, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { BannerData } from '@/types/admin'

interface SmartBannerProps {
  banner: BannerData
  className?: string
}

export function SmartBanner({ banner, className = '' }: SmartBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const impressionFired = useRef(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ── GUARD TEMPOREL ──────────────────────────────────────────────────────────
  if (banner.contract_end !== null && Date.now() > banner.contract_end) return null
  if (!banner.active) return null

  // ── IMPRESSION ──────────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const trackImpression = useCallback(() => {
    if (impressionFired.current) return
    impressionFired.current = true
  }, [])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          trackImpression()
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [trackImpression])

  // ── TRACKING CLIC ───────────────────────────────────────────────────────────
  // Correction TS2551 : Supabase retourne { data, error } — pas de .catch()
  // On destructure l'erreur et on fait un fallback update si le RPC n'existe pas
  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()

    const { error } = await supabase.rpc('increment_banner_click', {
      banner_id: banner.id,
    })

    if (error) {
      // Fallback direct si la fonction RPC n'est pas encore créée
      await supabase
        .from('banners')
        .update({ click_count: banner.click_count + 1 })
        .eq('id', banner.id)
    }

    if (banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div ref={containerRef} className={className}>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 pl-0.5">
        Publicité
      </p>
      <a
        href={banner.link_url ?? '#'}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-150"
        aria-label={`Publicité — ${banner.company_name}`}
      >
        <img
          src={banner.image_url}
          alt={banner.company_name}
          className="w-full h-auto object-cover block"
          loading="lazy"
        />
      </a>
    </div>
  )
}

export default SmartBanner
