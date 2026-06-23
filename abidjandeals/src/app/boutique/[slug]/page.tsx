import { createSupabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import BoutiqueClient from './BoutiqueClient'

export default async function BoutiquePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createSupabaseServer()

    // Service role — uniquement côté serveur, jamais exposé au visiteur
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await supabase
        .from('profiles')
        .select(`
      id, boutique_name, boutique_slug, boutique_description,
      logo_url, banner_url, boutique_active,
      shop_phone, shop_whatsapp, shop_facebook, shop_instagram,
      shop_hours, shop_is_open,
      trust_badge, verified_seller, note, nb_avis, created_at
    `)
        .eq('boutique_slug', slug)
        .eq('boutique_active', true)
        .maybeSingle()

    if (!profile) notFound()

    const { data: sub } = await supabase
        .from('seller_subscriptions')
        .select('plan, expires_at')
        .eq('seller_id', profile.id)
        .maybeSingle()

    const isPro = Boolean(
        sub &&
        ['pro', 'pro_trial', 'business'].includes(sub.plan) &&
        (!sub.expires_at || new Date(sub.expires_at) > new Date())
    )

    const { data: listings } = await supabase
        .from('ads')
        .select('id, title, price, images, city, created_at, category_id')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    // Lecture des stats boutique via service role (sécurisé côté serveur uniquement)
    const { count: totalViews } = await adminSupabase
        .from('shop_analytics')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', profile.id)
        .eq('event', 'shop_view')

    return (
        <BoutiqueClient
            profile={profile as any}
            isPro={isPro}
            listings={(listings ?? []) as any}
            totalViews={totalViews ?? 0}
            shopHours={profile.shop_hours}
        />
    )
}
