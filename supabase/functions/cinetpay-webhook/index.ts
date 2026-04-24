// supabase/functions/cinetpay-webhook/index.ts
// Edge Function Supabase — Webhook CinetPay
// Déploiement : supabase functions deploy cinetpay-webhook
// URL à fournir à CinetPay : https://vhfdexmyfkueyhztgjws.supabase.co/functions/v1/cinetpay-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // ── 1. Lire le body ──────────────────────────────────────────────────────
    const body = await req.json()
    console.log('[cinetpay-webhook] Payload reçu:', JSON.stringify(body))

    const {
      cpm_trans_id,
      cpm_site_id,
      cpm_trans_status,
      cpm_amount,
      cpm_currency,
      cpm_custom,
      cpm_error_message,
    } = body

    // ── 2. Vérifier le Site ID ───────────────────────────────────────────────
    const CINETPAY_API_KEY = Deno.env.get('CINETPAY_API_KEY') ?? ''
    const CINETPAY_SITE_ID = Deno.env.get('CINETPAY_SITE_ID') ?? ''

    if (cpm_site_id !== CINETPAY_SITE_ID) {
      console.error('[cinetpay-webhook] Site ID invalide:', cpm_site_id)
      return new Response(
        JSON.stringify({ error: 'Site ID invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── 3. Vérifier le statut via l'API CinetPay ─────────────────────────────
    const verifyRes = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey:         CINETPAY_API_KEY,
        site_id:        CINETPAY_SITE_ID,
        transaction_id: cpm_trans_id,
      }),
    })

    const verifyData = await verifyRes.json()
    console.log('[cinetpay-webhook] Vérification CinetPay:', JSON.stringify(verifyData))

    const isSuccess = verifyData?.data?.status === 'ACCEPTED'
    const paymentId = cpm_custom

    // ── 4. Retrouver le paiement ─────────────────────────────────────────────
    const { data: payment, error: fetchErr } = await supabase
      .from('payments')
      .select('id, ad_id, boost_type, amount, user_id')
      .eq('id', paymentId)
      .single()

    if (fetchErr || !payment) {
      console.error('[cinetpay-webhook] Paiement introuvable:', paymentId)
      return new Response(
        JSON.stringify({ error: 'Paiement introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── 5. Traitement selon statut ───────────────────────────────────────────
    if (isSuccess) {

      // Durées par type de boost
      const BOOST_DURATIONS: Record<string, number> = {
        urgent:  7,
        top:     7,
        vedette: 15,
      }
      const duration = BOOST_DURATIONS[payment.boost_type] ?? 7
      const boostExpiry = new Date()
      boostExpiry.setDate(boostExpiry.getDate() + duration)

      // Mettre à jour payments
      await supabase
        .from('payments')
        .update({ status: 'completed', cinetpay_ref: cpm_trans_id })
        .eq('id', paymentId)

      // Activer le boost sur l'annonce
      const { error: adErr } = await supabase
        .from('ads')
        .update({
          is_boosted:     true,
          boost_type:     payment.boost_type,
          boost_expiry:   boostExpiry.toISOString(),
          payment_status: 'paid',
        })
        .eq('id', payment.ad_id)

      if (adErr) {
        console.error('[cinetpay-webhook] Erreur activation boost:', adErr.message)
      } else {
        console.log(`[cinetpay-webhook] ✅ Boost activé — annonce ${payment.ad_id}`)
      }

      // ── 6. Récupérer le profil vendeur pour l'email ──────────────────────
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, prenom, nom')
        .eq('id', payment.user_id)
        .single()

      // ── 7. Envoyer l'email via Resend ────────────────────────────────────
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''

      if (profile?.email && RESEND_API_KEY) {
        const boostLabels: Record<string, string> = {
          urgent:  '🔴 Urgent',
          top:     '⚡ Top de Liste',
          vedette: '⭐ Vedette',
        }
        const boostLabel = boostLabels[payment.boost_type] ?? payment.boost_type
        const expiryDate = boostExpiry.toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
        const prenom = profile.prenom ?? 'cher vendeur'

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'AbidjanDeals <noreply@abidjandeals.ci>',
            to:   [profile.email],
            subject: '🚀 Votre annonce est maintenant boostée !',
            html: `
              <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">

                <!-- Header -->
                <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 28px; text-align: center;">
                  <div style="font-size: 40px; margin-bottom: 8px;">⚡</div>
                  <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">Annonce boostée !</h1>
                  <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Votre paiement a bien été reçu</p>
                </div>

                <!-- Body -->
                <div style="padding: 28px;">
                  <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">
                    Bonjour <strong>${prenom}</strong> 👋
                  </p>
                  <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    Votre paiement de <strong style="color: #f97316;">${payment.amount?.toLocaleString('fr')} FCFA</strong> a été confirmé.
                    Votre annonce bénéficie maintenant du pack <strong>${boostLabel}</strong>.
                  </p>

                  <!-- Info box -->
                  <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Détails du boost</p>
                    <p style="margin: 0 0 6px; font-size: 14px; color: #111827;">📦 Pack : <strong>${boostLabel}</strong></p>
                    <p style="margin: 0 0 6px; font-size: 14px; color: #111827;">📅 Durée : <strong>${duration} jours</strong></p>
                    <p style="margin: 0;       font-size: 14px; color: #111827;">⏳ Expire le : <strong>${expiryDate}</strong></p>
                  </div>

                  <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
                    Merci de faire confiance à <strong style="color: #f97316;">AbidjanDeals</strong> 🇨🇮
                  </p>
                </div>

                <!-- Footer -->
                <div style="background: #f9fafb; padding: 16px 28px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                    AbidjanDeals · La marketplace de confiance en Côte d'Ivoire
                  </p>
                </div>
              </div>
            `,
          }),
        })

        if (!emailRes.ok) {
          const emailErr = await emailRes.text()
          console.error('[cinetpay-webhook] Erreur envoi email:', emailErr)
        } else {
          console.log(`[cinetpay-webhook] ✉️ Email envoyé à ${profile.email}`)
        }
      }

    } else {

      // ── Paiement échoué ──────────────────────────────────────────────────
      await supabase
        .from('payments')
        .update({
          status:        'failed',
          cinetpay_ref:  cpm_trans_id,
          error_message: cpm_error_message ?? 'Paiement refusé',
        })
        .eq('id', paymentId)

      // Log structuré pour le dashboard admin
      console.error(JSON.stringify({
        level:         'ALERT',
        type:          'PAYMENT_FAILED',
        payment_id:    paymentId,
        ad_id:         payment.ad_id,
        user_id:       payment.user_id,
        cinetpay_ref:  cpm_trans_id,
        error_message: cpm_error_message ?? 'Paiement refusé',
        timestamp:     new Date().toISOString(),
      }))

      console.log(`[cinetpay-webhook] ❌ Paiement refusé — ${paymentId}: ${cpm_error_message}`)
    }

    // ── 8. Répondre 200 à CinetPay ───────────────────────────────────────────
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('[cinetpay-webhook] Erreur inattendue:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
