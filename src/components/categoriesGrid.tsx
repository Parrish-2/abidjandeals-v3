// src/components/categoriesGrid.tsx
'use client'

import { CategoryCard } from '@/components/categoryCard'
import { CATEGORIES } from '@/config/categories.config'
import Link from 'next/link'

interface CategoriesGridProps {
  /** Callback optionnel si tu veux intercepter le clic (ex: auth guard) */
  onCategoryClick?: (categoryId: string, e: React.MouseEvent) => void
  /** Titre de la section */
  title?: string
  /** Lien "voir tout" */
  seeAllHref?: string
  seeAllLabel?: string
}

export function CategoriesGrid({
  onCategoryClick,
  title,
  seeAllHref = '/category/all',
  seeAllLabel = 'Voir tout →',
}: CategoriesGridProps) {
  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-sans font-semibold text-[24px] text-dark">{title}</h2>
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              {seeAllLabel}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            onClick={e => onCategoryClick?.(cat.id, e as React.MouseEvent)}
          >
            <CategoryCard category={cat} variant="grid" />
          </div>
        ))}
      </div>
    </section>
  )
}
