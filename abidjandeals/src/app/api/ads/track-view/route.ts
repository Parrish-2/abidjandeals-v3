import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    let adId: string | undefined
    try {
        const body = await req.json()
        adId = body?.adId
    } catch {
        return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
    }
    if (!adId) return NextResponse.json({ error: 'adId requis' }, { status: 400 })

    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminSupabase.rpc('increment_ad_view', { ad_id: adId })

    if (error) {
        console.error('[track-view]', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
