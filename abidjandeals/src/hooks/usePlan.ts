'use client'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export type Plan = 'free' | 'pro_trial' | 'pro' | 'business'

export function usePlan() {
    const [plan, setPlan] = useState<Plan>('free')
    const [expiresAt, setExpiresAt] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

            ; (async () => {
                const { data: userData } = await supabase.auth.getUser()
                if (!userData?.user) {
                    if (!cancelled) setLoading(false)
                    return
                }

                // Pas de .single() ici : un compte cree avant le trigger
                // on_new_user_trial n'a AUCUNE ligne dans seller_subscriptions.
                // .single() leverait une erreur dans ce cas (0 ligne != 1 ligne attendue).
                // .maybeSingle() retourne data: null proprement si 0 ligne, sans erreur.
                const { data: sub, error } = await supabase
                    .from('seller_subscriptions')
                    .select('plan, expires_at')
                    .eq('seller_id', userData.user.id)
                    .maybeSingle()

                if (cancelled) return

                if (error) {
                    console.error('usePlan: erreur lecture seller_subscriptions', error)
                    setPlan('free')
                    setLoading(false)
                    return
                }

                if (!sub) {
                    // Aucune ligne -> compte pre-trigger -> traite comme free
                    setPlan('free')
                    setExpiresAt(null)
                    setLoading(false)
                    return
                }

                const expired = sub.expires_at ? new Date(sub.expires_at) < new Date() : false
                setPlan(expired ? 'free' : (sub.plan as Plan))
                setExpiresAt(sub.expires_at)
                setLoading(false)
            })()

        return () => { cancelled = true }
    }, [])

    return {
        plan,
        expiresAt,
        loading,
        isPro: plan === 'pro' || plan === 'pro_trial' || plan === 'business',
        isTrial: plan === 'pro_trial',
        isBusiness: plan === 'business',
    }
}
