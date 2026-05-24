'use client'
// ============================================================
// FICHIER  : components/auth/RegisterForm.tsx
// ACTION   : REMPLACER le contenu existant
// EFFET    : Corrige l'erreur TS2305 — utilise @supabase/ssr
//            au lieu de l'ancien @supabase/auth-helpers-nextjs
// ============================================================

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

// ── Types ──────────────────────────────────────────────────────────────────
interface FormState {
  email: string
  password: string
  phone: string
  acceptCGU: boolean
}

// ── Helper : récupère l'IP publique du client ──────────────────────────────
async function fetchClientIP(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' })
    const data = await res.json()
    return (data.ip as string) ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

// ── Helper : enregistre le consentement CGU dans profiles ─────────────────
async function recordCGUConsent(
  supabase: ReturnType<typeof createBrowserClient>,
  userId: string
): Promise<void> {
  const ip        = await fetchClientIP()
  const userAgent = navigator.userAgent
  const timestamp = new Date().toISOString()

  const { error } = await supabase
    .from('profiles')
    .update({
      cgu_accepted_at : timestamp,
      cgu_accepted_ip : ip,
      cgu_user_agent  : userAgent,
      cgu_version     : '2024-v1',
    })
    .eq('id', userId)

  if (error) {
    console.error('[CGU consent] Erreur enregistrement :', error.message)
  }
}

// ── Composant ─────────────────────────────────────────────────────────────
export default function RegisterForm() {
  // createBrowserClient est le remplaçant direct de createClientComponentClient
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [form, setForm] = useState<FormState>({
    email    : '',
    password : '',
    phone    : '',
    acceptCGU: false,
  })
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.acceptCGU) {
      setErrorMsg('Vous devez accepter les CGU pour continuer.')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      // 1. Création du compte Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email   : form.email,
        password: form.password,
        options : { data: { phone: form.phone } },
      })

      if (signUpError) throw new Error(signUpError.message)
      if (!data.user)  throw new Error('Impossible de créer le compte.')

      // 2. Enregistrement du consentement CGU (non bloquant)
      await recordCGUConsent(supabase, data.user.id)

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  // ── Écran succès ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div
        className="text-center py-10 space-y-4"
        style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
      >
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-7 h-7 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h2
          className="text-xl font-bold text-white"
          style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
        >
          Compte créé !
        </h2>
        <p className="text-sm text-white/50">
          Vérifiez votre boîte e-mail pour confirmer votre adresse.
        </p>
      </div>
    )
  }

  // ── Formulaire ────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
      noValidate
    >
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-medium text-white/40 uppercase tracking-wider">
          Adresse e-mail
        </label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          value={form.email} onChange={handleChange}
          placeholder="vous@exemple.com"
          className="w-full px-4 py-3 rounded-xl text-sm text-white bg-white/[0.05] border border-white/10 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
        />
      </div>

      {/* Téléphone */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-xs font-medium text-white/40 uppercase tracking-wider">
          Téléphone <span className="text-white/25 normal-case">(optionnel)</span>
        </label>
        <input
          id="phone" name="phone" type="tel" autoComplete="tel"
          value={form.phone} onChange={handleChange}
          placeholder="+225 07 00 00 00 00"
          className="w-full px-4 py-3 rounded-xl text-sm text-white bg-white/[0.05] border border-white/10 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
        />
      </div>

      {/* Mot de passe */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-medium text-white/40 uppercase tracking-wider">
          Mot de passe
        </label>
        <input
          id="password" name="password" type="password" required minLength={8}
          autoComplete="new-password"
          value={form.password} onChange={handleChange}
          placeholder="8 caractères minimum"
          className="w-full px-4 py-3 rounded-xl text-sm text-white bg-white/[0.05] border border-white/10 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
        />
      </div>

      {/* ── Checkbox CGU — BLOC LÉGAL CRITIQUE ────────────────────────────── */}
      <div
        className="rounded-xl p-4 transition-colors"
        style={{
          border: form.acceptCGU
            ? '1px solid rgba(249,115,22,0.4)'
            : '1px solid rgba(255,255,255,0.1)',
          background: form.acceptCGU
            ? 'rgba(249,115,22,0.06)'
            : 'rgba(255,255,255,0.02)',
        }}
      >
        <label className="flex items-start gap-3 cursor-pointer select-none">
          {/* Checkbox visuelle */}
          <div
            className="relative flex-shrink-0 mt-0.5"
            onClick={() => setForm(prev => ({ ...prev, acceptCGU: !prev.acceptCGU }))}
          >
            <input
              type="checkbox" name="acceptCGU" id="acceptCGU"
              checked={form.acceptCGU} onChange={handleChange}
              className="sr-only"
            />
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
              style={{
                background: form.acceptCGU ? '#F97316' : 'transparent',
                border: form.acceptCGU
                  ? '1px solid #F97316'
                  : '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {form.acceptCGU && (
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.8}
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>

          <span className="text-sm text-white/60 leading-relaxed">
            J&apos;ai lu et j&apos;accepte les{' '}
            <Link
              href="/cgu" target="_blank" rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Conditions Générales d&apos;Utilisation
            </Link>{' '}
            et la{' '}
            <Link
              href="/charte-securite" target="_blank" rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Charte de Sécurité
            </Link>.{' '}
            <span className="text-white/25 text-xs">
              Mon consentement sera horodaté conformément à la loi n°2013-450.
            </span>
          </span>
        </label>
      </div>

      {/* Message d'erreur */}
      {errorMsg && (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
            <path fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd" />
          </svg>
          {errorMsg}
        </p>
      )}

      {/* Bouton submit */}
      <button
        type="submit"
        disabled={status === 'loading' || !form.acceptCGU}
        className="w-full py-3.5 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
        style={{ fontFamily: 'var(--font-syne, "Syne", sans-serif)' }}
      >
        {status === 'loading' ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Création en cours…
          </>
        ) : (
          'Créer mon compte gratuitement'
        )}
      </button>

      <p className="text-center text-xs text-white/25">
        Déjà un compte ?{' '}
        <Link href="/connexion" className="text-orange-400 hover:text-orange-300">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
