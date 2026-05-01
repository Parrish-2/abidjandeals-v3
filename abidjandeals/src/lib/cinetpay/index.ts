// src/lib/cinetpay/index.ts
// Wrapper vers /api/boost — aucune clé sensible ici

export type InitPaymentParams = {
  adId:      string
  userId:    string  // conservé pour compatibilité BoostModal — ignoré côté serveur
  boostType: string
  amount:    number  // conservé pour compatibilité BoostModal — ignoré côté serveur
  phone:     string
  operator:  string
}

export type InitPaymentResult =
  | { success: true;  paymentUrl: string; paymentId: string }
  | { success: false; error: string }

export async function initCinetPayPayment(
  params: InitPaymentParams
): Promise<InitPaymentResult> {
  try {
    // ✅ userId et amount retirés du body
    // Le serveur détermine user_id depuis la session et le prix depuis boostType
    const res = await fetch('/api/boost', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adId:      params.adId,
        boostType: params.boostType,
        phone:     params.phone,
        operator:  params.operator,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.error ?? 'Erreur serveur' }
    }

    return {
      success:    true,
      paymentUrl: data.paymentUrl,
      paymentId:  data.paymentId,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inattendue',
    }
  }
}

export async function checkPaymentStatus(
  paymentId: string
): Promise<'pending' | 'completed' | 'failed'> {
  const { createBrowserClient } = await import('@supabase/ssr')
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('payments')
    .select('status')
    .eq('id', paymentId)
    .single()

  return (data?.status as 'pending' | 'completed' | 'failed') ?? 'pending'
}
