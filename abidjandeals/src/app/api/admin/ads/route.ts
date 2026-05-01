import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// ─── Client admin (service role) — bypass RLS ─────────────────────────────────
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Récupère l'utilisateur authentifié de façon robuste ─────────────────────
async function getAuthUser() {
  try {
    const cookieStore = await cookies()

    // Méthode 1 : via SSR client (préféré)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set() { },
          remove() { },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) return user

    // Méthode 2 : fallback via token Bearer dans Authorization header
    return null
  } catch {
    return null
  }
}

// ─── Vérifie si admin/modérateur ou propriétaire de l'annonce ────────────────
async function isAdminOrOwner(userId: string, adId: string): Promise<boolean> {
  // Vérif rôle admin
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role, account_level')
    .eq('id', userId)
    .single()

  if (
    profile?.role === 'admin' ||
    profile?.role === 'moderator' ||
    profile?.account_level === 'admin'
  ) return true

  // Vérif propriétaire
  const { data: ad } = await adminSupabase
    .from('ads')
    .select('user_id')
    .eq('id', adId)
    .single()

  return ad?.user_id === userId
}

// ─── PATCH — Modifier le statut d'une annonce ─────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    // Auth : d'abord via cookies, sinon via token Authorization
    let userId: string | null = null

    const user = await getAuthUser()
    if (user) {
      userId = user.id
    } else {
      // Fallback : token Bearer (utile si l'appel vient d'un contexte sans cookies)
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        const { data: { user: tokenUser } } = await adminSupabase.auth.getUser(token)
        if (tokenUser) userId = tokenUser.id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { id, status, ...extraFields } = body

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    // Si on passe un status, le valider
    if (status) {
      const validStatuses = ['active', 'rejected', 'pending', 'sold', 'archived']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Status invalide: ${status}` }, { status: 400 })
      }
    }

    const allowed = await isAdminOrOwner(userId, id)
    if (!allowed) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Construit le payload de mise à jour
    const updatePayload: Record<string, unknown> = {}
    if (status) updatePayload.status = status

    // Permet de passer des champs supplémentaires (titre, prix, etc.)
    const allowedFields = [
      'title', 'description', 'price', 'city', 'quartier',
      'etat', 'marque', 'category_id', 'sub_category_id',
      'boost_level', 'boost_expires_at', 'images', 'video_url',
      'tel', 'whatsapp',
    ]
    for (const field of allowedFields) {
      if (field in extraFields) {
        updatePayload[field] = extraFields[field]
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })
    }

    const { error } = await adminSupabase
      .from('ads')
      .update(updatePayload)
      .eq('id', id)

    if (error) {
      console.error('❌ PATCH ads error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('❌ PATCH /api/admin/ads exception:', err)
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 })
  }
}

// ─── DELETE — Supprimer une annonce ───────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    let userId: string | null = null

    const user = await getAuthUser()
    if (user) {
      userId = user.id
    } else {
      const authHeader = req.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        const { data: { user: tokenUser } } = await adminSupabase.auth.getUser(token)
        if (tokenUser) userId = tokenUser.id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id, images } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

    const allowed = await isAdminOrOwner(userId, id)
    if (!allowed) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Supprime les images du Storage
    if (images?.length) {
      const paths = images
        .map((url: string) => {
          // Extrait le path depuis l'URL publique Supabase
          const match = url.match(/\/storage\/v1\/object\/public\/ad-photos\/(.+)$/)
            ?? url.match(/ad-photos\/(.+)$/)
          return match?.[1] ?? null
        })
        .filter(Boolean) as string[]

      if (paths.length) {
        const { error: storageError } = await adminSupabase
          .storage
          .from('ad-photos')
          .remove(paths)
        if (storageError) {
          console.warn('⚠️ Storage delete warning:', storageError.message)
          // On continue quand même — la suppression de l'annonce reste prioritaire
        }
      }
    }

    // Supprime l'annonce
    const { error } = await adminSupabase.from('ads').delete().eq('id', id)
    if (error) {
      console.error('❌ DELETE ads error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('❌ DELETE /api/admin/ads exception:', err)
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 })
  }
}

// ─── GET — Récupérer les annonces (optionnel, pour debug) ────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.json({ error: 'Accès réservé aux admins' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, error } = await adminSupabase
      .from('ads')
      .select(`
        id, title, price, city, category_id, images,
        status, created_at, user_id,
        profiles(prenom, nom, email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })

  } catch (err) {
    console.error('❌ GET /api/admin/ads exception:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
