import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get('X-Webhook-Signature') ?? ''
        const timestamp = req.headers.get('X-Webhook-Timestamp') ?? ''
        const event = req.headers.get('X-Webhook-Event') ?? ''

        const rawBody = await req.text()

        // ── 1. Vérifier la signature HMAC-SHA256 ──────────────────────────────────
        const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET
        if (!webhookSecret) {
            console.error('GENIUSPAY_WEBHOOK_SECRET manquant')
            return NextResponse.json({ error: 'Config error' }, { status: 500 })
        }

        const dataToVerify = `${timestamp}.${rawBody}`
        const expectedSig = crypto
            .createHmac('sha256', webhookSecret)
            .update(dataToVerify)
            .digest('hex')

        try {
            const sigOk = crypto.timingSafeEqual(
                Buffer.from(signature, 'hex'),
                Buffer.from(expectedSig, 'hex')
            )
            if (!sigOk) {
                console.warn('Webhook GeniusPay: signature invalide')
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }
        } catch {
            console.warn('Webhook GeniusPay: signature invalide (format)')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // ── 2. Protection replay attack (5 minutes) ───────────────────────────────
        const tsInt = parseInt(timestamp, 10)
        if (isNaN(tsInt) || Math.abs(Date.now() / 1000 - tsInt) > 300) {
            console.warn('Webhook GeniusPay: timestamp trop ancien')
            return NextResponse.json({ error: 'Timestamp invalide' }, { status: 400 })
        }

        // ── 3. Traiter uniquement les paiements réussis ───────────────────────────
        if (event !== 'payment.success') {
            console.log(`Webhook GeniusPay ignoré: ${event}`)
            return NextResponse.json({ received: true })
        }

        const payload = JSON.parse(rawBody)
        const txData = payload.data ?? {}
        const metadata = txData.metadata ?? {}

        if (txData.status !== 'completed') {
            return NextResponse.json({ received: true })
        }

        // Service role — jamais exposé côté client
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // ── 4a. BOOST — metadata contient ad_id ───────────────────────────────────
        if (metadata.ad_id) {
            const adId = metadata.ad_id
            const boostLevel = metadata.boost_level  // STANDARD | PREMIUM | URGENT
            const boostDays = parseInt(metadata.boost_days ?? '7', 10)

            if (!adId || !boostLevel) {
                console.error('Webhook boost: ad_id ou boost_level manquant', metadata)
                return NextResponse.json({ error: 'Métadonnées boost manquantes' }, { status: 400 })
            }

            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + boostDays)

            const { error } = await adminSupabase
                .from('ads')
                .update({
                    boostLevel,
                    is_boosted: true,
                    boost_expires_at: expiresAt.toISOString(),
                })
                .eq('id', adId)

            if (error) {
                console.error('Webhook boost: erreur update ads', error)
                return NextResponse.json({ error: 'Erreur BDD boost' }, { status: 500 })
            }

            console.log(`✅ Boost ${boostLevel} activé — annonce ${adId} — expire ${expiresAt.toISOString()}`)
            return NextResponse.json({ received: true, status: 'boost_activated' })
        }

        // ── 4b. ABONNEMENT PRO — metadata contient seller_id ─────────────────────
        if (metadata.seller_id) {
            const sellerId = metadata.seller_id
            const plan = metadata.plan ?? 'pro'

            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 30)

            const { error } = await adminSupabase
                .from('seller_subscriptions')
                .upsert(
                    { seller_id: sellerId, plan, expires_at: expiresAt.toISOString() },
                    { onConflict: 'seller_id' }
                )

            if (error) {
                console.error('Webhook abonnement: erreur upsert seller_subscriptions', error)
                return NextResponse.json({ error: 'Erreur BDD abonnement' }, { status: 500 })
            }

            console.log(`✅ Abonnement ${plan} activé — seller ${sellerId} — expire ${expiresAt.toISOString()}`)
            return NextResponse.json({ received: true, status: 'subscription_activated' })
        }

        // Métadonnées inconnues
        console.warn('Webhook GeniusPay: métadonnées non reconnues', metadata)
        return NextResponse.json({ received: true })

    } catch (e) {
        console.error('Webhook GeniusPay: erreur inattendue', e)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
