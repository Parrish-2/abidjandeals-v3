import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { seller_id, event, listing_id } = await req.json()

  if (!seller_id || !event) {
    return NextResponse.json({ ok: false, error: 'seller_id et event requis' }, { status: 400 })
  }

  const validEvents = ['shop_view', 'wa_click', 'tel_click', 'listing_view']
  if (!validEvents.includes(event)) {
    return NextResponse.json({ ok: false, error: 'event invalide' }, { status: 400 })
  }

  const { error } = await supabase
    .from('shop_analytics')
    .insert({ seller_id, event, listing_id: listing_id ?? null })

  if (error) {
    console.error('Erreur insertion shop_analytics:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
