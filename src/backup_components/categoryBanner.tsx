// src/components/categoryBanner.tsx
// Bannière optimisée pour les pages de résultats de catégorie

'use client'

import Image from 'next/image'
import { Category, COLOR_MAP } from '@/config/categories.config'
import { useI18n } from '@/contexts/i18nContext'

interface CategoryBannerProps {
  category: Category
  resultCount?: number
}

export function CategoryBanner({ category, resultCount }: CategoryBannerProps) {
  const { t } = useI18n()
  const Icon = category.icon
  const colors = COLOR_MAP[category.color]
  const label = t(category.labelKey)

  // ── Avec bannière image ──────────────────────────────────────────────────
  if (category.bannerUrl) {
    return (
      <div className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden">
        <Image
          src={category.bannerUrl}
          alt={label}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1280px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 sm:px-10 gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Icon size={24} className="text-white" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {label}
            </h1>
            {resultCount !== undefined && (
              <p className="text-sm text-white/80 mt-0.5">
                {resultCount.toLocaleString('fr-FR')} annonce{resultCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Fallback coloré ──────────────────────────────────────────────────────
  return (
    <div className={`w-full h-32 sm:h-40 rounded-2xl flex items-center px-6 sm:px-10 gap-4 ${colors.bg} border border-gray-100`}>
      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon size={28} className={colors.text} strokeWidth={1.75} />
      </div>
      <div>
        <h1 className={`text-xl sm:text-2xl font-bold ${colors.text}`}>
          {label}
        </h1>
        {resultCount !== undefined && (
          <p className="text-sm text-gray-500 mt-0.5">
            {resultCount.toLocaleString('fr-FR')} annonce{resultCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
