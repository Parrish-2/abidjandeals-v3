"use client";

// ============================================================
// FICHIER : src/components/boost/BoostCTA.tsx
// Adapté aux types existants : urgent / top / vedette
// + flow 3 étapes : Plan → Opérateur → Téléphone
// ============================================================

import { useState, useEffect } from "react";

interface BoostCTAProps {
  adId: string;
  adTitle: string;
  isBoosted?: boolean;
  boostExpiresAt?: string | null;
  userId?: string;
  adUserId?: string;
}

const BOOST_PLANS = [
  {
    id: "urgent",
    label: "Urgent",
    price: 2500,
    icon: "⚡",
    color: "#F5A623",
    perks: ["Badge Urgent", "3× plus de vues", "7 jours"],
  },
  {
    id: "top",
    label: "Top Annonce",
    price: 7000,
    icon: "🚀",
    color: "#E8490F",
    highlight: true,
    perks: ["Badge Top", "8× plus de vues", "15 jours", "En tête de liste"],
  },
  {
    id: "vedette",
    label: "Vedette",
    price: 20000,
    icon: "👑",
    color: "#7C3AED",
    perks: ["Badge Vedette", "15× plus de vues", "30 jours", "Page d'accueil"],
  },
];

const OPERATORS = [
  { id: "wave",   label: "Wave",         logo: "🌊" },
  { id: "orange", label: "Orange Money", logo: "🟠" },
  { id: "mtn",    label: "MTN Money",    logo: "🟡" },
  { id: "moov",   label: "Moov Money",   logo: "🔵" },
];

