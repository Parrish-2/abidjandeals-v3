import { createSupabaseServer } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

const GENIUSPAY_BASE = 'https://geniuspay.ci/api/v1/merchant'

const BOOST_CONFIG: Record<string, { price: number; days: number; level: string; label: string }> = {
  urgent: { price: 2500, days: 7, level: 'STANDARD', label: 'Pack Urgent — 7 jours' },
  top: { price: 7000, days: 15, level: 'PREMIUM', label: 'Top Annonce — 15 jours' },
  vedette: { price: 20000, days: 30, level: 'URGENT', label: 'Pack Vedette — 30 jours' },
}

export async function POST(req: NextRequest) {
  try {
    const { adId, boostType } = await req.json()

    if (!adId || !boostType || !BOOST_CONFIG[boostType]) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email ?? ''
    const boost = BOOST_CONFIG[boostType]
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.kivoo.ci'

    // Récupérer le profil vendeur
    const { data: profile } = await supabase
      .from('profiles')
      .select('nom, prenom, shop_phone')
      .eq('id', userId)
      .single()

    const customerName = profile
      ? `${profile.prenom ?? ''} ${profile.nom ?? ''}`.trim() || 'Client Kivoo'
      : 'Client Kivoo'
    const customerPhone = profile?.shop_phone ?? ''

    // Créer le paiement GeniusPay
    const gpResponse = await fetch(`${GENIUSPAY_BASE}/payments`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.GENIUSPAY_PUBLIC_KEY!,
        'X-API-Secret': process.env.GENIUSPAY_SECRET_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: boost.price,
        description: `${boost.label} — Kivoo`,
        customer: {
          name: customerName,
          email: userEmail,
          phone: customerPhone,
          country: 'CI',
        },
        success_url: `${siteUrl}/ad/${adId}?boost=success`,
        error_url: `${siteUrl}/ad/${adId}?boost=error`,
        metadata: {
          ad_id: adId,
          user_id: userId,
          boost_type: boostType,
          boost_level: boost.level,
          boost_days: boost.days,
          source: 'kivoo_boost',
        },
      }),
    })

    if (!gpResponse.ok) {
      const err = await gpResponse.json().catch(() => ({}))
      console.error('GeniusPay boost error:', err)
      return NextResponse.json({ error: 'Erreur création paiement' }, { status: 500 })
    }

    const gpData = await gpResponse.json()
    const checkoutUrl = gpData.data?.checkout_url ?? gpData.data?.payment_url

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'URL de paiement non reçue' }, { status: 500 })
    }

    return NextResponse.json({
      checkout_url: checkoutUrl,
      reference: gpData.data?.reference,
    })
  } catch (e) {
    console.error('boost route error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
