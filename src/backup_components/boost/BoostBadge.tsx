"use client";

// ============================================================
// FICHIER : src/components/boost/BoostBadge.tsx
// Badge doré is_boosted avec animation — à utiliser dans les
// cartes d'annonces de la liste.
// ============================================================

interface BoostBadgeProps {
  /** Variante d'affichage */
  variant?: "badge" | "card-overlay" | "inline";
  /** Jours restants (optionnel, affiche la durée) */
  daysLeft?: number | null;
  /** Taille */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Badge affiché sur les annonces boostées dans la liste.
 *
 * Usage dans votre AdCard :
 *   {ad.is_boosted && <BoostBadge variant="card-overlay" daysLeft={ad.boost_days_left} />}
 */
export function BoostBadge({
  variant = "badge",
  daysLeft = null,
  size = "md",
  className = "",
}: BoostBadgeProps) {
  return (
    <>
      <span
        className={`boost-badge boost-badge--${variant} boost-badge--${size} ${className}`}
        aria-label="Annonce boostée"
        role="img"
      >
        <span className="boost-badge__shimmer" aria-hidden="true" />
        <span className="boost-badge__icon" aria-hidden="true">👑</span>
        <span className="boost-badge__label">Boosté</span>
        {daysLeft !== null && daysLeft > 0 && (
          <span className="boost-badge__days">· {daysLeft}j</span>
        )}
      </span>

      <style>{`
        /* ── TOKENS ── */
        .boost-badge {
          --bb-gold: #F5A623;
          --bb-gold-light: #FFD36E;
          --bb-gold-dark: #9A5E00;
          --bb-text: #3D2200;

          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          overflow: hidden;
          border-radius: 999px;
          font-weight: 700;
          white-space: nowrap;
          background: linear-gradient(
            110deg,
            #C47D0E 0%,
            var(--bb-gold) 40%,
            var(--bb-gold-light) 60%,
            #C47D0E 100%
          );
          background-size: 200% 100%;
          animation: bb-shine 3s ease-in-out infinite;
          box-shadow:
            0 2px 8px rgba(196,125,14,0.5),
            inset 0 1px 0 rgba(255,255,255,0.3);
        }

        @keyframes bb-shine {
          0%   { background-position: 200% 0; }
          60%  { background-position: -200% 0; }
          100% { background-position: -200% 0; }
        }

        /* shimmer overlay */
        .boost-badge__shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255,255,255,0.45) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          animation: bb-shimmer 3s ease-in-out infinite;
          border-radius: inherit;
          pointer-events: none;
        }

        @keyframes bb-shimmer {
          0%   { background-position: 200% 0; opacity: 0; }
          30%  { opacity: 1; }
          60%  { background-position: -200% 0; opacity: 0; }
          100% { background-position: -200% 0; opacity: 0; }
        }

        /* ── ICON ── */
        .boost-badge__icon {
          position: relative;
          z-index: 1;
          animation: bb-crown 4s ease-in-out infinite;
        }

        @keyframes bb-crown {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25%       { transform: translateY(-1.5px) rotate(-5deg); }
          75%       { transform: translateY(-1.5px) rotate(5deg); }
        }

        /* ── TEXT ── */
        .boost-badge__label,
        .boost-badge__days {
          position: relative;
          z-index: 1;
          color: var(--bb-text);
          letter-spacing: 0.2px;
        }

        .boost-badge__days {
          opacity: 0.75;
          font-weight: 500;
        }

        /* ── SIZE ── */
        .boost-badge--sm {
          padding: 2px 8px 2px 6px;
          font-size: 10px;
        }

        .boost-badge--sm .boost-badge__icon {
          font-size: 11px;
        }

        .boost-badge--md {
          padding: 4px 10px 4px 8px;
          font-size: 12px;
        }

        .boost-badge--md .boost-badge__icon {
          font-size: 14px;
        }

        /* ── VARIANTS ── */

        /* badge simple (inline dans une liste) */
        .boost-badge--badge {}

        /* positionné en overlay sur la carte */
        .boost-badge--card-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          box-shadow:
            0 2px 12px rgba(196,125,14,0.6),
            inset 0 1px 0 rgba(255,255,255,0.3);
        }

        /* inline sans position absolue */
        .boost-badge--inline {
          vertical-align: middle;
          margin-left: 6px;
        }
      `}</style>
    </>
  );
}

// ============================================================
// FICHIER (suite) : src/components/boost/BoostedAdCard.tsx
// Wrapper de carte avec état visuel complet is_boosted
// ============================================================

interface BoostedAdCardProps {
  ad: {
    id: string;
    title: string;
    price: number;
    currency?: string;
    location?: string;
    image_url?: string;
    is_boosted: boolean;
    boost_expires_at?: string | null;
    created_at: string;
  };
  onClick?: () => void;
  className?: string;
}

export function BoostedAdCard({ ad, onClick, className = "" }: BoostedAdCardProps) {
  const daysLeft = ad.boost_expires_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(ad.boost_expires_at).getTime() - Date.now()) / 86400000
        )
      )
    : null;

  return (
    <>
      <article
        className={`bac ${ad.is_boosted ? "bac--boosted" : ""} ${className}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        aria-label={`${ad.title}${ad.is_boosted ? " — Annonce boostée" : ""}`}
      >
        {/* Aura dorée (visible uniquement si boosté) */}
        {ad.is_boosted && (
          <span className="bac__aura" aria-hidden="true" />
        )}

        {/* Image */}
        <div className="bac__image-wrap">
          {ad.image_url ? (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="bac__image"
              loading="lazy"
            />
          ) : (
            <div className="bac__image-placeholder" aria-hidden="true">
              📦
            </div>
          )}

          {/* Badge overlay */}
          {ad.is_boosted && (
            <BoostBadge variant="card-overlay" daysLeft={daysLeft} size="sm" />
          )}
        </div>

        {/* Content */}
        <div className="bac__body">
          <h3 className="bac__title">{ad.title}</h3>

          <div className="bac__meta">
            {ad.location && (
              <span className="bac__location">📍 {ad.location}</span>
            )}
            <span className="bac__date">
              {new Date(ad.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <div className="bac__footer">
            <span className={`bac__price ${ad.is_boosted ? "bac__price--boosted" : ""}`}>
              {ad.price.toLocaleString()} {ad.currency ?? "FCFA"}
            </span>

            {ad.is_boosted && (
              <span className="bac__boost-indicator" aria-label="Boosté">
                ⚡
              </span>
            )}
          </div>
        </div>
      </article>

      <style>{`
        /* ── CARD ── */
        .bac {
          position: relative;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .bac:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        /* ── ÉTAT BOOSTÉ ── */
        .bac--boosted {
          border-color: rgba(245,166,35,0.5);
          box-shadow:
            0 0 0 1px rgba(245,166,35,0.2),
            0 4px 16px rgba(245,166,35,0.15);
          animation: bac-breathe 4s ease-in-out infinite;
        }

        @keyframes bac-breathe {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(245,166,35,0.2),
              0 4px 16px rgba(245,166,35,0.12);
          }
          50% {
            box-shadow:
              0 0 0 2px rgba(245,166,35,0.35),
              0 6px 24px rgba(245,166,35,0.25);
          }
        }

        .bac--boosted:hover {
          transform: translateY(-3px);
          box-shadow:
            0 0 0 2px rgba(245,166,35,0.4),
            0 12px 32px rgba(245,166,35,0.3);
        }

        /* Aura dorée derrière la carte */
        .bac__aura {
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            rgba(245,166,35,0.15) 0%,
            transparent 60%
          );
          pointer-events: none;
          z-index: 0;
          animation: bac-aura 4s ease-in-out infinite;
        }

        @keyframes bac-aura {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }

        /* ── IMAGE ── */
        .bac__image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #f3f4f6;
          overflow: hidden;
          flex-shrink: 0;
        }

        .bac__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .bac:hover .bac__image {
          transform: scale(1.03);
        }

        .bac__image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: #d1d5db;
        }

        /* ── BODY ── */
        .bac__body {
          position: relative;
          z-index: 1;
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bac__title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .bac__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .bac__location {
          font-size: 11px;
          color: #6b7280;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bac__date {
          font-size: 11px;
          color: #9ca3af;
          flex-shrink: 0;
        }

        /* ── FOOTER ── */
        .bac__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 2px;
        }

        .bac__price {
          font-size: 16px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.4px;
        }

        .bac__price--boosted {
          background: linear-gradient(90deg, #C47D0E, #F5A623);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .bac__boost-indicator {
          font-size: 16px;
          animation: bac-zap 1.5s ease-in-out infinite;
        }

        @keyframes bac-zap {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50%       { transform: scale(1.2) rotate(-10deg); opacity: 0.8; }
        }

        /* ── DARK MODE ── */
        @media (prefers-color-scheme: dark) {
          .bac {
            background: #1f2937;
            border-color: #374151;
          }

          .bac__title  { color: #f9fafb; }
          .bac__location { color: #9ca3af; }
          .bac__price  { color: #f9fafb; }
          .bac__image-placeholder { color: #4b5563; background: #111827; }
        }
      `}</style>
    </>
  );
}