export default function BoostCTA({
  adId,
  adTitle,
  isBoosted = false,
  boostExpiresAt = null,
  userId,
  adUserId,
}: BoostCTAProps) {
  const [isVisible, setIsVisible]           = useState(false);
  const [isOpen, setIsOpen]                 = useState(false);
  const [step, setStep]                     = useState<"plan" | "operator" | "phone">("plan");
  const [selectedPlan, setSelectedPlan]     = useState("top");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [phone, setPhone]                   = useState("");
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState("");
  const [success, setSuccess]               = useState(false);

  // N'affiche le composant qu'au propriétaire de l'annonce
  const isOwner = !userId || !adUserId || userId === adUserId;

  const daysLeft = boostExpiresAt
    ? Math.max(0, Math.ceil((new Date(boostExpiresAt).getTime() - Date.now()) / 86400000))
    : 0;

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!isOwner) return null;

  const plan = BOOST_PLANS.find((p) => p.id === selectedPlan)!;

  const handleOpen = () => {
    setStep("plan");
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep("plan");
    setError("");
  };

  const handlePay = async () => {
    if (!phone || phone.replace(/\s/g, "").length < 8) {
      setError("Numéro de téléphone invalide.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId,
          boostType: selectedPlan,        // "urgent" | "top" | "vedette"
          phone: phone.replace(/\s/g, ""),
          operator: selectedOperator,      // "wave" | "orange" | "mtn" | "moov"
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Une erreur est survenue."); return; }
      if (data.paymentUrl) { window.location.href = data.paymentUrl; }
      else { setSuccess(true); }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── BARRE STICKY ── */}
      <div className={`bct-sticky ${isVisible ? "bct-on" : ""} ${isBoosted ? "bct-boosted" : ""}`}>
        {isBoosted ? (
          <div className="bct-active">
            <span className="bct-active__crown">👑</span>
            <div className="bct-active__info">
              <strong>Annonce boostée</strong>
              <span>{daysLeft} jour{daysLeft !== 1 ? "s" : ""} restant{daysLeft !== 1 ? "s" : ""}</span>
            </div>
            <button className="bct-renew" onClick={handleOpen}>Renouveler</button>
          </div>
        ) : (
          <button className="bct-cta" onClick={handleOpen}>
            <span className="bct-cta__icon">⚡</span>
            <div className="bct-cta__text">
              <strong>Booster cette annonce</strong>
              <span>Dès 2 500 FCFA · Mobile Money</span>
            </div>
            <span className="bct-cta__arr">›</span>
          </button>
        )}
      </div>

      {/* ── BOTTOM SHEET ── */}
      {isOpen && (
        <div className="bct-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div className="bct-sheet">
            <div className="bct-handle" />

            {/* Header */}
            <div className="bct-head">
              <div>
                <h2 className="bct-title">
                  {step === "plan"     && "⚡ Choisir un pack"}
                  {step === "operator" && "📱 Opérateur de paiement"}
                  {step === "phone"    && "☎️ Numéro Mobile Money"}
                </h2>
                <p className="bct-sub">{adTitle.length > 40 ? adTitle.slice(0, 40) + "…" : adTitle}</p>
              </div>
              <button className="bct-close" onClick={handleClose}>✕</button>
            </div>

            {/* ÉTAPE 1 — Plan */}
            {step === "plan" && (
              <>
                <div className="bct-plans">
                  {BOOST_PLANS.map((p) => (
                    <button
                      key={p.id}
                      className={`bct-plan ${selectedPlan === p.id ? "bct-plan-on" : ""}`}
                      style={{ "--pc": p.color } as React.CSSProperties}
                      onClick={() => setSelectedPlan(p.id)}
                    >
                      {p.highlight && <span className="bct-pop">POPULAIRE</span>}
                      <div className="bct-plan__row">
                        <span className="bct-plan__ico">{p.icon}</span>
                        <div className="bct-plan__info">
                          <span className="bct-plan__name">{p.label}</span>
                          <span className="bct-plan__perks">{p.perks.join(" · ")}</span>
                        </div>
                        <span className="bct-plan__price">
                          {p.price.toLocaleString()}<small> FCFA</small>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="bct-footer">
                  <button className="bct-btn-next" onClick={() => setStep("operator")}>Continuer →</button>
                </div>
              </>
            )}

            {/* ÉTAPE 2 — Opérateur */}
            {step === "operator" && (
              <>
                <div className="bct-ops">
                  {OPERATORS.map((op) => (
                    <button
                      key={op.id}
                      className={`bct-op ${selectedOperator === op.id ? "bct-op-on" : ""}`}
                      onClick={() => setSelectedOperator(op.id)}
                    >
                      <span className="bct-op__logo">{op.logo}</span>
                      <span className="bct-op__label">{op.label}</span>
                      {selectedOperator === op.id && <span className="bct-check">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="bct-footer bct-footer-row">
                  <button className="bct-btn-back" onClick={() => setStep("plan")}>← Retour</button>
                  <button className="bct-btn-next" disabled={!selectedOperator} onClick={() => setStep("phone")}>
                    Continuer →
                  </button>
                </div>
              </>
            )}

            {/* ÉTAPE 3 — Téléphone */}
            {step === "phone" && (
              <>
                <div className="bct-phone">
                  <div className="bct-recap">
                    <span>Pack {plan.label}</span>
                    <strong>{plan.price.toLocaleString()} FCFA</strong>
                  </div>
                  <label className="bct-label">
                    Numéro {OPERATORS.find((o) => o.id === selectedOperator)?.label}
                  </label>
                  <div className="bct-input-wrap">
                    <span className="bct-prefix">+225</span>
                    <input
                      className="bct-input"
                      type="tel"
                      inputMode="numeric"
                      placeholder="07 XX XX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, ""))}
                      maxLength={12}
                      autoFocus
                    />
                  </div>
                  {error   && <p className="bct-err">⚠️ {error}</p>}
                  {success && <p className="bct-ok">✅ Paiement initié ! Vérifiez votre téléphone.</p>}
                </div>
                <div className="bct-footer bct-footer-row">
                  <button className="bct-btn-back" onClick={() => setStep("operator")}>← Retour</button>
                  <button
                    className={`bct-btn-pay ${isLoading ? "bct-loading" : ""}`}
                    onClick={handlePay}
                    disabled={isLoading || success}
                  >
                    {isLoading
                      ? <span className="bct-spin" />
                      : `Payer ${plan.price.toLocaleString()} FCFA`}
                  </button>
                </div>
                <p className="bct-note">🔒 Paiement sécurisé via CinetPay</p>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        :root {
          --bct-gold:#F5A623; --bct-dark:#111827;
          --bct-surf:#1F2937; --bct-dim:rgba(255,255,255,0.5);
        }
        /* STICKY */
        .bct-sticky {
          position:fixed; bottom:0; left:0; right:0; z-index:9999;
          padding:12px 16px; padding-bottom:calc(12px + env(safe-area-inset-bottom));
          background:linear-gradient(160deg,#111827,#1F2937);
          border-top:1px solid rgba(245,166,35,.2);
          box-shadow:0 -6px 24px rgba(0,0,0,.5);
          transform:translateY(100%);
          transition:transform .3s cubic-bezier(.34,1.56,.64,1);
        }
        .bct-on { transform:translateY(0); }
        /* CTA */
        .bct-cta {
          display:flex; align-items:center; gap:12px; width:100%;
          padding:14px 18px;
          background:linear-gradient(135deg,#F5A623,#C47D0E);
          border:none; border-radius:14px; cursor:pointer;
          box-shadow:0 4px 20px rgba(245,166,35,.4);
          transition:transform .15s;
        }
        .bct-cta:active { transform:scale(.98); }
        .bct-cta__icon { font-size:22px; animation:bct-pulse 2s ease-in-out infinite; }
        @keyframes bct-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        .bct-cta__text { flex:1; text-align:left; }
        .bct-cta__text strong { display:block; color:#111827; font-size:15px; font-weight:700; }
        .bct-cta__text span { display:block; color:rgba(26,26,46,.65); font-size:12px; margin-top:1px; }
        .bct-cta__arr { color:#111827; font-size:22px; font-weight:700; }
        /* ACTIVE */
        .bct-active { display:flex; align-items:center; gap:12px; padding:8px 4px; }
        .bct-active__crown { font-size:26px; animation:bct-crown 3s ease-in-out infinite; }
        @keyframes bct-crown { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        .bct-active__info { flex:1; }
        .bct-active__info strong { display:block; color:#FFD36E; font-size:14px; font-weight:700; }
        .bct-active__info span { display:block; color:var(--bct-dim); font-size:12px; }
        .bct-renew {
          padding:8px 14px; background:transparent;
          border:1px solid var(--bct-gold); border-radius:8px;
          color:var(--bct-gold); font-size:13px; font-weight:600; cursor:pointer;
        }
        /* OVERLAY */
        .bct-overlay {
          position:fixed; inset:0; z-index:10000;
          background:rgba(0,0,0,.75); backdrop-filter:blur(4px);
          display:flex; align-items:flex-end;
          animation:bct-fade .2s ease;
        }
        @keyframes bct-fade { from{opacity:0} to{opacity:1} }
        /* SHEET */
        .bct-sheet {
          width:100%; background:var(--bct-surf);
          border-radius:20px 20px 0 0;
          padding:8px 20px 0;
          padding-bottom:env(safe-area-inset-bottom);
          max-height:90dvh; overflow-y:auto;
          animation:bct-up .3s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes bct-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .bct-handle { width:40px; height:4px; background:rgba(255,255,255,.15); border-radius:2px; margin:0 auto 16px; }
        .bct-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
        .bct-title { font-size:19px; font-weight:800; color:#fff; margin:0 0 4px; }
        .bct-sub { font-size:13px; color:var(--bct-dim); margin:0; }
        .bct-close {
          width:30px; height:30px; background:rgba(255,255,255,.07);
          border:none; border-radius:50%; color:var(--bct-dim);
          font-size:13px; cursor:pointer; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        /* PLANS */
        .bct-plans { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
        .bct-plan {
          position:relative; width:100%; padding:14px 16px;
          background:rgba(255,255,255,.04);
          border:1.5px solid rgba(255,255,255,.09);
          border-radius:14px; cursor:pointer; text-align:left;
          transition:border-color .2s,background .2s;
        }
        .bct-plan-on {
          border-color:var(--pc,var(--bct-gold));
          background:color-mix(in srgb,var(--pc,var(--bct-gold)) 10%,transparent);
        }
        .bct-pop {
          position:absolute; top:-10px; left:50%; transform:translateX(-50%);
          background:var(--bct-gold); color:#111827;
          font-size:10px; font-weight:800; letter-spacing:.6px;
          padding:3px 10px; border-radius:20px;
        }
        .bct-plan__row { display:flex; align-items:center; gap:10px; }
        .bct-plan__ico { font-size:22px; flex-shrink:0; }
        .bct-plan__info { flex:1; }
        .bct-plan__name { display:block; font-size:14px; font-weight:700; color:#fff; }
        .bct-plan__perks { display:block; font-size:11px; color:var(--bct-dim); margin-top:2px; }
        .bct-plan__price { font-size:16px; font-weight:800; color:var(--pc,var(--bct-gold)); white-space:nowrap; }
        .bct-plan__price small { font-size:10px; font-weight:500; }
        /* OPERATORS */
        .bct-ops { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
        .bct-op {
          display:flex; align-items:center; gap:10px; padding:14px;
          background:rgba(255,255,255,.04);
          border:1.5px solid rgba(255,255,255,.09);
          border-radius:12px; cursor:pointer; position:relative;
          transition:border-color .2s,background .2s;
        }
        .bct-op-on { border-color:var(--bct-gold); background:rgba(245,166,35,.1); }
        .bct-op__logo { font-size:22px; }
        .bct-op__label { font-size:13px; color:#fff; font-weight:600; flex:1; }
        .bct-check { position:absolute; top:6px; right:8px; font-size:12px; color:var(--bct-gold); font-weight:800; }
        /* PHONE */
        .bct-phone { margin-bottom:20px; }
        .bct-recap {
          display:flex; justify-content:space-between; align-items:center;
          font-size:14px; color:var(--bct-dim);
          padding:12px 14px; background:rgba(255,255,255,.04);
          border-radius:10px; margin-bottom:16px;
        }
        .bct-recap strong { color:#FFD36E; font-size:17px; }
        .bct-label { display:block; font-size:13px; color:var(--bct-dim); margin-bottom:8px; }
        .bct-input-wrap {
          display:flex; align-items:center;
          background:rgba(255,255,255,.07);
          border:1.5px solid rgba(255,255,255,.12);
          border-radius:12px; overflow:hidden;
        }
        .bct-prefix { padding:0 12px; font-size:15px; color:var(--bct-dim); border-right:1px solid rgba(255,255,255,.1); white-space:nowrap; }
        .bct-input { flex:1; padding:14px 12px; background:transparent; border:none; color:#fff; font-size:16px; outline:none; }
        .bct-input::placeholder { color:rgba(255,255,255,.25); }
        .bct-err { color:#F87171; font-size:13px; margin-top:10px; }
        .bct-ok  { color:#34D399; font-size:13px; margin-top:10px; }
        /* FOOTER */
        .bct-footer { padding:16px 0 20px; border-top:1px solid rgba(255,255,255,.07); }
        .bct-footer-row { display:flex; gap:10px; }
        .bct-btn-next {
          width:100%; padding:15px;
          background:linear-gradient(135deg,var(--bct-gold),#C47D0E);
          border:none; border-radius:12px;
          color:#111827; font-size:15px; font-weight:700;
          cursor:pointer; transition:transform .15s;
        }
        .bct-btn-next:disabled { opacity:.4; cursor:not-allowed; }
        .bct-btn-next:active { transform:scale(.98); }
        .bct-btn-back {
          padding:15px 20px; background:rgba(255,255,255,.07);
          border:none; border-radius:12px;
          color:#fff; font-size:14px; font-weight:600;
          cursor:pointer; white-space:nowrap;
        }
        .bct-btn-pay {
          flex:1; padding:15px;
          background:linear-gradient(135deg,var(--bct-gold),#C47D0E);
          border:none; border-radius:12px;
          color:#111827; font-size:15px; font-weight:700;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:transform .15s;
        }
        .bct-loading { opacity:.7; cursor:not-allowed; }
        .bct-btn-pay:active { transform:scale(.98); }
        .bct-spin {
          width:20px; height:20px;
          border:2px solid rgba(26,26,46,.3);
          border-top-color:#111827;
          border-radius:50%;
          animation:bct-rot .7s linear infinite;
        }
        @keyframes bct-rot { to{transform:rotate(360deg)} }
        .bct-note { text-align:center; font-size:12px; color:var(--bct-dim); margin:10px 0 0; }
        @media(min-width:768px){ .bct-sticky{ display:none; } }
      `}</style>
    </>
  );
}
