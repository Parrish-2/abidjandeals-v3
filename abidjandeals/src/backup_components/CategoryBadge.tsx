'use client'
// src/components/CategoryBadge.tsx
// Import depuis la source de vérité unique : @/config/categories.config

import { getCategoryById, getCategoryBySlug, COLOR_MAP } from '@/config/categories.config'
import type { Category } from '@/config/categories.config'

interface CategoryBadgeProps {
  /** ID ou slug de la catégorie (ex: 'immobilier', 'mode') */
  categoryId: string
  /** Variante d'affichage */
  variant?: 'default' | 'pill' | 'inline'
  className?: string
}

export function CategoryBadge({ categoryId, variant = 'default', className = '' }: CategoryBadgeProps) {
  // Cherche par id d'abord, puis par slug
  const category: Category | undefined =
    getCategoryById(categoryId) ?? getCategoryBySlug(categoryId)

  if (!category) {
    return (
      <span className={`inline-flex items-center text-xs font-medium text-gray-500 ${className}`}>
        {categoryId}
      </span>
    )
  }

  const colors = COLOR_MAP[category.color]
  const Icon = category.icon

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.badge} ${className}`}
      >
        <Icon size={11} strokeWidth={2} />
        {category.labelKey}
      </span>
    )
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${colors.text} ${className}`}>
        <Icon size={11} strokeWidth={2} />
        <span>{category.labelKey}</span>
      </span>
    )
  }

  // default
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${colors.bg} ${colors.text} ${className}`}
    >
      <Icon size={12} strokeWidth={1.75} />
      {category.labelKey}
    </span>
  )
}
