// src/app/api/auth/verify-phone/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { rateLimitStrict, getIP } from '@/lib/ratelimit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const ip = getIP(req)
  const { success, limit, remaining, reset } = await rateLimitStrict.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans une minute.' },
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

  // 2. Vérifier session utilisateur
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

  // 3. Parser le body
  let body: { action?: string; phone?: string; token?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const { action, phone, token } = body

  // ── ACTION : SEND ────────────────────────────────────────────
  if (action === 'send') {
    if (!phone) {
      return NextResponse.json({ error: 'Numéro requis' }, { status: 400 })
    }

    const normalized = normalizePhone(phone)
    if (!normalized) {
      return NextResponse.json(
        { error: 'Numéro ivoirien invalide (ex: +225 07 00 00 00 00)' },
        { status: 400 }
      )
    }

    // Vérifier que ce numéro n'est pas déjà utilisé par un autre compte
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('tel', normalized)
      .neq('id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Ce numéro est déjà associé à un autre compte.' },
        { status: 409 }
      )
    }

    // ✅ FIX : signInWithOtp directement sur le client admin
    // generateLink ne supporte pas phone_change dans cette version du SDK
    const { error: smsError } = await supabaseAdmin.auth.signInWithOtp({
      phone: normalized,
    })

    if (smsError) {
      console.error('[verify-phone] OTP send error:', smsError.message)
      return NextResponse.json(
        { error: "Impossible d'envoyer le SMS. Vérifiez votre numéro." },
        { status: 502 }
      )
    }

    // Sauvegarder le numéro en attente de vérification
    await supabaseAdmin
      .from('profiles')
      .update({ tel_pending: normalized })
      .eq('id', user.id)

    return NextResponse.json({ sent: true, phone: normalized })
  }

  // ── ACTION : VERIFY ──────────────────────────────────────────
  if (action === 'verify') {
    if (!phone || !token) {
      return NextResponse.json({ error: 'Numéro et code requis' }, { status: 400 })
    }

    const normalized = normalizePhone(phone)
    if (!normalized) {
      return NextResponse.json({ error: 'Numéro invalide' }, { status: 400 })
    }

    // Vérifier l'OTP via Supabase
    const supabaseBrowser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: verifyError } = await supabaseBrowser.auth.verifyOtp({
      phone: normalized,
      token,
      type: 'sms',
    })

    if (verifyError) {
      return NextResponse.json(
        { error: 'Code incorrect ou expiré. Réessayez.' },
        { status: 400 }
      )
    }

    // ✅ OTP valide — marquer le téléphone comme vérifié dans profiles
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        tel:             normalized,
        tel_verified:    true,
        tel_verified_at: new Date().toISOString(),
        tel_pending:     null,
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Erreur mise à jour profil' }, { status: 500 })
    }

    return NextResponse.json({ verified: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}

// ── Helper : normalise un numéro ivoirien ────────────────────
function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-\(\)\.]/g, '')

  // Déjà au format international +225XXXXXXXXXX
  if (/^\+225\d{10}$/.test(cleaned)) return cleaned

  // Format local 10 chiffres : 0XXXXXXXXX
  if (/^0[0-9]{9}$/.test(cleaned)) return `+225${cleaned}`

  // Format 8 chiffres sans indicatif
  if (/^[0-9]{8}$/.test(cleaned)) return `+22507${cleaned}`

  return null
}