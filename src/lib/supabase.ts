import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cette fonction détecte si on est sur un serveur ou un navigateur
const isBrowser = typeof window !== 'undefined'

export const supabase = isBrowser
  ? createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
  : createClient(SUPABASE_URL, SUPABASE_KEY)

// Gardez le reste de vos exports (types Profile, Ad, etc.) en dessous
export type UserLevel = 'basic' | 'confirmed' | 'certified'
// ... (copiez le reste de votre fichier ici)
