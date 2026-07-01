"use client";

import { useEffect, useState } from "react";

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
    label: "Pack Urgent",
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
    label: "Pack Vedette",
    price: 20000,
    icon: "👑",
    color: "#7C3AED",
    perks: ["Badge Vedette", "15× plus de vues", "30 jours", "Page d'accueil"],
  },
];

export default function BoostCTA({
  adId,
  adTitle,
  isBoosted = false,
  boostExpiresAt = null,
  userId,
  adUserId,
}: BoostCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("top");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwner = !userId || !adUserId || userId === adUserId;

  const daysLeft = boostExpiresAt
    ? Math.max(0, Math.ceil((new Date(boostExpiresAt).getTime() - Date.now()) / 86400000))
    : 0;

  // ── Gestion retour GeniusPay ───────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const boost = params.get("boost");
    if (boost === "success") {
      window.history.replaceState({}, "", window.location.pathname);
    } else if (boost === "error") {
      setError("Paiement annulé ou échoué. Réessayez.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!isOwner) return null;

  const plan = BOOST_PLANS.find((p) => p.id === selectedPlan)!;

  const handleOpen = () => { setError(""); setIsOpen(true); };
  const handleClose = () => { setIsOpen(false); setError(""); };

  // ── Paiement GeniusPay checkout ────────────────────────────────────────────
  const handlePay = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, boostType: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkout_url) {
        setError(data.error ?? "Erreur lors de la création du paiement.");
        return;
      }
      window.location.href = data.checkout_url;
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── DESKTOP : carte inline sidebar ── */}
      <div className="bct-desktop-card">
        {isBoosted ? (
          <div className="bct-desktop-boosted">
            <span>👑</span>
            <div>
              <strong>Annonce boostée</strong>
              <span>{daysLeft}j restants</span>
            </div>
            <button onClick={handleOpen}>Renouveler</button>
          </div>
        ) : (
          <button className="bct-desktop-btn" onClick={handleOpen}>
            <span>⚡</span>
            <div>
              <strong>Booster cette annonce</strong>
              <span>Dès 2 500 FCFA · Wave, Orange, MTN, Moov</span>
            </div>
          </button>
        )}
      </div>

      {/* ── MOBILE : barre sticky bottom ── */}
      <div className={`bct-sticky ${isVisible ? "bct-on" : ""}`}>
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
              <span>Dès 2 500 FCFA · Wave, Orange, MTN, Moov</span>
            </div>
            <span className="bct-cta__arr">›</span>
          </button>
        )}
      </div>

      {/* ── MODAL ── */}
      {isOpen && (
        <div className="bct-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div className="bct-sheet">
            <div className="bct-handle" />
            <div className="bct-head">
              <div>
                <h2 className="bct-title">⚡ Choisir un pack</h2>
                <p className="bct-sub">{adTitle.length > 40 ? adTitle.slice(0, 40) + "…" : adTitle}</p>
              </div>
              <button className="bct-close" onClick={handleClose}>✕</button>
            </div>

            {/* Sélection du plan */}
            <div className="bct-plans">
              {BOOST_PLANS.map((p) => (
                <button key={p.id}
                  className={`bct-plan ${selectedPlan === p.id ? "bct-plan-on" : ""}`}
                  style={{ "--pc": p.color } as React.CSSProperties}
                  onClick={() => setSelectedPlan(p.id)}>
                  {p.highlight && <span className="bct-pop">POPULAIRE</span>}
                  <div className="bct-plan__row">
                    <span className="bct-plan__ico">{p.icon}</span>
                    <div className="bct-plan__info">
                      <span className="bct-plan__name">{p.label}</span>
                      <span className="bct-plan__perks">{p.perks.join(" · ")}</span>
                    </div>
                    <span className="bct-plan__price">{p.price.toLocaleString("fr-CI")}<small> FCFA</small></span>
                  </div>
                </button>
              ))}
            </div>

            {/* Erreur */}
            {error && <p className="bct-err">⚠️ {error}</p>}

            {/* Footer paiement */}
            <div className="bct-footer">
              <button className={`bct-btn-pay ${isLoading ? "bct-loading" : ""}`}
                onClick={handlePay} disabled={isLoading}>
                {isLoading
                  ? <><span className="bct-spin" /> Redirection...</>
                  : `Payer ${plan.price.toLocaleString("fr-CI")} FCFA →`}
              </button>
              <p className="bct-note">🔒 Paiement sécurisé via GeniusPay · Wave, Orange, MTN, Moov</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root {
          --bct-gold:#F5A623; --bct-dark:#111827;
          --bct-surf:#1F2937; --bct-dim:rgba(255,255,255,0.5);
        }
        .bct-desktop-card { display:none; }
        @media(min-width:768px){
          .bct-desktop-card {
            display:block;
            background:linear-gradient(135deg,#111827,#1F2937);
            border-radius:16px; padding:16px;
            border:1px solid rgba(245,166,35,.2);
          }
        }
        .bct-desktop-btn {
          display:flex; align-items:center; gap:12px; width:100%;
          padding:14px 16px;
          background:linear-gradient(135deg,#F5A623,#C47D0E);
          border:none; border-radius:12px; cursor:pointer;
          box-shadow:0 4px 16px rgba(245,166,35,.3);
          transition:transform .15s,box-shadow .15s;
        }
        .bct-desktop-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(245,166,35,.4); }
        .bct-desktop-btn span:first-child { font-size:20px; }
        .bct-desktop-btn div { flex:1; text-align:left; }
        .bct-desktop-btn strong { display:block; color:#111827; font-size:14px; font-weight:700; }
        .bct-desktop-btn span:last-of-type { display:block; color:rgba(17,24,39,.6); font-size:11px; margin-top:2px; }
        .bct-desktop-boosted { display:flex; align-items:center; gap:10px; padding:4px; }
        .bct-desktop-boosted span:first-child { font-size:24px; }
        .bct-desktop-boosted div { flex:1; }
        .bct-desktop-boosted strong { display:block; color:#FFD36E; font-size:13px; font-weight:700; }
        .bct-desktop-boosted span { display:block; color:rgba(255,255,255,.5); font-size:11px; }
        .bct-desktop-boosted button {
          padding:7px 14px; background:transparent;
          border:1px solid #F5A623; border-radius:8px;
          color:#F5A623; font-size:12px; font-weight:600; cursor:pointer;
        }
        .bct-sticky {
          position:fixed; bottom:0; left:0; right:0; z-index:9999;
          padding:12px 16px; padding-bottom:calc(12px + env(safe-area-inset-bottom));
          background:linear-gradient(160deg,#111827,#1F2937);
          border-top:1px solid rgba(245,166,35,.2);
          box-shadow:0 -6px 24px rgba(0,0,0,.5);
          transform:translateY(100%);
          transition:transform .3s cubic-bezier(.34,1.56,.64,1);
        }
        @media(min-width:768px){ .bct-sticky{ display:none; } }
        .bct-on { transform:translateY(0); }
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
        .bct-overlay {
          position:fixed; inset:0; z-index:10000;
          background:rgba(0,0,0,.75); backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          animation:bct-fade .2s ease;
        }
        @keyframes bct-fade { from{opacity:0} to{opacity:1} }
        .bct-sheet {
          width:100%; max-width:480px;
          background:var(--bct-surf);
          border-radius:20px; padding:8px 20px 0;
          margin:16px; max-height:90dvh; overflow-y:auto;
          animation:bct-up .3s cubic-bezier(.34,1.56,.64,1);
        }
        @media(max-width:767px){
          .bct-overlay { align-items:flex-end; }
          .bct-sheet { border-radius:20px 20px 0 0; margin:0; max-width:100%; }
        }
        @keyframes bct-up { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
        .bct-handle { width:40px; height:4px; background:rgba(255,255,255,.15); border-radius:2px; margin:8px auto 16px; }
        .bct-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
        .bct-title { font-size:19px; font-weight:800; color:#fff; margin:0 0 4px; }
        .bct-sub { font-size:13px; color:var(--bct-dim); margin:0; }
        .bct-close {
          width:30px; height:30px; background:rgba(255,255,255,.07);
          border:none; border-radius:50%; color:var(--bct-dim);
          font-size:13px; cursor:pointer; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
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
        .bct-err { color:#F87171; font-size:13px; margin:0 0 12px; }
        .bct-footer { padding:16px 0 20px; border-top:1px solid rgba(255,255,255,.07); }
        .bct-btn-pay {
          width:100%; padding:15px;
          background:linear-gradient(135deg,var(--bct-gold),#C47D0E);
          border:none; border-radius:12px;
          color:#111827; font-size:15px; font-weight:700;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
          transition:transform .15s;
        }
        .bct-loading { opacity:.7; cursor:not-allowed; }
        .bct-btn-pay:active:not(.bct-loading) { transform:scale(.98); }
        .bct-spin {
          width:18px; height:18px;
          border:2px solid rgba(26,26,46,.3); border-top-color:#111827;
          border-radius:50%; animation:bct-rot .7s linear infinite;
        }
        @keyframes bct-rot { to{transform:rotate(360deg)} }
        .bct-note { text-align:center; font-size:11px; color:var(--bct-dim); margin:10px 0 16px; }
      `}</style>
    </>
  );
}
