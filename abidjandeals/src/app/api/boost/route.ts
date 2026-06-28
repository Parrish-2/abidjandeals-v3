import { createSupabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

const GENIUSPAY_API_URL = "https://api.geniuspay.ci/v1/payment/initialize";

const BOOST_PLANS: Record<string, { label: string; price: number; days: number }> = {
  urgent: { label: "Boost Urgent", price: 2500, days: 7 },
  top: { label: "Boost Top Annonce", price: 7000, days: 15 },
  vedette: { label: "Boost Vedette", price: 20000, days: 30 },
};

export async function POST(req: NextRequest) {
  try {
    const { adId, boostType } = await req.json();

    if (!adId || !boostType || !BOOST_PLANS[boostType]) {
      return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    // Vérifier que l'annonce appartient à l'utilisateur
    const { data: ad, error: adError } = await supabase
      .from("ads")
      .select("id, title, user_id")
      .eq("id", adId)
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    }

    if (ad.user_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const plan = BOOST_PLANS[boostType];
    const transactionId = `boost_${adId}_${boostType}_${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/annonces/${adId}?boost=success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/annonces/${adId}?boost=cancel`;

    // Initialiser le paiement GeniusPay
    const gpRes = await fetch(GENIUSPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GENIUSPAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount: plan.price,
        currency: "XOF",
        description: `${plan.label} — ${ad.title}`,
        transaction_id: transactionId,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        metadata: {
          type: "boost",
          ad_id: adId,
          user_id: user.id,
          boost_type: boostType,
          boost_days: plan.days,
        },
      }),
    });

    const gpData = await gpRes.json();

    if (!gpRes.ok || !gpData.payment_url) {
      console.error("[boost] GeniusPay error:", gpData);
      return NextResponse.json(
        { error: gpData.message ?? "Erreur GeniusPay." },
        { status: 502 }
      );
    }

    return NextResponse.json({ paymentUrl: gpData.payment_url });
  } catch (err) {
    console.error("[boost] Unexpected error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
