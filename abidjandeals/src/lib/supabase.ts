import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const isBrowser = typeof window !== 'undefined'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

let _client: ReturnType<typeof createBrowserClient> | ReturnType<typeof createSupabaseClient> | null = null

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // ✅ Ne crash plus, mais log une erreur claire
    console.error('Variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes')
    return undefined as any
  }
  if (!_client) {
    _client = isBrowser
      ? createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
      : createSupabaseClient(SUPABASE_URL, SUPABASE_KEY)
  }
  return _client
}

export const supabase = new Proxy({} as ReturnType<typeof getSupabase>, {
  get(_, prop) {
    return (getSupabase() as any)?.[prop]
  },
})