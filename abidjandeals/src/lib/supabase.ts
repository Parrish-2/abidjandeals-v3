import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Détection de l'environnement (Navigateur vs Serveur)
const isBrowser = typeof window !== 'undefined'

// ── Singleton explicite côté navigateur ──────────────────────────────────────
// PROBLEME RESOLU : createBrowserClient() est cense etre un singleton par
// module, mais avec Turbopack/Next.js le module peut etre duplique dans
// plusieurs chunks JS (.next/static/chunks/0xxxx.js). Chaque duplication
// recree une instance distincte du client Supabase, chacune avec son propre
// gestionnaire de lock pour le meme token d'auth (meme cle "sb-...-auth-token"
// dans le navigateur). Resultat : plusieurs instances se battent pour le
// meme verrou -> "Lock was released because another request stole it".
//
// FIX : on attache l'instance unique a `globalThis`, qui est partage entre
// tous les chunks d'un meme onglet navigateur, peu importe combien de fois
// ce module est duplique au bundling.
declare global {
  // eslint-disable-next-line no-var
  var __kivoo_supabase_browser_client__: ReturnType<typeof createBrowserClient> | undefined
}

function getBrowserClient() {
  if (!globalThis.__kivoo_supabase_browser_client__) {
    globalThis.__kivoo_supabase_browser_client__ = createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
  }
  return globalThis.__kivoo_supabase_browser_client__
}

// Correction pour éviter le crash sur Vercel (cote serveur : pas de singleton
// necessaire, chaque requete serveur est isolee de toute facon)
export const supabase = isBrowser
  ? getBrowserClient()
  : createClient(SUPABASE_URL, SUPABASE_KEY)

// --- VOS TYPES (RÉINTÉGRÉS POUR FIXER L'ERREUR DE BUILD) ---

export type UserLevel = 'basic' | 'confirmed' | 'certified'
export type AdStatus = 'pending' | 'active' | 'rejected' | 'sold' | 'archived'
export type UserRole = 'admin' | 'moderator' | 'user'

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
  verified_seller_at?: string
  certification_requested?: boolean
  certification_requested_at?: string
  honor_badge?: boolean
  trust_badge?: boolean
  verification_requested?: boolean
  verification_requested_at?: string
  level: UserLevel
  account_level?: string
  certified_at?: string
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
  boutique_description?: string
  logo_url?: string
  banner_url?: string
  boutique_active?: boolean
  kyc_status?: 'non_soumis' | 'en_cours' | 'valide' | 'rejete'
  kyc_score?: number
  cgu_accepted_at?: string
  cgu_accepted_ip?: string
  cgu_user_agent?: string
  cgu_version?: string
}

export interface Ad {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  category: string
  subcategory?: string
  etat?: string
  marque?: string
  city: string
  quartier?: string
  tel?: string
  whatsapp?: string
  photos: string[]
  tags?: string[]
  badge?: string
  boost_level: number
  is_boosted?: boolean
  boost_until?: string | null
  views: number
  status: AdStatus
  created_at: string
  updated_at?: string
  profiles?: Profile
}
