'use client'

// src/components/HomepageBanner.tsx
// Wrapper client léger — permet d'utiliser BannerSlot dans un Server Component

import BannerSlot from '@/components/BannerSlot'

export default function HomepageBanner() {
    return (
        <div className="max-w-4xl mx-auto">
            <BannerSlot position="homepage_top" />
        </div>
    )
}
