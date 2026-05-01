// src/app/api/report-fraud/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { rateLimitStrict, getIP } from '@/lib/ratelimit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // ✅ 1. Rate limiting — 5 req/min par IP
  const ip = getIP(req)
  const { success, limit, remaining, reset } = await rateLimitStrict.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de signalements. Réessayez dans une minute.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit':     String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset':     String(reset),
          'Retry-After':           '60',
        },
      }
    )
  }

  // ✅ 2. Vérifier la session — reporter_id depuis la session, pas du body
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

  const { reported_user_id, reason, evidence_url } = await req.json()
  const reporter_id = user.id // ✅ forgerie impossible

  if (!reported_user_id || !reason) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  if (reporter_id === reported_user_id) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas vous signaler vous-même.' },
      { status: 400 }
    )
  }

  // ✅ 3. Anti-doublon — 1 signalement actif par paire reporter/reported
  const { data: existing } = await supabaseAdmin
    .from('fraud_reports')
    .select('id')
    .eq('reporter_id', reporter_id)
    .eq('reported_user_id', reported_user_id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'Vous avez déjà un signalement en cours pour cet utilisateur.' },
      { status: 409 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('fraud_reports')
    .insert({ reporter_id, reported_user_id, reason, evidence_url })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    report_id: data.id,
    message: 'Signalement enregistré. Notre équipe examinera dans 24h.',
  }, { status: 201 })
}
