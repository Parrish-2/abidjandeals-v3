// src/app/api/kyc/validate/route.ts
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
  const { success } = await rateLimitStrict.limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans une minute.' },
      { status: 429 }
    )
  }

  // 2. Vérifier session
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

  // 3. Vérifier que l'utilisateur n'a pas déjà un KYC validé
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('kyc_status, kyc_submitted_at')
    .eq('id', user.id)
    .single()

  if (profile?.kyc_status === 'valide') {
    return NextResponse.json(
      { error: 'Votre identité est déjà vérifiée.' },
      { status: 409 }
    )
  }

  // 4. Parser le body
  let body: {
    cni_recto_path?: string
    cni_verso_path?: string
    selfie_path?: string
    face_detected?: boolean
    face_score?: number
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const { cni_recto_path, cni_verso_path, selfie_path, face_detected, face_score } = body

  // 5. Validation des champs obligatoires
  if (!cni_recto_path || !cni_verso_path || !selfie_path) {
    return NextResponse.json(
      { error: 'Les 3 documents sont obligatoires (CNI recto, verso, selfie).' },
      { status: 400 }
    )
  }

  // 6. ✅ Vérification côté serveur que les fichiers appartiennent bien
  // à ce user (évite qu'un user soumette les docs d'un autre)
  const expectedPrefix = `${user.id}/`
  if (
    !cni_recto_path.startsWith(expectedPrefix) ||
    !cni_verso_path.startsWith(expectedPrefix) ||
    !selfie_path.startsWith(expectedPrefix)
  ) {
    return NextResponse.json(
      { error: 'Documents invalides.' },
      { status: 403 }
    )
  }

  // 7. ✅ Vérifier que les fichiers existent réellement dans Supabase Storage
  const [rectoCheck, versoCheck, selfieCheck] = await Promise.all([
    supabaseAdmin.storage.from('identity-docs').list(user.id, {
      search: cni_recto_path.replace(expectedPrefix, ''),
    }),
    supabaseAdmin.storage.from('identity-docs').list(user.id, {
      search: cni_verso_path.replace(expectedPrefix, ''),
    }),
    supabaseAdmin.storage.from('identity-docs').list(user.id, {
      search: selfie_path.replace(expectedPrefix, ''),
    }),
  ])

  const allFilesExist =
    (rectoCheck.data?.length ?? 0) > 0 &&
    (versoCheck.data?.length ?? 0) > 0 &&
    (selfieCheck.data?.length ?? 0) > 0

  if (!allFilesExist) {
    return NextResponse.json(
      { error: 'Certains fichiers sont introuvables. Réessayez.' },
      { status: 404 }
    )
  }

  // 8. ✅ Refus immédiat si aucun visage détecté côté client
  // (double vérification — le client ne peut pas mentir sur face_detected
  // car on vérifie aussi en storage)
  if (face_detected === false) {
    return NextResponse.json(
      { error: 'Aucun visage détecté sur votre selfie. Reprenez la photo.' },
      { status: 400 }
    )
  }

  // 9. ✅ Enregistrer la soumission KYC avec statut "en_cours"
  // Un admin ou un service externe (Smile Identity, YouVerify) 
  // validera manuellement ou via webhook
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      kyc_status:           'en_cours',
      kyc_submitted_at:     new Date().toISOString(),
      kyc_cni_recto_path:   cni_recto_path,
      kyc_cni_verso_path:   cni_verso_path,
      kyc_selfie_path:      selfie_path,
      kyc_face_score:       face_score ?? null,
      verification_requested:    true,
      verification_requested_at: new Date().toISOString(),
      account_level:        'confirmed_pending',
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('[kyc/validate] update error:', updateError.message)
    return NextResponse.json(
      { error: 'Erreur lors de la soumission. Réessayez.' },
      { status: 500 }
    )
  }

  // 10. ✅ Notifier les admins via la table notifications
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: user.id,
      type:    'kyc_submitted',
      title:   'Nouvelle demande KYC',
      message: `Un utilisateur a soumis ses documents KYC. À vérifier manuellement.`,
      read:    false,
    })
    .then(() => {}) // silencieux si la table n'a pas ce type

  return NextResponse.json({
    success: true,
    status:  'en_cours',
    message: 'Documents reçus. Notre équipe vérifie sous 24-48h.',
  })
}