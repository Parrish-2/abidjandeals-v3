// src/app/api/admin/vendors/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') ?? 'all'

  let query = supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter === 'requested') {
    query = query.eq('verification_requested', true).eq('verified_seller', false)
  } else if (filter === 'verified') {
    query = query.eq('verified_seller', true)
  } else if (filter === 'boutiques') {
    query = query.eq('boutique_active', true)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: 'Erreur de chargement' }, { status: 500 })
  }

  return NextResponse.json({ vendors: data })
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { action, vendorId } = await req.json()

  if (!action || !vendorId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const { data: vendor, error: fetchErr } = await supabaseAdmin
    .from('profiles')
    .select('id, level, trust_badge, boutique_active, verified_seller, verification_requested, prenom')
    .eq('id', vendorId)
    .single()

  if (fetchErr || !vendor) {
    return NextResponse.json({ error: 'Vendeur introuvable' }, { status: 404 })
  }

  const LEVEL_NEXT: Record<string, { level: string; account_level: string } | null> = {
    basic:     { level: 'confirmed', account_level: 'confirmed' },
    confirmed: { level: 'certified', account_level: 'certified' },
    certified: null,
  }

  switch (action) {

    case 'approve_verification': {
      const next = LEVEL_NEXT[vendor.level]
      const nextLevel   = next?.level        ?? vendor.level
      const nextAccount = next?.account_level ?? 'confirmed'

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          verified_seller:        true,
          verified_seller_at:     new Date().toISOString(),
          level:                  nextLevel,
          account_level:          nextAccount,
          is_verified:            true,
          verification_requested: false,
        })
        .eq('id', vendorId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, nextLevel })
    }

    case 'reject_verification': {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ verification_requested: false })
        .eq('id', vendorId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    case 'toggle_trust_badge': {
      const newValue = !vendor.trust_badge
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ trust_badge: newValue })
        .eq('id', vendorId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, trust_badge: newValue })
    }

    case 'upgrade_level': {
      const next = LEVEL_NEXT[vendor.level]
      if (!next) {
        return NextResponse.json({ error: 'Niveau maximum atteint' }, { status: 400 })
      }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ level: next.level, account_level: next.account_level, is_verified: true })
        .eq('id', vendorId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, level: next.level, account_level: next.account_level })
    }

    case 'toggle_boutique': {
      const newValue = !vendor.boutique_active
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ boutique_active: newValue })
        .eq('id', vendorId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, boutique_active: newValue })
    }

    default:
      return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  }
}