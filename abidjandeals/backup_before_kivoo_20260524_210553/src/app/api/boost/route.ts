// src/app/api/boost/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Whitelist stricte — prix déterminés côté serveur uniquement
const ALLOWED_BOOSTS: Record<string, number> = {
  urgent:  2500,
  top:     7000,
  vedette: 20000,
}

const ALLOWED_OPERATORS = ['wave', 'orange', 'mtn', 'moov']

const OPERATOR_CODES: Record<string, string> = {
  wave:   'WAVE_CI',
  orange: 'ORANGE_MONEY_CI',
  mtn:    'MTN_MONEY_CI',
  moov:   'MOOV_MONEY_CI',
}

export async function POST(req: NextRequest) {

  // ✅ 1. Vérifier la session côté serveur
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // ✅ 2. Parser et valider les paramètres
  const { adId, boostType, phone, operator } = await req.json()

  if (!adId || !boostType || !phone || !operator) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  // ✅ 3. Montant déterminé par le serveur — jamais depuis le client
  const amount = ALLOWED_BOOSTS[boostType]
  if (!amount) {
    return NextResponse.json({ error: 'Type de boost invalide' }, { status: 400 })
  }

  if (!ALLOWED_OPERATORS.includes(operator)) {
    return NextResponse.json({ error: 'Opérateur invalide' }, { status: 400 })
  }

  // ✅ 4. Vérifier que l'annonce appartient à l'utilisateur connecté
  const { data: ad } = await supabaseAdmin
    .from('ads')
    .select('id, user_id, title')
    .eq('id', adId)
    .eq('user_id', user.id)
    .single()

  if (!ad) {
    return NextResponse.json(
      { error: 'Annonce introuvable ou non autorisée' },
      { status: 404 }
    )
  }

  // ✅ 5. Créer le paiement — user_id forcé depuis la session
  const { data: payment, error: dbErr } = await supabaseAdmin
    .from('payments')
    .insert({
      ad_id:      adId,
      user_id:    user.id,
      amount,
      currency:   'XOF',
      operator,
      phone,
      boost_type: boostType,
      status:     'pending',
    })
    .select('id')
    .single()

  if (dbErr || !payment) {
    return NextResponse.json({ error: 'Erreur création paiement' }, { status: 500 })
  }

  // ✅ 6. Clés CinetPay SANS préfixe NEXT_PUBLIC_ — jamais dans le bundle JS
  const apiKey  = process.env.CINETPAY_API_KEY
  const siteId  = process.env.CINETPAY_SITE_ID
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const webhook = process.env.CINETPAY_WEBHOOK_URL
    ?? 'https://vhfdexmyfkueyhztgjws.supabase.co/functions/v1/cinetpay-webhook'

  if (!apiKey || !siteId) {
    await supabaseAdmin.from('payments').delete().eq('id', payment.id)
    return NextResponse.json(
      { error: 'Configuration paiement manquante' },
      { status: 500 }
    )
  }

  const transactionId = `BOOST-${payment.id}-${Date.now()}`

  // ✅ 7. Appel CinetPay depuis le serveur
  const cinetpayRes = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey:                apiKey,
      site_id:               siteId,
      transaction_id:        transactionId,
      amount,
      currency:              'XOF',
      description:           `Boost AbidjanDeals - Pack ${boostType}`,
      customer_phone_number: `+225${phone}`,
      customer_name:         'Client AbidjanDeals',
      channels:              OPERATOR_CODES[operator],
      metadata:              payment.id,
      return_url:            `${appUrl}/dashboard?boost=success`,
      notify_url:            webhook,
      cancel_url:            `${appUrl}/dashboard?boost=cancelled`,
    }),
  })

  const data = await cinetpayRes.json()

  if (data.code !== '201') {
    await supabaseAdmin
      .from('payments')
      .update({ status: 'failed', error_message: data.message })
      .eq('id', payment.id)

    return NextResponse.json(
      { error: data.message ?? 'Erreur CinetPay' },
      { status: 502 }
    )
  }

  // ✅ 8. Sauvegarder la référence CinetPay
  await supabaseAdmin
    .from('payments')
    .update({ cinetpay_ref: transactionId })
    .eq('id', payment.id)

  return NextResponse.json({
    success:    true,
    paymentUrl: data.data.payment_url,
    paymentId:  payment.id,
  })
}
