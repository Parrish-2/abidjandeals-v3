'use client'
import { useState, useEffect } from 'react'
import { Zap, X, Phone, CheckCircle, Loader2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type BoostPack = {
  id: string
  label: string
  badge: string
  price: number
  duration: number
  description: string
  perks: string[]
  color: string
  bg: string
  border: string
  ring: string
  popular?: boolean
}

type PaymentOperator = {
  id: string
  name: string
  logo: string
}

type Props = {
  adId: string
  adTitle: string
  userId: string
  onClose: () => void
  onSuccess?: () => void
}

// ─── Packs exportés (utilisés aussi dans publier/page.tsx) ────────────────────
export const BOOST_PACKS: BoostPack[] = [
  {
    id: 'urgent',
    label: 'Urgent',
    badge: '🔴',
    price: 2500,
    duration: 7,
    description: 'Badge Urgent visible sur votre annonce',
    perks: [
      "Badge 🔴 Urgent pendant 7 jours",
      "Attire l'attention immédiatement",
      "Idéal pour vendre vite",
    ],
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ring: 'ring-red-300',
  },
  {
    id: 'top',
    label: 'Top de Liste',
    badge: '⚡',
    price: 7000,
    duration: 7,
    description: 'Remonte en 1ère position chaque matin',
    perks: [
      "Remontée automatique chaque matin",
      "Toujours en tête des résultats",
      "Visible par tous les acheteurs actifs",
    ],
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    ring: 'ring-orange-300',
    popular: true,
  },
  {
    id: 'vedette',
    label: 'Vedette',
    badge: '⭐',
    price: 20000,
    duration: 15,
    description: 'Affichage prioritaire partout sur le site',
    perks: [
      "Page d'accueil pendant 15 jours",
      "En tête de toutes les recherches",
      "Badge ⭐ Vedette exclusif",
    ],
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    ring: 'ring-amber-300',
  },
]

const OPERATORS: PaymentOperator[] = [
  { id: 'wave',   name: 'Wave',         logo: '🌊' },
  { id: 'orange', name: 'Orange Money', logo: '🟠' },
  { id: 'mtn',    name: 'MTN MoMo',     logo: '💛' },
  { id: 'moov',   name: 'Moov Money',   logo: '🔵' },
]

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti() {
  const colors = ['#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6', '#a855f7']
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {Array.from({ length: 36 }, (_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: colors[i % colors.length],
            animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function BoostModal({ adId, adTitle, userId, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'pack' | 'payment' | 'success'>('pack')
  const [selectedPack, setSelectedPack] = useState<BoostPack | null>(null)
  const [selectedOperator, setSelectedOperator] = useState<PaymentOperator | null>(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  const STEPS_ORDER = ['pack', 'payment', 'success']
  const currentStepIndex = STEPS_ORDER.indexOf(step)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function formatPhone(value: string) {
    return value.replace(/\D/g, '').slice(0, 10)
  }

  // ─── handlePayment — appel serveur /api/boost (clés CinetPay invisibles client) ──
  async function handlePayment() {
    if (!selectedPack || !selectedOperator || !phone) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (phone.length < 8) {
      setError('Veuillez entrer un numéro valide (min. 8 chiffres).')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId,
          boostType: selectedPack.id,
          amount:    selectedPack.price,
          phone,
          operator:  selectedOperator.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'initialisation du paiement.")
        return
      }

      // Rediriger vers la page de paiement CinetPay
      // Le webhook Supabase activera le boost automatiquement après confirmation
      window.location.href = data.paymentUrl

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showConfetti && <Confetti />}

      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={e => { if (e.target === e.currentTarget && !loading) onClose() }}
      >
        {/* Modal */}
        <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

          {/* ── Header gradient orange ── */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 pt-5 pb-4 flex-shrink-0">
            {!loading && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X size={15} className="text-white" />
              </button>
            )}

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <h2 className="text-white font-bold text-base">Booster mon annonce</h2>
            </div>
            <p className="text-orange-100 text-xs truncate max-w-[280px]">📌 {adTitle}</p>

            {/* Indicateur d'étapes */}
            <div className="flex items-center gap-2 mt-3.5">
              {STEPS_ORDER.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    step === s
                      ? 'bg-white text-orange-500'
                      : currentStepIndex > i
                      ? 'bg-white/40 text-white'
                      : 'bg-white/15 text-white/40'
                  }`}>
                    {currentStepIndex > i ? '✓' : i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`w-8 h-px rounded ${currentStepIndex > i ? 'bg-white/60' : 'bg-white/20'}`} />
                  )}
                </div>
              ))}
              <span className="ml-1 text-white/70 text-xs">
                {step === 'pack' ? 'Forfait' : step === 'payment' ? 'Paiement' : 'Confirmation'}
              </span>
            </div>
          </div>

          {/* ── Contenu scrollable ── */}
          <div className="flex-1 overflow-y-auto">

            {/* ══ ÉTAPE 1 : Choix du pack ══ */}
            {step === 'pack' && (
              <div className="p-5 space-y-3">
                <p className="text-sm text-gray-500 mb-1">Choisissez votre forfait de mise en avant :</p>
                {BOOST_PACKS.map(pack => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPack(pack)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all relative ${
                      selectedPack?.id === pack.id
                        ? `${pack.border} ${pack.bg} ring-2 ${pack.ring} ring-offset-1`
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-2.5 left-4 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        ⚡ POPULAIRE
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${pack.bg} flex items-center justify-center flex-shrink-0 text-xl mt-0.5`}>
                          {pack.badge}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-gray-900 text-sm">{pack.label}</span>
                            <span className="text-xs text-gray-400">{pack.duration} jours</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{pack.description}</p>
                          <ul className="space-y-0.5">
                            {pack.perks.map((perk, i) => (
                              <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                                <CheckCircle size={11} className={pack.color} />
                                {perk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className={`font-bold text-base ${pack.color}`}>
                          {pack.price.toLocaleString('fr')}
                        </div>
                        <div className="text-xs text-gray-400">FCFA</div>
                      </div>
                    </div>

                    {selectedPack?.id === pack.id && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ══ ÉTAPE 2 : Paiement ══ */}
            {step === 'payment' && selectedPack && (
              <div className="p-5 space-y-5">

                {/* Récap pack */}
                <div className={`rounded-2xl ${selectedPack.bg} ${selectedPack.border} border p-4 flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl flex-shrink-0">
                    {selectedPack.badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">Pack {selectedPack.label}</p>
                    <p className="text-xs text-gray-500 truncate">{selectedPack.duration} jours · {selectedPack.description}</p>
                  </div>
                  <div className={`font-bold text-sm ${selectedPack.color} flex-shrink-0`}>
                    {selectedPack.price.toLocaleString('fr')} F
                  </div>
                </div>

                {/* Opérateurs */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2.5">Mode de paiement</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {OPERATORS.map(op => (
                      <button
                        key={op.id}
                        onClick={() => setSelectedOperator(op)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                          selectedOperator?.id === op.id
                            ? 'border-orange-400 bg-orange-50 shadow-sm'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <span className="text-2xl">{op.logo}</span>
                        <span className="text-xs font-semibold text-gray-700 text-left leading-tight">{op.name}</span>
                        {selectedOperator?.id === op.id && (
                          <CheckCircle size={13} className="text-orange-500 ml-auto flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Numéro {selectedOperator ? selectedOperator.name : 'Mobile Money'}
                  </label>
                  <div className={`flex items-center gap-2 border-2 rounded-xl px-4 py-3 transition-all bg-white ${
                    error ? 'border-red-300' : 'border-gray-200 focus-within:border-orange-400'
                  }`}>
                    <Phone size={15} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-400 text-sm font-medium">+225</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="07 00 00 00 00"
                      value={phone}
                      onChange={e => { setPhone(formatPhone(e.target.value)); setError('') }}
                      className="flex-1 outline-none text-sm text-gray-800 bg-transparent placeholder:text-gray-300"
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      ⚠️ {error}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-400 text-center">
                  🔒 Paiement sécurisé via CinetPay · Activation automatique après confirmation
                </p>
              </div>
            )}

            {/* ══ ÉTAPE 3 : Succès ══ */}
            {step === 'success' && (
              <div className="p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
                <div className="w-20 h-20 rounded-full bg-orange-50 border-4 border-orange-200 flex items-center justify-center mb-5">
                  <Zap size={36} className="text-orange-500 fill-orange-400" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">🎉 Annonce boostée !</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-1">
                  Votre annonce est maintenant boostée avec le pack{' '}
                  <span className="font-semibold text-orange-500">{selectedPack?.label}</span>.
                </p>
                <p className="text-gray-400 text-xs mb-6">
                  Activation effective dans quelques instants ⚡
                </p>
                {selectedPack && (
                  <div className="w-full bg-orange-50 rounded-2xl p-4 border border-orange-100 text-left space-y-2">
                    {selectedPack.perks.map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle size={13} className="text-orange-400 flex-shrink-0" />
                        {perk}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer actions ── */}
          <div className="px-5 pb-6 pt-3 border-t border-gray-100 flex-shrink-0 bg-white">

            {step === 'pack' && (
              <button
                onClick={() => { if (selectedPack) setStep('payment') }}
                disabled={!selectedPack}
                className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Zap size={15} className={selectedPack ? 'fill-white' : ''} />
                {selectedPack
                  ? `Continuer · ${selectedPack.price.toLocaleString('fr')} FCFA`
                  : 'Sélectionnez un forfait'}
              </button>
            )}

            {step === 'payment' && (
              <div className="space-y-2.5">
                <button
                  onClick={handlePayment}
                  disabled={loading || !selectedOperator || phone.length < 8}
                  className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Initialisation du paiement…</>
                  ) : (
                    <><Zap size={15} className="fill-white" /> Payer {selectedPack?.price.toLocaleString('fr')} FCFA via CinetPay</>
                  )}
                </button>
                <button
                  onClick={() => { if (!loading) setStep('pack') }}
                  disabled={loading}
                  className="w-full py-2.5 rounded-2xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  ← Changer de forfait
                </button>
              </div>
            )}

            {step === 'success' && (
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all"
              >
                Voir mon tableau de bord 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default BoostModal
