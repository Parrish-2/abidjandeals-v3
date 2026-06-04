'use client'

import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, KeyRound, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
    onClose: () => void
}

export function ChangePasswordModal({ onClose }: Props) {
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [showConf, setShowConf] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (newPwd.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères')
            return
        }
        if (newPwd !== confirmPwd) {
            toast.error('Les mots de passe ne correspondent pas')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPwd })
            if (error) {
                toast.error('Erreur : ' + error.message)
                return
            }
            toast.success('Mot de passe modifié avec succès ✅')
            onClose()
        } catch {
            toast.error('Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                            <KeyRound size={18} className="text-orange-500" />
                        </div>
                        <h2 className="font-bold text-gray-900">Changer le mot de passe</h2>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                    {/* Nouveau mot de passe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPwd}
                                onChange={e => setNewPwd(e.target.value)}
                                required
                                minLength={8}
                                placeholder="Min. 8 caractères"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmer */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showConf ? 'text' : 'password'}
                                value={confirmPwd}
                                onChange={e => setConfirmPwd(e.target.value)}
                                required
                                placeholder="Répétez le mot de passe"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                            />
                            <button type="button" onClick={() => setShowConf(!showConf)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Indicateur de correspondance */}
                        {confirmPwd && (
                            <p className={`text-xs mt-1 ${newPwd === confirmPwd ? 'text-green-500' : 'text-red-400'}`}>
                                {newPwd === confirmPwd ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                            </p>
                        )}
                    </div>

                    {/* Indicateur de force */}
                    {newPwd && (
                        <div>
                            <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${newPwd.length >= i * 3
                                            ? i <= 1 ? 'bg-red-400'
                                                : i <= 2 ? 'bg-orange-400'
                                                    : i <= 3 ? 'bg-yellow-400'
                                                        : 'bg-green-400'
                                            : 'bg-gray-100'
                                        }`} />
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {newPwd.length < 6 ? 'Trop court' : newPwd.length < 9 ? 'Moyen' : newPwd.length < 12 ? 'Bon' : 'Excellent'}
                            </p>
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition">
                            {loading ? <><Loader2 size={15} className="animate-spin" /> Modification...</> : 'Modifier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
