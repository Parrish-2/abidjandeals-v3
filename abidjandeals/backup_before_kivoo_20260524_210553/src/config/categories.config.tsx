// src/config/categories.config.tsx
// SOURCE DE VÉRITÉ UNIQUE — Toutes les catégories AbidjanDeals Pro

import {
  Armchair,
  Briefcase,
  Car,
  Heart,
  Home,
  Monitor,
  PackageSearch,
  ShoppingBag,
  Trophy,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MetadataType = 'real_estate' | 'vehicle' | 'default'

export type CategoryColor =
  | 'emerald'
  | 'blue'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'indigo'
  | 'orange'
  | 'cyan'
  | 'slate'
  | 'pink'

export interface SubCategory {
  id: string
  slug: string
  labelKey: string
}

export interface Category {
  id: string
  slug: string
  icon: React.ElementType
  labelKey: string
  metadataType: MetadataType
  color: CategoryColor
  bannerUrl?: string
  subCategories: SubCategory[]
  isAdult?: boolean // 🔞 Flag adulte — déclenche l'age gate
}

// ─────────────────────────────────────────────────────────────────────────────
// MAPPING COULEURS TAILWIND
// ─────────────────────────────────────────────────────────────────────────────

export const COLOR_MAP: Record<
  CategoryColor,
  { bg: string; bgHover: string; text: string; badge: string; ring: string }
> = {
  emerald: {
    bg: 'bg-emerald-50',
    bgHover: 'hover:bg-emerald-50',
    text: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    ring: 'ring-emerald-200',
  },
  blue: {
    bg: 'bg-blue-50',
    bgHover: 'hover:bg-blue-50',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    ring: 'ring-blue-200',
  },
  violet: {
    bg: 'bg-violet-50',
    bgHover: 'hover:bg-violet-50',
    text: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-700',
    ring: 'ring-violet-200',
  },
  rose: {
    bg: 'bg-rose-50',
    bgHover: 'hover:bg-rose-50',
    text: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700',
    ring: 'ring-rose-200',
  },
  amber: {
    bg: 'bg-amber-50',
    bgHover: 'hover:bg-amber-50',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    ring: 'ring-amber-200',
  },
  indigo: {
    bg: 'bg-indigo-50',
    bgHover: 'hover:bg-indigo-50',
    text: 'text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700',
    ring: 'ring-indigo-200',
  },
  orange: {
    bg: 'bg-orange-50',
    bgHover: 'hover:bg-orange-50',
    text: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    ring: 'ring-orange-200',
  },
  cyan: {
    bg: 'bg-cyan-50',
    bgHover: 'hover:bg-cyan-50',
    text: 'text-cyan-600',
    badge: 'bg-cyan-100 text-cyan-700',
    ring: 'ring-cyan-200',
  },
  slate: {
    bg: 'bg-slate-50',
    bgHover: 'hover:bg-slate-50',
    text: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    ring: 'ring-slate-200',
  },
  pink: {
    bg: 'bg-pink-50',
    bgHover: 'hover:bg-pink-50',
    text: 'text-pink-600',
    badge: 'bg-pink-100 text-pink-700',
    ring: 'ring-pink-200',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION CATÉGORIES
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [

  // ── 1. IMMOBILIER ──────────────────────────────────────────────────────────
  {
    id: 'immobilier',
    slug: 'immobilier',
    icon: Home,
    labelKey: 'categories.real_estate',
    metadataType: 'real_estate',
    color: 'emerald',
    bannerUrl: '/banners/immobilier.jpg',
    subCategories: [
      { id: 'vente-appartement', slug: 'vente-appartement', labelKey: 'categories.sub.apartment_sale' },
      { id: 'vente-maison-villa', slug: 'vente-maison-villa', labelKey: 'categories.sub.house_sale' },
      { id: 'location-meublee', slug: 'location-meublee', labelKey: 'categories.sub.furnished_rental' },
      { id: 'location-vide', slug: 'location-vide', labelKey: 'categories.sub.unfurnished_rental' },
      { id: 'colocation', slug: 'colocation', labelKey: 'categories.sub.colocation' },
      { id: 'terrains', slug: 'terrains', labelKey: 'categories.sub.land' },
      { id: 'bureaux-boutiques', slug: 'bureaux-boutiques', labelKey: 'categories.sub.offices' },
      { id: 'residences-meublees', slug: 'residences-meublees', labelKey: 'categories.sub.furnished_res' },
    ],
  },

  // ── 2. VÉHICULES & ÉQUIPEMENTS ────────────────────────────────────────────
  {
    id: 'vehicules-equipements',
    slug: 'vehicules-equipements',
    icon: Car,
    labelKey: 'categories.vehicles_equipment',
    metadataType: 'vehicle',
    color: 'blue',
    bannerUrl: '/banners/vehicules.jpg',
    subCategories: [
      { id: 'voitures-occasion', slug: 'voitures-occasion', labelKey: 'categories.sub.used_cars' },
      { id: 'voitures-neuves', slug: 'voitures-neuves', labelKey: 'categories.sub.new_cars' },
      { id: 'motos-scooters', slug: 'motos-scooters', labelKey: 'categories.sub.motorcycles' },
      { id: 'pieces-pneus', slug: 'pieces-pneus', labelKey: 'categories.sub.parts' },
      { id: 'location-auto', slug: 'location-auto', labelKey: 'categories.sub.car_rental' },
      { id: 'camions-utilitaires', slug: 'camions-utilitaires', labelKey: 'categories.sub.trucks' },
      { id: 'groupes-electrogenes', slug: 'groupes-electrogenes', labelKey: 'categories.sub.generators' },
      { id: 'materiel-agricole', slug: 'materiel-agricole', labelKey: 'categories.sub.agricultural' },
      { id: 'outillage-industriel', slug: 'outillage-industriel', labelKey: 'categories.sub.industrial' },
      { id: 'engins-chantier', slug: 'engins-chantier', labelKey: 'categories.sub.construction_eq' },
    ],
  },

  // ── 3. HIGH-TECH & INFORMATIQUE ───────────────────────────────────────────
  {
    id: 'hightech-informatique',
    slug: 'hightech-informatique',
    icon: Monitor,
    labelKey: 'categories.hightech_it',
    metadataType: 'default',
    color: 'violet',
    bannerUrl: '/banners/electronique.jpg',
    subCategories: [
      { id: 'smartphones', slug: 'smartphones', labelKey: 'categories.sub.smartphones' },
      { id: 'ordinateurs', slug: 'ordinateurs', labelKey: 'categories.sub.computers' },
      { id: 'tablettes', slug: 'tablettes', labelKey: 'categories.sub.tablets' },
      { id: 'tv-son', slug: 'tv-son', labelKey: 'categories.sub.tv_audio' },
      { id: 'photo-video', slug: 'photo-video', labelKey: 'categories.sub.photo_video' },
      { id: 'consoles-jeux', slug: 'consoles-jeux', labelKey: 'categories.sub.gaming' },
      { id: 'objets-connectes', slug: 'objets-connectes', labelKey: 'categories.sub.iot' },
      { id: 'cartes-meres', slug: 'cartes-meres', labelKey: 'categories.sub.motherboards' },
      { id: 'cpu-processeurs', slug: 'cpu-processeurs', labelKey: 'categories.sub.cpu' },
      { id: 'ram-memoire', slug: 'ram-memoire', labelKey: 'categories.sub.ram' },
      { id: 'stockage-ssd', slug: 'stockage-ssd', labelKey: 'categories.sub.ssd' },
      { id: 'stockage-hdd', slug: 'stockage-hdd', labelKey: 'categories.sub.hdd' },
      { id: 'cartes-graphiques', slug: 'cartes-graphiques', labelKey: 'categories.sub.gpu' },
    ],
  },

  // ── 4. MODE & BEAUTÉ ──────────────────────────────────────────────────────
  {
    id: 'mode',
    slug: 'mode',
    icon: ShoppingBag,
    labelKey: 'categories.fashion',
    metadataType: 'default',
    color: 'rose',
    bannerUrl: '/banners/mode.jpg',
    subCategories: [
      { id: 'vetements', slug: 'vetements', labelKey: 'categories.sub.clothing' },
      { id: 'chaussures', slug: 'chaussures', labelKey: 'categories.sub.shoes' },
      { id: 'sacs-accessoires', slug: 'sacs-accessoires', labelKey: 'categories.sub.bags' },
      { id: 'montres', slug: 'montres', labelKey: 'categories.sub.watches' },
      { id: 'cosmetiques', slug: 'cosmetiques', labelKey: 'categories.sub.cosmetics' },
    ],
  },

  // ── 5. MAISON & DÉCORATION ────────────────────────────────────────────────
  {
    id: 'maison',
    slug: 'maison',
    icon: Armchair,
    labelKey: 'categories.home',
    metadataType: 'default',
    color: 'amber',
    subCategories: [
      { id: 'meubles', slug: 'meubles', labelKey: 'categories.sub.furniture' },
      { id: 'electromenager', slug: 'electromenager', labelKey: 'categories.sub.appliances' },
      { id: 'decoration', slug: 'decoration', labelKey: 'categories.sub.decoration' },
      { id: 'jardin-bricolage', slug: 'jardin-bricolage', labelKey: 'categories.sub.garden' },
    ],
  },

  // ── 6. SERVICES & EMPLOI ──────────────────────────────────────────────────
  {
    id: 'services',
    slug: 'services',
    icon: Briefcase,
    labelKey: 'categories.services',
    metadataType: 'default',
    color: 'indigo',
    subCategories: [
      { id: 'freelance-it', slug: 'freelance-it', labelKey: 'categories.sub.freelance_it' },
      { id: 'batiment', slug: 'batiment', labelKey: 'categories.sub.construction' },
      { id: 'cours-formation', slug: 'cours-formation', labelKey: 'categories.sub.training' },
      { id: 'offres-emploi', slug: 'offres-emploi', labelKey: 'categories.sub.jobs' },
    ],
  },

  // ── 7. SPORT & LOISIRS ────────────────────────────────────────────────────
  {
    id: 'sport-loisirs',
    slug: 'sport-loisirs',
    icon: Trophy,
    labelKey: 'categories.sport',
    metadataType: 'default',
    color: 'cyan',
    subCategories: [
      { id: 'equipements-sport', slug: 'equipements-sport', labelKey: 'categories.sub.sport_equipment' },
      { id: 'instruments-musique', slug: 'instruments-musique', labelKey: 'categories.sub.music' },
      { id: 'jouets', slug: 'jouets', labelKey: 'categories.sub.toys' },
      { id: 'voyages', slug: 'voyages', labelKey: 'categories.sub.travel' },
    ],
  },

  // ── 8. AUTRES & DIVERS ────────────────────────────────────────────────────
  {
    id: 'autres',
    slug: 'autres',
    icon: PackageSearch,
    labelKey: 'categories.other',
    metadataType: 'default',
    color: 'slate',
    subCategories: [
      { id: 'inclassables', slug: 'inclassables', labelKey: 'categories.sub.uncategorized' },
      { id: 'collection', slug: 'collection', labelKey: 'categories.sub.collectibles' },
    ],
  },

  // ── 9. LINGERIE & ACCESSOIRES 🔞 ──────────────────────────────────────────
  {
    id: 'lingerie',
    slug: 'lingerie',
    icon: Heart,
    labelKey: 'categories.lingerie',
    metadataType: 'default',
    color: 'pink',
    isAdult: true, // 🔞 Déclenche l'age gate automatiquement
    subCategories: [
      { id: 'lingerie-sous-vetements', slug: 'lingerie-sous-vetements', labelKey: 'categories.sub.lingerie' },
      { id: 'maillots-de-bain', slug: 'maillots-de-bain', labelKey: 'categories.sub.swimwear' },
      { id: 'cosmetiques-bien-etre', slug: 'cosmetiques-bien-etre', labelKey: 'categories.sub.wellness' },
      { id: 'accessoires-mode', slug: 'accessoires-mode', labelKey: 'categories.sub.accessories' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(c => c.slug === slug)
}

export function getSubCategoryById(categoryId: string, subId: string): SubCategory | undefined {
  return getCategoryById(categoryId)?.subCategories.find(s => s.id === subId)
}

export function isAdultCategory(categoryId: string): boolean {
  return getCategoryById(categoryId)?.isAdult === true
}

// ─────────────────────────────────────────────────────────────────────────────
// MAPPING RÉTROCOMPATIBILITÉ
// ─────────────────────────────────────────────────────────────────────────────

export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'vehicules': 'vehicules-equipements',
  'equipements-pro': 'vehicules-equipements',
  'electronique': 'hightech-informatique',
  'composants-pc': 'hightech-informatique',
}

export function resolveCategoryId(id: string): string {
  return LEGACY_CATEGORY_MAP[id] ?? id
}