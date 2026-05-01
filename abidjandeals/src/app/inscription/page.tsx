// ============================================================
// FICHIER  : app/inscription/page.tsx
// ACTION   : CRÉER (nouveau dossier + fichier)
// EFFET    : Page /inscription — layout dark centré qui
//            importe et affiche le RegisterForm
// ============================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: "Rejoignez AbidjanDeals Pro et publiez vos annonces gratuitement en Côte d'Ivoire.",
}

export default function InscriptionPage() {
  return (
    <main
      className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-16"
      style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo / marque */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <span
                className="text-white font-bold text-sm"
                style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
              >
                AD
              </span>
            </div>
            <span
              className="text-white font-bold text-lg"
              style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
            >
              AbidjanDeals <span className="text-orange-500">Pro</span>
            </span>
          </Link>

          <h1
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
          >
            Créer un compte gratuit
          </h1>
          <p className="text-sm text-white/40">
            Publiez vos annonces et achetez en toute sécurité
          </p>
        </div>

        {/* Carte formulaire */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-7">
          <RegisterForm />
        </div>

        {/* Liens légaux discrets */}
        <p className="text-center text-xs text-white/20 mt-6">
          <Link href="/cgu" className="hover:text-white/40 transition-colors">CGU</Link>
          {' · '}
          <Link href="/charte-securite" className="hover:text-white/40 transition-colors">Charte de sécurité</Link>
          {' · '}
          <Link href="/confidentialite" className="hover:text-white/40 transition-colors">Confidentialité</Link>
        </p>
      </div>
    </main>
  )
}
