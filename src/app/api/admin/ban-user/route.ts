// src/app/api/admin/ban-user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { rateLimitStrict, getIP } from '@/lib/ratelimit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function requireAdmin(req: NextRequest) {
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

  const { data: { user }, error } = await supabaseAuth.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null
  return user
}

export async function POST(req: NextRequest) {
  // ✅ 1. Rate limiting Redis
  const ip = getIP(req)
  const { success, limit, remaining, reset } = await rateLimitStrict.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
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

  // ✅ 2. Vérification admin via session
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // ✅ 3. Parse et validation du body
  let body: { user_id?: string; report_id?: string; admin_note?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const { user_id, report_id, admin_note } = body

  if (!user_id || !admin_note) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  // ✅ 4. Empêcher un admin de se bannir lui-même
  if (user_id === admin.id) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas vous bannir vous-même.' },
      { status: 400 }
    )
  }

  // ✅ 5. FIX CRITIQUE : lecture depuis 'profiles' (pas 'users' qui n'existe pas)
  const { data: targetProfile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, role')
    .eq('id', user_id)
    .single()

  if (fetchError || !targetProfile) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  // ✅ 6. Empêcher de bannir un autre admin
  if (targetProfile.role === 'admin') {
    return NextResponse.json(
      { error: 'Impossible de bannir un administrateur.' },
      { status: 403 }
    )
  }

  // ✅ 7. Ban dans la table profiles
  const { error: banError } = await supabaseAdmin
    .from('profiles')
    .update({
      role:          'banned',
      banned_reason: admin_note,
      banned_by:     admin.id,
      banned_at:     new Date().toISOString(),
      updated_at:    new Date().toISOString(),
    })
    .eq('id', user_id)

  if (banError) {
    // Colonnes banned_* peut-être absentes — fallback minimal
    const { error: fallbackError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'banned', updated_at: new Date().toISOString() })
      .eq('id', user_id)

    if (fallbackError) {
      return NextResponse.json({ error: 'Erreur lors du ban' }, { status: 500 })
    }
  }

  // ✅ 8. Résoudre le rapport si fourni
  if (report_id) {
    await supabaseAdmin
      .from('reports')
      .update({
        status:      'resolved',
        admin_note,
        resolved_by: admin.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', report_id)
  }

  // ✅ 9. Blacklist optionnelle (si la table existe)
  await supabaseAdmin
    .from('blacklist')
    .upsert({
      banned_user_id: user_id,
      email:          targetProfile.email,
      reason:         admin_note,
      banned_by:      admin.id,
      created_at:     new Date().toISOString(),
    })
    .then(() => {}) // silencieux si la table n'existe pas encore

  return NextResponse.json({
    banned:  true,
    user_id,
    message: 'Utilisateur banni avec succès.',
  })
}