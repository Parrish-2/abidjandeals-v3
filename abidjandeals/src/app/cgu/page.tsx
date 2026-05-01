// ============================================================
// FICHIER  : app/cgu/page.tsx
// ACTION   : CRÉER (nouveau dossier + fichier)
// EFFET    : Page /cgu — 4 sections légales structurées,
//            thème dark/orange, sommaire cliquable
// ============================================================

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description:
    "CGU d'AbidjanDeals Pro : nature de la plateforme, responsabilités, protection des données (loi ivoirienne n°2013-450) et contenus interdits.",
}

const sections = [
  {
    id: 'nature',
    num: '01',
    title: 'Nature de la plateforme',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    blocks: [
      {
        subtitle: 'Statut d\'hébergeur technique',
        text: 'AbidjanDeals Pro est un simple hébergeur technique et intermédiaire de mise en relation entre acheteurs et vendeurs particuliers ou professionnels. La plateforme ne participe à aucune transaction commerciale et n\'est pas partie aux contrats conclus entre utilisateurs.',
      },
      {
        subtitle: 'Absence de garantie sur les annonces',
        text: 'Les annonces publiées sont sous la seule responsabilité de leurs auteurs. AbidjanDeals Pro ne vérifie pas systématiquement l\'exactitude, la légalité ou la disponibilité des biens et services proposés, sauf dans le cadre de sa politique de modération.',
      },
    ],
  },
  {
    id: 'responsabilite',
    num: '02',
    title: 'Limitation de responsabilité',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
    blocks: [
      {
        subtitle: 'Litiges entre utilisateurs',
        text: 'L\'Éditeur de la plateforme n\'est en aucun cas responsable des litiges physiques, financiers ou juridiques pouvant survenir entre acheteurs et vendeurs. Toute transaction est effectuée sous la seule responsabilité des parties concernées.',
      },
      {
        subtitle: 'Force majeure et indisponibilité',
        text: 'La responsabilité d\'AbidjanDeals Pro ne saurait être engagée en cas d\'interruption de service, de perte de données ou de dommages indirects résultant de l\'utilisation de la plateforme, dans la limite permise par la loi ivoirienne applicable.',
      },
    ],
  },
  {
    id: 'donnees',
    num: '03',
    title: 'Protection des données personnelles',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    blocks: [
      {
        subtitle: 'Conformité légale — Loi n°2013-450',
        text: 'Le traitement de vos données personnelles est effectué conformément à la loi ivoirienne n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel, sous l\'autorité de l\'Autorité de Régulation des Télécommunications/TIC de Côte d\'Ivoire (ARTCI).',
      },
      {
        subtitle: 'Données collectées et preuve de consentement',
        text: 'Lors de votre inscription, nous collectons votre adresse e-mail et numéro de téléphone. À des fins de preuve légale, votre consentement aux CGU est horodaté avec votre adresse IP et votre User-Agent conformément à la loi n°2013-450. Ces données ne sont jamais revendues à des tiers.',
      },
      {
        subtitle: 'Vos droits',
        text: 'Vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits : dpo@abidjandeals.pro',
      },
    ],
  },
  {
    id: 'interdictions',
    num: '04',
    title: 'Contenus & annonces interdits',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    blocks: [
      {
        subtitle: 'Liste exhaustive des interdictions',
        text: 'Sont strictement proscrits sur AbidjanDeals Pro : les armes à feu, munitions et armes blanches ; les stupéfiants et substances psychotropes ; les contrefaçons portant atteinte aux droits de propriété intellectuelle ; les terrains sans titres fonciers clairs (ACD, titre foncier enregistré) ; les contenus à caractère pornographique ou impliquant des mineurs ; tout contenu incitant à la haine ou à la discrimination.',
      },
      {
        subtitle: 'Sanctions applicables',
        text: 'Toute violation entraîne la suppression immédiate de l\'annonce, le bannissement permanent du compte, et peut faire l\'objet d\'un signalement aux autorités compétentes ivoiriennes (Police judiciaire, PLCC).',
      },
    ],
  },
]

export default function CGUPage() {
  return (
    <main
      className="min-h-screen bg-[#0A0A0A] text-white"
      style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
    >
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-8rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
          <span
            className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-orange-400 border border-orange-500/30 rounded-full px-4 py-1.5 mb-8"
            style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
          >
            Mise à jour — 2024
          </span>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5"
            style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
          >
            Conditions Générales{' '}
            <span className="text-orange-500">d&apos;Utilisation</span>
          </h1>

          <p className="text-base text-white/50 max-w-xl mx-auto leading-relaxed">
            En utilisant AbidjanDeals Pro, vous acceptez l&apos;intégralité des présentes
            conditions. Veuillez les lire attentivement.
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-xs text-white/25">
            <span>Éditeur : AbidjanDeals Pro</span>
            <span>·</span>
            <span>Juridiction : Côte d&apos;Ivoire</span>
            <span>·</span>
            <span>Loi n°2013-450</span>
          </div>
        </div>
      </section>

      {/* ── SOMMAIRE ── */}
      <nav className="max-w-3xl mx-auto px-6 py-8">
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
          <p
            className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
          >
            Sommaire
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-3 text-sm text-white/50 hover:text-orange-400 transition-colors py-1"
              >
                <span className="text-orange-500/50 font-mono text-xs">{s.num}</span>
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── SECTIONS ── */}
      <article className="max-w-3xl mx-auto px-6 pb-10 space-y-5">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden scroll-mt-8"
          >
            {/* En-tête */}
            <div className="flex items-center gap-4 px-6 sm:px-8 py-5 border-b border-white/8">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex-shrink-0">
                {section.icon}
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-orange-500/40 font-mono text-sm">{section.num}</span>
                <h2
                  className="text-base font-bold text-white"
                  style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
                >
                  {section.title}
                </h2>
              </div>
            </div>

            {/* Corps */}
            <div className="px-6 sm:px-8 py-6 space-y-5">
              {section.blocks.map((block, i) => (
                <div key={i}>
                  <h3 className="text-xs font-semibold text-orange-400/80 uppercase tracking-wide mb-2">
                    {block.subtitle}
                  </h3>
                  <p className="text-sm text-white/55 leading-relaxed">
                    {block.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </article>

      {/* ── SIGNATURE ── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
              className="w-6 h-6 text-orange-400">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h3
            className="text-base font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
          >
            Acceptation enregistrée à l&apos;inscription
          </h3>
          <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
            En créant votre compte, vous confirmez avoir lu et accepté ces CGU.
            Votre consentement est enregistré avec horodatage et adresse IP,
            conformément à la loi n°2013-450.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/charte-securite"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:bg-white/5 transition-colors"
            >
              Charte de sécurité →
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
