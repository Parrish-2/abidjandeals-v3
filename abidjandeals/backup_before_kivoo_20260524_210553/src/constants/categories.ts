// src/components/constants/categories.ts
// Fichier de réexportation pour compatibilité avec les imports '@/constants/categories'
// La source de vérité reste src/config/categories.config.tsx

export {
  CATEGORIES,
  COLOR_MAP,
  getCategoryById,
  getCategoryBySlug,
  getSubCategoryById,
  resolveCategoryId,
  LEGACY_CATEGORY_MAP,
} from '@/config/categories.config'

export type {
  Category,
  SubCategory,
  CategoryColor,
  MetadataType,
} from '@/config/categories.config'
