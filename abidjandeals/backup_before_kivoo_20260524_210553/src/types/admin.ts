// src/types/admin.ts
// ─── Types centralisés pour le dashboard admin ───────────────────────────────

export type UserRole = 'user' | 'admin' | 'moderator'
export type ListingStatus = 'pending' | 'active' | 'rejected' | 'expired' | 'sold'
export type ReportStatus = 'open' | 'in_review' | 'resolved' | 'dismissed'
export type ReportReason = 'spam' | 'fraud' | 'inappropriate' | 'duplicate' | 'other'

// ─── BOOST ───────────────────────────────────────────────────────────────────

export type BoostLevel = 'STANDARD' | 'PREMIUM' | 'URGENT'

export interface BoostOptions {
  level: BoostLevel
  durationDays: number
  /** Timestamp UTC : Date.now() + durationDays * 86_400_000 */
  boost_until: number
  price: number
  /** Facteur de remontée dans le flux (ex: ×3, ×7, ×15) */
  multiplier: number
}

export const BOOST_CONFIGS: Record<BoostLevel, Omit<BoostOptions, 'boost_until'>> = {
  STANDARD: { level: 'STANDARD', durationDays: 7,  price: 3_000,  multiplier: 3  },
  PREMIUM:  { level: 'PREMIUM',  durationDays: 14, price: 8_000,  multiplier: 7  },
  URGENT:   { level: 'URGENT',   durationDays: 3,  price: 1_500,  multiplier: 15 },
}

// ─── BANNIÈRE ────────────────────────────────────────────────────────────────

export type BannerPlacement =
  | 'homepage_top'
  | 'homepage_mid'
  | 'search_sidebar'
  | 'category_top'

export interface BannerData {
  id: string
  /** Nom de l'entreprise cliente */
  company_name: string
  image_url: string
  /** URL de redirection au clic */
  link_url: string | null
  placement: BannerPlacement
  active: boolean
  /** Timestamp UTC — SmartBanner n'affiche pas si Date.now() > contract_end */
  contract_end: number | null
  /** Compteur de clics — incrémenté dans la table `banners` */
  click_count: number
  created_at: string
}

export const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  homepage_top:   'Accueil — Haut de page',
  homepage_mid:   'Accueil — Milieu',
  search_sidebar: 'Recherche — Sidebar',
  category_top:   'Catégorie — Haut',
}

// ─── PROFIL UTILISATEUR — miroir exact de src/lib/supabase.ts ────────────────
// Ne pas modifier indépendamment — garder synchronisé avec supabase.ts

export interface Profile {
  id: string
  prenom: string
  nom: string
  email: string
  tel?: string
  avatar_url?: string
  role: UserRole
  is_verified?: boolean
  verified_seller?: boolean
  level: 'basic' | 'confirmed' | 'certified'
  active_ads_count: number
  is_pro: boolean
  note: number
  nb_annonces: number
  nb_avis?: number
  bio?: string
  created_at: string
  updated_at?: string
  boutique_slug?: string
  boutique_name?: string
  kyc_status?: 'non_soumis' | 'en_cours' | 'valide' | 'rejete'
  kyc_score?: number
}

// ─── ANNONCE ─────────────────────────────────────────────────────────────────

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  category_id: string
  subcategory: string | null
  city: string
  images: string[]
  status: ListingStatus
  views: number
  is_featured: boolean
  /** Champs boost (table `ads`) */
  is_boosted: boolean
  boost_level: BoostLevel | null
  boost_until: string | null
  created_at: string
  updated_at: string
  author?: Pick<Profile, 'id' | 'prenom' | 'nom' | 'email' | 'avatar_url' | 'is_verified'>
  category?: { name: string; slug: string }
}

// ─── SIGNALEMENT ─────────────────────────────────────────────────────────────

export interface Report {
  id: string
  listing_id: string
  reporter_id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  listing?: Pick<Listing, 'id' | 'title' | 'status'>
  reporter?: Pick<Profile, 'id' | 'prenom' | 'nom' | 'email'>
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_users: number
  new_users_today: number
  new_users_week: number
  total_listings: number
  pending_listings: number
  active_listings: number
  listings_today: number
  open_reports: number
  resolved_reports_week: number
  revenue_month: number
  revenue_growth_percent: number
}

// ─── PAGINATION & FILTRES ────────────────────────────────────────────────────

export interface PaginationParams {
  page: number
  limit: number
  total: number
}

export interface ModerationFilter {
  status?: ListingStatus
  category?: string
  city?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

export type ModerationAction = 'approve' | 'reject' | 'feature' | 'unfeature' | 'delete'

export interface ModerationActionPayload {
  listing_id: string
  action: ModerationAction
  reason?: string
  moderator_id: string
}
