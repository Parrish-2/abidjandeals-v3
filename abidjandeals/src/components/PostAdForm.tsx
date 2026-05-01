'use client'
import { useState } from 'react'
import { CATEGORIES } from '@/config/categories.config'
import type { Category, SubCategory } from '@/config/categories.config'

// ─── Catégories à risque → déclenchent l'étape KYC ──────────────────────────
const HIGH_RISK_CATEGORIES = ['Véhicule', 'PC/High-Tech', 'Immobilier']

const ALL_CATEGORIES = [
  'Téléphonie',
  'PC/High-Tech',
  'Mode & Beauté',
  'Véhicule',
  'Immobilier',
  'Maison & Déco',
  'Services',
  'Autres',
]

// ─── Types du formulaire ─────────────────────────────────────────────────────
interface FormState {
  titre: string
  description: string
  prix: string
  categorie: string
}

// ─── Barre de progression ────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i < current ? 'bg-[#2D6BE4]' : 'bg-[#E8EDF5]'
          }`}
        />
      ))}
      <span className="text-xs text-[#8B9CB3] font-semibold whitespace-nowrap">
        {current}/{total}
      </span>
    </div>
  )
}

// ─── Étape 1 : Infos basiques ────────────────────────────────────────────────
interface Step1Props {
  form: FormState
  onChange: (field: string, value: string) => void
  onNext: () => void
}

function Step1({ form, onChange, onNext }: Step1Props) {
  const isValid = form.titre.trim() && form.description.trim() && form.prix && form.categorie

  return (
    <div>
      <h2 className="text-[#0D1B2A] font-bold text-2xl mb-1">Déposez votre annonce</h2>
      <p className="text-[#8B9CB3] text-sm mb-7">C'est rapide ! Remplissez les infos de base pour commencer.</p>

      <div className="space-y-4">
        {/* Titre */}
        <div>
          <label className="block text-sm font-semibold text-[#0D1B2A] mb-1.5">Titre de l'annonce</label>
          <input
            type="text"
            placeholder="Ex : iPhone 15 Pro Max 256Go – Comme neuf"
            value={form.titre}
            onChange={e => onChange('titre', e.target.value)}
            className="w-full border border-[#DDE3ED] rounded-xl px-4 py-3 text-sm text-[#0D1B2A] placeholder-[#B0BEC5] focus:outline-none focus:ring-2 focus:ring-[#2D6BE4]/30 focus:border-[#2D6BE4] transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#0D1B2A] mb-1.5">Description</label>
          <textarea
            rows={4}
            placeholder="Décrivez votre article : état, caractéristiques, raison de la vente..."
            value={form.description}
            onChange={e => onChange('description', e.target.value)}
            className="w-full border border-[#DDE3ED] rounded-xl px-4 py-3 text-sm text-[#0D1B2A] placeholder-[#B0BEC5] focus:outline-none focus:ring-2 focus:ring-[#2D6BE4]/30 focus:border-[#2D6BE4] transition-all resize-none"
          />
        </div>

        {/* Prix */}
        <div>
          <label className="block text-sm font-semibold text-[#0D1B2A] mb-1.5">Prix (FCFA)</label>
          <div className="relative">
            <input
              type="number"
              placeholder="0"
              value={form.prix}
              onChange={e => onChange('prix', e.target.value)}
              className="w-full border border-[#DDE3ED] rounded-xl px-4 py-3 pr-16 text-sm text-[#0D1B2A] placeholder-[#B0BEC5] focus:outline-none focus:ring-2 focus:ring-[#2D6BE4]/30 focus:border-[#2D6BE4] transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8B9CB3] font-semibold">FCFA</span>
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-semibold text-[#0D1B2A] mb-2">Catégorie</label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_CATEGORIES.map((cat: string) => (
              <button
                key={cat}
                type="button"
                onClick={() => onChange('categorie', cat)}
                className={`text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                  form.categorie === cat
                    ? 'border-[#2D6BE4] bg-[#EEF3FD] text-[#2D6BE4]'
                    : 'border-[#DDE3ED] text-[#4A5568] hover:border-[#2D6BE4]/40 hover:bg-[#F8FAFF]'
                }`}
              >
                {cat}
                {HIGH_RISK_CATEGORIES.includes(cat) && (
                  <span className="ml-auto text-[9px] bg-amber-100 text-amber-600 rounded px-1.5 py-0.5 font-bold flex-shrink-0">
                    KYC
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full mt-7 py-3.5 rounded-xl font-bold text-white text-sm transition-all bg-[#2D6BE4] hover:bg-[#2460CF] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
      >
        Continuer →
      </button>
    </div>
  )
}

// ─── Étape 2 : Vérification Sécurité (conditionnelle) ───────────────────────
interface Step2SecurityProps {
  categorie: string
  kycDone: boolean
  onKycClick: () => void
  onPublish: () => void
}

function Step2Security({ categorie, kycDone, onKycClick, onPublish }: Step2SecurityProps) {
  return (
    <div>
      {/* Icône bouclier */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D6BE4] to-[#1A4FA8] flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
        </svg>
      </div>

      <h2 className="text-[#0D1B2A] font-bold text-2xl mb-2">Vérification de Sécurité</h2>
      <p className="text-[#4A5568] text-sm leading-relaxed mb-5">
        Pour garantir la sécurité de nos acheteurs dans la catégorie{' '}
        <strong className="text-[#0D1B2A]">« {categorie} »</strong>, une vérification
        d'identité rapide est requise.
      </p>

      {/* Info box */}
      <div className="bg-[#EEF3FD] border border-[#C3D4F8] rounded-xl p-4 mb-5 flex gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#2D6BE4" className="w-4 h-4 flex-shrink-0 mt-0.5">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
        <p className="text-[#2D6BE4] text-xs leading-relaxed">
          La vérification prend moins de 5 minutes. Elle protège les acheteurs et renforce votre réputation de vendeur.
        </p>
      </div>

      {/* Bénéfices */}
      {[
        'Badge vendeur certifié visible sur vos annonces',
        'Accès prioritaire aux acheteurs sérieux',
        'Assistance dédiée de notre équipe support',
      ].map((b: string) => (
        <div key={b} className="flex items-start gap-2.5 mb-3">
          <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-[#4A5568] text-sm">{b}</span>
        </div>
      ))}

      <div className="mt-7 space-y-3">
        {kycDone ? (
          <button
            onClick={onPublish}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Identité vérifiée – Publier l'annonce
          </button>
        ) : (
          <>
            <button
              onClick={onKycClick}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-[#2D6BE4] hover:bg-[#2460CF] transition-all shadow-lg shadow-blue-200"
            >
              Vérifier mon identité maintenant
            </button>
            <p className="text-center text-xs text-[#8B9CB3]">
              Vous serez redirigé vers notre module de vérification sécurisé
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Étape finale : Succès ───────────────────────────────────────────────────
function StepSuccess({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-[#0D1B2A] font-bold text-2xl mb-2">Annonce publiée ! 🎉</h2>
      <p className="text-[#8B9CB3] text-sm leading-relaxed max-w-xs mx-auto mb-8">
        Votre annonce est maintenant visible par des milliers d'acheteurs sérieux à Abidjan et partout en Côte d'Ivoire.
      </p>
      <button
        onClick={onReset}
        className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[#0D1B2A] hover:bg-[#1A2E42] transition-all"
      >
        Déposer une autre annonce
      </button>
    </div>
  )
}

// ─── Props du composant principal ────────────────────────────────────────────
interface PostAdFormProps {
  /** Passer true si l'utilisateur a déjà complété son KYC */
  kycDone?: boolean
  /** Fonction appelée quand l'utilisateur clique "Vérifier mon identité" */
  onKycRedirect?: () => void
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
export function PostAdForm({ kycDone = false, onKycRedirect }: PostAdFormProps) {
  const [step, setStep] = useState<'infos' | 'kyc' | 'success'>('infos')
  const [form, setForm] = useState<FormState>({
    titre: '',
    description: '',
    prix: '',
    categorie: '',
  })

  const isHighRisk = HIGH_RISK_CATEGORIES.includes(form.categorie)
  const totalSteps = isHighRisk ? 3 : 2
  const currentStep = step === 'infos' ? 1 : step === 'kyc' ? 2 : totalSteps

  const handleChange = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleStep1Next = () => {
    if (isHighRisk) { setStep('kyc'); return }
    setStep('success')
  }

  const handleKycRedirect = () => {
    if (onKycRedirect) { onKycRedirect(); return }
    alert('Redirection vers le module KYC...')
  }

  const handleReset = () => {
    setForm({ titre: '', description: '', prix: '', categorie: '' })
    setStep('infos')
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8">
      <StepBar current={currentStep} total={totalSteps} />

      {step === 'infos' && (
        <Step1 form={form} onChange={handleChange} onNext={handleStep1Next} />
      )}

      {step === 'kyc' && (
        <Step2Security
          categorie={form.categorie}
          kycDone={kycDone}
          onKycClick={handleKycRedirect}
          onPublish={() => setStep('success')}
        />
      )}

      {step === 'success' && <StepSuccess onReset={handleReset} />}
    </div>
  )
}
