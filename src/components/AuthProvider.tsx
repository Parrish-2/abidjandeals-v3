'use client'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useStore(s => s.setUser)

  useEffect(() => {
    // ── 1. Session initiale au montage ────────────────────────────────────
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    // ── 2. Écoute des changements d'auth ──────────────────────────────────
    // ⚠️ SUPPRESSION de loadingRef : il bloquait loadProfile() quand
    // onAuthStateChange se déclenchait pendant que getSession() tournait encore,
    // causant un spinner infini de 10s après signInWithPassword.
    // La déduplication est gérée autrement : on ne charge le profil que si
    // l'event est SIGNED_IN ou TOKEN_REFRESHED, pas à chaque state change.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null)
          return
        }
        // On charge uniquement sur les vrais événements de connexion
        // INITIAL_SESSION est géré par getSession() ci-dessus
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await loadProfile(session.user.id)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        await applyFallback()
        return
      }

      setUser(profile as Profile)
    } catch (err) {
      console.error('[AuthProvider] loadProfile error:', err)
      await applyFallback()
    }
  }

  async function applyFallback() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email ?? '',
          prenom: authUser.user_metadata?.prenom ?? '',
          nom: authUser.user_metadata?.nom ?? '',
          tel: authUser.user_metadata?.tel,
          role: 'user',
          level: 'basic',
          active_ads_count: 0,
          is_pro: false,
          note: 0,
          nb_annonces: 0,
          created_at: authUser.created_at,
        } as Profile)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }

  return <>{children}</>
}
