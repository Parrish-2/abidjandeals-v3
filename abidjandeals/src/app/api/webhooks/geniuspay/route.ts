import { createSupabaseServer } from "@/lib/supabase-server";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const BOOST_PLANS: Record<string, { days: number }> = {
    urgent: { days: 7 },
    top: { days: 15 },
    vedette: { days: 30 },
};

function verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get("x-geniuspay-signature") ?? "";
    const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET ?? "";

    if (!verifySignature(rawBody, signature, webhookSecret)) {
        console.warn("[webhook] Signature invalide");
        return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    let event: {
        status: string;
        transaction_id: string;
        metadata?: {
            type?: string;
            // Abonnement
            user_id?: string;
            plan?: string;
            // Boost
            ad_id?: string;
            boost_type?: string;
            boost_days?: number;
        };
    };

    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    if (event.status !== "success") {
        return NextResponse.json({ received: true });
    }

    const meta = event.metadata ?? {};
    const supabase = await createSupabaseServer();

    // ── CAS 1 : BOOST ─────────────────────────────────────────────
    if (meta.type === "boost" && meta.ad_id && meta.boost_type) {
        const boostDays = meta.boost_days ?? BOOST_PLANS[meta.boost_type]?.days ?? 7;
        const expiresAt = new Date(Date.now() + boostDays * 86400000).toISOString();

        const { error } = await supabase
            .from("ads")
            .update({
                is_boosted: true,
                boost_expires_at: expiresAt,
                boost_type: meta.boost_type,
            })
            .eq("id", meta.ad_id);

        if (error) {
            console.error("[webhook] Erreur boost update:", error);
            return NextResponse.json({ error: "DB error" }, { status: 500 });
        }

        console.log(`[webhook] Boost activé — ad ${meta.ad_id} (${meta.boost_type}, ${boostDays}j)`);
        return NextResponse.json({ received: true });
    }

    // ── CAS 2 : ABONNEMENT PRO ────────────────────────────────────
    if (meta.type === "subscription" && meta.user_id && meta.plan) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 86400000).toISOString();

        const { error } = await supabase
            .from("seller_subscriptions")
            .upsert(
                {
                    user_id: meta.user_id,
                    plan: meta.plan,
                    status: "active",
                    started_at: now.toISOString(),
                    expires_at: expiresAt,
                    geniuspay_transaction_id: event.transaction_id,
                },
                { onConflict: "user_id" }
            );

        if (error) {
            console.error("[webhook] Erreur subscription upsert:", error);
            return NextResponse.json({ error: "DB error" }, { status: 500 });
        }

        console.log(`[webhook] Abonnement activé — user ${meta.user_id} (${meta.plan})`);
        return NextResponse.json({ received: true });
    }

    // Événement non géré — on répond OK pour éviter les retries
    console.log("[webhook] Événement ignoré:", meta.type, event.transaction_id);
    return NextResponse.json({ received: true });
}
