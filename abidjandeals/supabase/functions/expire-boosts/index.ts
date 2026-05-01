// supabase/functions/expire-boosts/index.ts
// Edge Function Supabase — Expiration automatique des boosts
// Déploiement : supabase functions deploy expire-boosts
// Cron (via Supabase Dashboard > Edge Functions > Schedules) :
//   Expression : 0 * * * *   (toutes les heures)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Client avec service_role pour bypasser RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // ── 1. Expirer les boosts dépassés ──────────────────────────────────────
    const { data: expiredAds, error: expireError } = await supabase
      .from('ads')
      .update({
        is_boosted:     false,
        boost_type:     null,
        payment_status: null,
      })
      .eq('is_boosted', true)
      .lt('boost_expiry', new Date().toISOString())
      .select('id, title')

    if (expireError) {
      console.error('[expire-boosts] Erreur update:', expireError.message)
      return new Response(
        JSON.stringify({ error: expireError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const count = expiredAds?.length ?? 0
    console.log(`[expire-boosts] ${count} boost(s) expiré(s) à ${new Date().toISOString()}`)

    // ── 2. Expirer les paiements pending de plus de 24h (nettoyage) ─────────
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('status', 'pending')
      .lt('created_at', yesterday)

    if (paymentError) {
      console.warn('[expire-boosts] Nettoyage payments:', paymentError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_boosts: count,
        expired_ids: expiredAds?.map(a => a.id) ?? [],
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('[expire-boosts] Erreur inattendue:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
