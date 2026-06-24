import { createSupabaseServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

const GENIUSPAY_BASE = 'https://geniuspay.ci/api/v1/merchant'
const PRO_PRICE_FCFA = 5000 // Modifiable selon le plan tarifaire Kivoo

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServer()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const userId = session.user.id
        const userEmail = session.user.email ?? ''

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

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.kivoo.ci'

        // Créer le paiement via GeniusPay (mode checkout — le client choisit son moyen de paiement)
        const gpResponse = await fetch(`${GENIUSPAY_BASE}/payments`, {
            method: 'POST',
            headers: {
                'X-API-Key': process.env.GENIUSPAY_PUBLIC_KEY!,
                'X-API-Secret': process.env.GENIUSPAY_SECRET_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: PRO_PRICE_FCFA,
                description: 'Abonnement Pro Kivoo — 30 jours',
                customer: {
                    name: customerName,
                    email: userEmail,
                    phone: customerPhone,
                    country: 'CI',
                },
                success_url: `${siteUrl}/dashboard?subscription=success`,
                error_url: `${siteUrl}/dashboard?subscription=error`,
                metadata: {
                    seller_id: userId,
                    plan: 'pro',
                    source: 'kivoo_dashboard',
                },
            }),
        })

        if (!gpResponse.ok) {
            const err = await gpResponse.json().catch(() => ({}))
            console.error('GeniusPay error:', err)
            return NextResponse.json({ error: 'Erreur création paiement GeniusPay' }, { status: 500 })
        }

        const gpData = await gpResponse.json()
        const checkoutUrl = gpData.data?.checkout_url ?? gpData.data?.payment_url

        if (!checkoutUrl) {
            console.error('GeniusPay: URL de checkout manquante', gpData)
            return NextResponse.json({ error: 'URL de paiement non reçue' }, { status: 500 })
        }

        return NextResponse.json({
            checkout_url: checkoutUrl,
            reference: gpData.data?.reference,
        })
    } catch (e) {
        console.error('subscribe route error:', e)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
