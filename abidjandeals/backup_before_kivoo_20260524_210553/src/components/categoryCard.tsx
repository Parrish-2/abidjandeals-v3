// src/components/categoryCard.tsx
// Composant atomique — carte de catégorie réutilisable
// Variantes : 'grid' (homepage) | 'compact' (navbar/sidebar) | 'featured' (mise en avant)

'use client'

import Link from 'next/link'
import { Category, COLOR_MAP } from '@/config/categories.config'
import { useI18n } from '@/contexts/i18nContext'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: Category
  variant?: 'grid' | 'compact' | 'featured'
  onSelect?: (categoryId: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTE : GRID — page d'accueil (grille visuelle)
// ─────────────────────────────────────────────────────────────────────────────

function GridCard({ category, onSelect }: Omit<CategoryCardProps, 'variant'>) {
  const { t } = useI18n()
  const Icon = category.icon
  const colors = COLOR_MAP[category.color]

  return (
    <Link
      href={`/category/${category.slug}`}
      onClick={() => onSelect?.(category.id)}
      className={`
        group relative flex flex-col items-center gap-3 p-5
        bg-white rounded-2xl border border-gray-100
        hover:border-gray-200 hover:bg-gray-50 hover:shadow-md
        transition-all duration-200 ease-out text-center
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-offset-2 ${colors.ring}
      `}
    >
      {/* Icône */}
      <div
        className={`
          w-14 h-14 rounded-2xl flex items-center justify-center
          ${colors.bg} transition-transform duration-200
          group-hover:scale-110
        `}
      >
        <Icon size={24} className={colors.text} strokeWidth={1.75} />
      </div>

      {/* Label traduit */}
      <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 line-clamp-2 leading-tight transition-colors">
        {t(category.labelKey)}
      </span>

      {/* Badge nombre de sous-catégories */}
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
        {category.subCategories.length} sous-catégories
      </span>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTE : COMPACT — navbar horizontale ou sidebar
// ─────────────────────────────────────────────────────────────────────────────

function CompactCard({ category, onSelect }: Omit<CategoryCardProps, 'variant'>) {
  const { t } = useI18n()
  const Icon = category.icon
  const colors = COLOR_MAP[category.color]

  return (
    <Link
      href={`/category/${category.slug}`}
      onClick={() => onSelect?.(category.id)}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-xl
        text-gray-600 hover:bg-gray-50 hover:text-gray-900
        transition-all duration-150 ease-out
        focus-visible:outline-none focus-visible:ring-2 ${colors.ring}
      `}
    >
      <div
        className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          flex-shrink-0 ${colors.bg}
          group-hover:scale-105 transition-transform duration-150
        `}
      >
        <Icon size={16} className={colors.text} strokeWidth={1.75} />
      </div>
      <span className="text-sm font-medium truncate">{t(category.labelKey)}</span>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTE : FEATURED — mise en avant, affichage horizontal avec sous-titre
// ─────────────────────────────────────────────────────────────────────────────

function FeaturedCard({ category, onSelect }: Omit<CategoryCardProps, 'variant'>) {
  const { t } = useI18n()
  const Icon = category.icon
  const colors = COLOR_MAP[category.color]

  return (
    <Link
      href={`/category/${category.slug}`}
      onClick={() => onSelect?.(category.id)}
      className={`
        group relative flex items-center gap-4 p-4
        bg-white rounded-2xl border border-gray-100
        hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 ${colors.ring}
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          flex-shrink-0 ${colors.bg}
          group-hover:scale-105 transition-transform duration-200
        `}
      >
        <Icon size={22} className={colors.text} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {t(category.labelKey)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {category.subCategories.length} catégories
        </p>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function CategoryCard({ category, variant = 'grid', onSelect }: CategoryCardProps) {
  switch (variant) {
    case 'compact':
      return <CompactCard  category={category} onSelect={onSelect} />
    case 'featured':
      return <FeaturedCard category={category} onSelect={onSelect} />
    default:
      return <GridCard     category={category} onSelect={onSelect} />
  }
}
