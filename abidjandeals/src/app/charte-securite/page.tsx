// ============================================================
// FICHIER  : app/charte-securite/page.tsx
// ACTION   : CRÉER (nouveau dossier + fichier)
// EFFET    : Page /charte-securite — 4 règles dark/orange,
//            polices Syne + DM Sans (variables déjà dans layout.tsx)
// ============================================================

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Charte de Sécurité',
  description:
    'Nos règles de sécurité pour chaque transaction : zéro avance, lieux publics, vérification des documents.',
}

const rules = [
  {
    id: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    label: 'Zéro Avance',
    rule: 'Ne versez JAMAIS d\'acompte (Wave, Orange Money) avant d\'avoir vu le produit en personne.',
    emphasis: 'JAMAIS',
    gradientFrom: 'rgba(239,68,68,0.15)',
    gradientTo: 'rgba(239,68,68,0.02)',
    borderColor: 'rgba(239,68,68,0.25)',
    accentClass: 'text-red-400',
  },
  {
    id: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
    label: 'Lieu Public',
    rule: 'Rencontrez-vous uniquement dans des lieux publics sécurisés : Stations-service, Centres commerciaux, lieux fréquentés.',
    emphasis: 'lieux publics sécurisés',
    gradientFrom: 'rgba(249,115,22,0.15)',
    gradientTo: 'rgba(249,115,22,0.02)',
    borderColor: 'rgba(249,115,22,0.25)',
    accentClass: 'text-orange-400',
  },
  {
    id: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    label: 'Vérification',
    rule: 'Testez l\'objet et vérifiez les documents officiels avant tout paiement : ACD pour les terrains, Carte grise pour les véhicules.',
    emphasis: 'avant tout paiement',
    gradientFrom: 'rgba(34,197,94,0.12)',
    gradientTo: 'rgba(34,197,94,0.02)',
    borderColor: 'rgba(34,197,94,0.22)',
    accentClass: 'text-emerald-400',
  },
  {
    id: '04',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    ),
    label: 'Signalement',
    rule: 'Tout comportement suspect (pression, faux documents, prix anormal) doit être signalé. Cela entraîne un bannissement immédiat.',
    emphasis: 'bannissement immédiat',
    gradientFrom: 'rgba(245,158,11,0.13)',
    gradientTo: 'rgba(245,158,11,0.02)',
    borderColor: 'rgba(245,158,11,0.25)',
    accentClass: 'text-amber-400',
  },
]

export default function CharteSecuritePage() {
  return (
    <main
      className="min-h-screen bg-[#0A0A0A] text-white"
      style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
    >
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-white/5">
        {/* Glow orange décoratif */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-8rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(249,115,22,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Chip */}
          <span
            className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-orange-400 border border-orange-500/30 rounded-full px-4 py-1.5 mb-8"
            style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Protégez-vous
          </span>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
          >
            Charte de{' '}
            <span className="text-orange-500">Sécurité</span>
          </h1>

          <p className="text-base text-white/50 max-w-xl mx-auto leading-relaxed">
            AbidjanDeals Pro est une plateforme de mise en relation. Ces règles
            existent pour que chaque transaction se passe en toute sérénité.
          </p>
        </div>
      </section>

      {/* ── RÈGLES ── */}
      <section className="max-w-3xl mx-auto px-6 py-16 space-y-5">
        {rules.map((r) => (
          <article
            key={r.id}
            style={{
              background: `linear-gradient(135deg, ${r.gradientFrom} 0%, ${r.gradientTo} 100%)`,
              border: `1px solid ${r.borderColor}`,
              borderRadius: '1rem',
              padding: '1.75rem 2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Numéro watermark */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '0.5rem',
                fontSize: '5rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.035)',
                fontFamily: 'var(--font-syne, "Syne", sans-serif)',
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              {r.id}
            </span>

            <div className="flex items-start gap-5">
              <div className={`flex-shrink-0 mt-0.5 ${r.accentClass}`}>
                {r.icon}
              </div>
              <div>
                <h2
                  className="text-lg font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
                >
                  {r.label}
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  {r.rule.includes(r.emphasis)
                    ? r.rule.split(r.emphasis).map((part, i, arr) =>
                        i < arr.length - 1 ? (
                          <span key={i}>
                            {part}
                            <strong className={`font-semibold ${r.accentClass}`}>
                              {r.emphasis}
                            </strong>
                          </span>
                        ) : (
                          part
                        )
                      )
                    : r.rule}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-sm text-white/50 mb-5">
            En utilisant AbidjanDeals Pro, vous acceptez de respecter cette charte.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cgu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:bg-white/5 transition-colors"
            >
              Lire les CGU →
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-orange-500 hover:bg-orange-400 text-white transition-colors"
            >
              Créer mon compte
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
