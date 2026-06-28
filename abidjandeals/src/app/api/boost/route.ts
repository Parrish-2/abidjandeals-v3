import { createSupabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

const GENIUSPAY_BASE = "https://geniuspay.ci/api/v1/merchant";

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
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const user = session.user;

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("nom, prenom, shop_phone")
      .eq("id", user.id)
      .single();

    const customerName = profile
      ? `${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim() || "Client Kivoo"
      : "Client Kivoo";
    const customerPhone = profile?.shop_phone ?? "";

    const plan = BOOST_PLANS[boostType];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kivoo.ci";

    const gpRes = await fetch(`${GENIUSPAY_BASE}/payments`, {
      method: "POST",
      headers: {
        "X-API-Key": process.env.GENIUSPAY_PUBLIC_KEY!,
        "X-API-Secret": process.env.GENIUSPAY_SECRET_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: plan.price,
        description: `${plan.label} — ${ad.title}`,
        customer: {
          name: customerName,
          email: user.email ?? "",
          phone: customerPhone,
          country: "CI",
        },
        success_url: `${siteUrl}/ad/${adId}?boost=success`,
        error_url: `${siteUrl}/ad/${adId}?boost=error`,
        metadata: {
          type: "boost",
          ad_id: adId,
          user_id: user.id,
          boost_type: boostType,
          boost_days: plan.days,
        },
      }),
    });

    if (!gpRes.ok) {
      const err = await gpRes.json().catch(() => ({}));
      console.error("[boost] GeniusPay error:", JSON.stringify(err));
      return NextResponse.json({ error: "Erreur création paiement GeniusPay." }, { status: 500 });
    }

    const gpData = await gpRes.json();
    const checkoutUrl = gpData.data?.checkout_url ?? gpData.data?.payment_url;

    if (!checkoutUrl) {
      console.error("[boost] URL checkout manquante:", JSON.stringify(gpData));
      return NextResponse.json({ error: "URL de paiement non reçue." }, { status: 500 });
    }

    return NextResponse.json({ paymentUrl: checkoutUrl });
  } catch (err) {
    console.error("[boost] Unexpected error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
