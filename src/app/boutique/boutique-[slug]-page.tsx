// src/app/api/webhook-didit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimitWebhook, getIP } from '@/lib/ratelimit'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifySignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.DIDIT_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  // ✅ 1. Rate limiting — 20 req/min par IP (webhook externe)
  const ip = getIP(req)
  const { success } = await rateLimitWebhook.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  // ✅ 2. Vérification signature HMAC
  const rawBody   = await req.text()
  const signature = req.headers.get('x-didit-signature') || ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const { session_id, user_id, identity_auth_id, score, full_name } = payload

  // ✅ 3. Enregistrer la vérification KYC
  await supabase.from('kyc_verifications').insert({
    user_id,
    didit_session_id: session_id,
    score,
    raw_payload: payload,
    status: score > 0.95 ? 'approved' : score >= 0.75 ? 'manual_review' : 'rejected',
  })

  if (score > 0.95) {
    await supabase
      .from('users')
      .update({
        status:          'CONFIRMED',
        didit_auth_id:   identity_auth_id,
        kyc_score:       score,
        full_name,
        updated_at:      new Date().toISOString(),
      })
      .eq('id', user_id)

  } else if (score >= 0.75) {
    await supabase
      .from('users')
      .update({
        status:        'PENDING_ADMIN',
        didit_auth_id: identity_auth_id,
        kyc_score:     score,
        updated_at:    new Date().toISOString(),
      })
      .eq('id', user_id)

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/notify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ user_id, score, full_name }),
    })

  } else {
    await supabase
      .from('users')
      .update({ kyc_score: score, updated_at: new Date().toISOString() })
      .eq('id', user_id)
  }

  return NextResponse.json({ received: true })
}
