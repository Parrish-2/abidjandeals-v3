'use client'

// components/AgeGate.tsx
// Modal de vérification d'âge pour les catégories adultes (18+)
// Stocke la confirmation dans sessionStorage (expire à la fermeture du navigateur)

import { AlertTriangle, Shield, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'abidjandeals_age_verified'
const RULES = [
    { ok: true, text: 'Photos de produits sur mannequin ou à plat' },
    { ok: true, text: 'Descriptions sobres et commerciales' },
    { ok: true, text: 'Produits physiques uniquement' },
    { ok: false, text: 'Photos de personnes réelles dénudées' },
    { ok: false, text: 'Contenu sexuellement explicite' },
    { ok: false, text: 'Offres de services (escort, etc.)' },
]

interface AgeGateProps {
    onConfirm: () => void
    onRefuse: () => void
}

export function AgeGate({ onConfirm, onRefuse }: AgeGateProps) {
    const [checked, setChecked] = useState(false)

    // Vérifier si déjà confirmé dans cette session
    useEffect(() => {
        try {
            const verified = sessionStorage.getItem(STORAGE_KEY)
            if (verified === 'true') onConfirm()
        } catch { }
    }, [onConfirm])

    function handleConfirm() {
        if (!checked) return
        try {
            sessionStorage.setItem(STORAGE_KEY, 'true')
        } catch { }
        onConfirm()
    }

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                onClick={onRefuse}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto overflow-hidden">

                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-pink-600 to-rose-700 p-6 text-white text-center">
                        <button
                            onClick={onRefuse}
                            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X size={14} />
                        </button>
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Shield size={28} className="text-white" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-bold mb-2">
                            🔞 Contenu réservé aux adultes
                        </div>
                        <h3 className="text-xl font-extrabold">Lingerie & Accessoires</h3>
                        <p className="text-white/80 text-sm mt-1">Vérification d'âge requise</p>
                    </div>

                    {/* Corps */}
                    <div className="p-6">

                        {/* Règles de publication */}
                        <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                Règles de cette catégorie
                            </p>
                            <div className="space-y-2">
                                {RULES.map((rule, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${rule.ok
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-red-100 text-red-500'
                                            }`}>
                                            {rule.ok ? '✓' : '✕'}
                                        </span>
                                        <p className={`text-xs leading-relaxed ${rule.ok ? 'text-gray-600' : 'text-gray-500'
                                            }`}>
                                            {rule.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Avertissement */}
                        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-5">
                            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Tout contenu violant ces règles sera supprimé et le compte suspendu sans préavis.
                            </p>
                        </div>

                        {/* Confirmation âge */}
                        <label className="flex items-start gap-3 cursor-pointer mb-5 group">
                            <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={e => setChecked(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checked
                                    ? 'bg-pink-600 border-pink-600'
                                    : 'border-gray-300 group-hover:border-pink-400'
                                    }`}>
                                    {checked && <span className="text-white text-[10px] font-bold">✓</span>}
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Je confirme avoir <strong>18 ans ou plus</strong> et accepte les règles de publication de cette catégorie.
                            </p>
                        </label>

                        {/* Boutons */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleConfirm}
                                disabled={!checked}
                                className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${checked
                                    ? 'bg-pink-600 hover:bg-pink-700 text-white hover:scale-[1.01]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                👙 Accéder à Lingerie & Accessoires
                            </button>
                            <button
                                onClick={onRefuse}
                                className="w-full py-2.5 rounded-2xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Non merci, retour
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── Hook utilitaire ─────────────────────────────────────────────────────────
export function useAgeVerified(): boolean {
    try {
        return sessionStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
        return false
    }
}

// Réinitialiser la vérification (pour les tests ou déconnexion)
export function resetAgeVerification(): void {
    try {
        sessionStorage.removeItem(STORAGE_KEY)
    } catch { }
}