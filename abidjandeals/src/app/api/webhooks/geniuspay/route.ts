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

        // Comparaison sécurisée (protection timing attack)
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
            console.warn('Webhook GeniusPay: timestamp trop ancien', timestamp)
            return NextResponse.json({ error: 'Timestamp invalide' }, { status: 400 })
        }

        // ── 3. Traiter l'événement ────────────────────────────────────────────────
        const payload = JSON.parse(rawBody)

        // On ne traite que les paiements réussis
        if (event !== 'payment.success') {
            console.log(`Webhook GeniusPay ignoré: ${event}`)
            return NextResponse.json({ received: true })
        }

        const txData = payload.data ?? {}
        const metadata = txData.metadata ?? {}

        if (txData.status !== 'completed') {
            return NextResponse.json({ received: true })
        }

        const sellerId = metadata.seller_id
        const plan = metadata.plan ?? 'pro'

        if (!sellerId) {
            console.error('Webhook GeniusPay: seller_id manquant dans metadata', metadata)
            return NextResponse.json({ error: 'seller_id manquant' }, { status: 400 })
        }

        // ── 4. Activer l'abonnement dans Supabase (service role) ─────────────────
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 jours

        const { error } = await adminSupabase
            .from('seller_subscriptions')
            .upsert(
                {
                    seller_id: sellerId,
                    plan,
                    expires_at: expiresAt.toISOString(),
                },
                { onConflict: 'seller_id' }
            )

        if (error) {
            console.error('Webhook GeniusPay: erreur upsert seller_subscriptions', error)
            return NextResponse.json({ error: 'Erreur BDD' }, { status: 500 })
        }

        console.log(`✅ Abonnement ${plan} activé — seller ${sellerId} — expire ${expiresAt.toISOString()}`)
        return NextResponse.json({ received: true, status: 'processed' })

    } catch (e) {
        console.error('Webhook GeniusPay: erreur inattendue', e)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
