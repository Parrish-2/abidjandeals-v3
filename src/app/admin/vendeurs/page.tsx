'use client'
// src/app/admin/vendeurs/page.tsx
// ✅ Aucune mutation Supabase directe — tout passe par /api/admin/vendors
// ✅ Pas de vérification de rôle côté client — le middleware et l'API s'en chargent

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { LogOut, ArrowLeft, CheckCircle, Star, Award, User, Store, ExternalLink } from 'lucide-react'

interface Vendor {
  id: string
  prenom: string
  nom: string
  email: string
  tel?: string
  level: string
  account_level?: string
  role: string
  verified_seller: boolean
  trust_badge: boolean
  verification_requested: boolean
  verification_requested_at?: string
  note: number
  nb_annonces: number
  created_at: string
  boutique_slug?: string
  boutique_name?: string
  boutique_active?: boolean
  logo_url?: string
}

const LEVEL_CONFIG = {
  basic:     { label: 'Basic',     color: 'bg-gray-100 text-gray-600',       next: 'confirmed' },
  confirmed: { label: 'Confirmé',  color: 'bg-blue-100 text-blue-600',       next: 'certified' },
  certified: { label: 'Certifié',  color: 'bg-emerald-100 text-emerald-600', next: null },
}

// ✅ Toutes les mutations passent par la route API sécurisée
async function adminAction(action: string, vendorId: string) {
  const res = await fetch('/api/admin/vendors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, vendorId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erreur serveur')
  return data
}

export default function AdminVendeursPage() {
  const router = useRouter()
  const [vendors, setVendors]         = useState<Vendor[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState<'all' | 'requested' | 'verified' | 'boutiques'>('requested')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // ✅ Fetch via l'API route — le serveur vérifie le rôle à chaque appel
  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/vendors?filter=${filter}`)
      if (res.status === 403) { router.push('/'); return }
      if (!res.ok) { toast.error('Erreur de chargement'); return }
      const data = await res.json()
      setVendors(data.vendors ?? [])
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [filter, router])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  // ─── Actions ──────────────────────────────────────────────────────────────

  const approveVerification = async (vendor: Vendor) => {
    setProcessingId(vendor.id)
    try {
      const data = await adminAction('approve_verification', vendor.id)
      toast.success(`✅ ${vendor.prenom} est maintenant ${data.nextLevel} — boutique débloquée !`)
      setVendors(prev => prev.filter(v => v.id !== vendor.id))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setProcessingId(null)
    }
  }

  const rejectVerification = async (vendor: Vendor) => {
    if (!confirm(`Refuser la demande de ${vendor.prenom} ?`)) return
    setProcessingId(vendor.id)
    try {
      await adminAction('reject_verification', vendor.id)
      toast.success(`❌ Demande de ${vendor.prenom} refusée`)
      setVendors(prev => prev.filter(v => v.id !== vendor.id))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setProcessingId(null)
    }
  }

  const toggleTrustBadge = async (vendor: Vendor) => {
    setProcessingId(vendor.id)
    try {
      const data = await adminAction('toggle_trust_badge', vendor.id)
      toast.success(data.trust_badge
        ? `⭐ Badge activé pour ${vendor.prenom}`
        : `Badge retiré à ${vendor.prenom}`)
      setVendors(prev => prev.map(v =>
        v.id === vendor.id ? { ...v, trust_badge: data.trust_badge } : v
      ))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setProcessingId(null)
    }
  }

  const upgradeLevel = async (vendor: Vendor) => {
    const cfg = LEVEL_CONFIG[vendor.level as keyof typeof LEVEL_CONFIG]
    if (!cfg?.next) { toast.error('Niveau maximum atteint'); return }
    if (!confirm(`Passer ${vendor.prenom} au niveau ${cfg.next} ?`)) return

    setProcessingId(vendor.id)
    try {
      const data = await adminAction('upgrade_level', vendor.id)
      toast.success(`✅ ${vendor.prenom} est maintenant ${data.level}`)
      setVendors(prev => prev.map(v =>
        v.id === vendor.id ? { ...v, level: data.level, account_level: data.account_level } : v
      ))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setProcessingId(null)
    }
  }

  const toggleBoutique = async (vendor: Vendor) => {
    setProcessingId(vendor.id)
    try {
      const data = await adminAction('toggle_boutique', vendor.id)
      toast.success(data.boutique_active
        ? `🪟 Boutique de ${vendor.prenom} activée`
        : `Boutique de ${vendor.prenom} désactivée`)
      setVendors(prev => prev.map(v =>
        v.id === vendor.id ? { ...v, boutique_active: data.boutique_active } : v
      ))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setProcessingId(null)
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <header
        className="bg-white border-b border-gray-200 px-4 flex items-center justify-between"
        style={{ height: 60, position: 'sticky', top: 0, zIndex: 40 }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            style={{ textDecoration: 'none', fontWeight: 800, fontSize: 16, color: '#111827', letterSpacing: '-0.4px', flexShrink: 0 }}
          >
            Abidjan<span style={{ color: '#F97316' }}>Deals</span>
          </Link>

          <div style={{ width: 1, height: 20, background: '#e5e7eb', flexShrink: 0 }} />

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{
              color: '#fb7185',
              background: 'rgba(251,113,133,0.10)',
              border: '1px solid rgba(251,113,133,0.25)',
              borderRadius: 8, padding: '5px 10px',
              textDecoration: 'none', flexShrink: 0,
            }}
          >
            <LogOut size={13} strokeWidth={2.2} aria-hidden="true" />
            Quitter le Dashboard
          </Link>

          <div style={{ marginLeft: 4 }} className="hidden sm:block">
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#F97316',
              background: 'rgba(249,115,22,0.12)', borderRadius: 20,
              padding: '2px 8px', letterSpacing: '0.07em',
              textTransform: 'uppercase', display: 'inline-block', marginBottom: 1,
            }}>
              Administration
            </div>
            <h1 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>
              Gestion Vendeurs
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft size={13} /> Retour Admin
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs text-red-400 hover:text-red-500 px-2 py-1.5 transition"
            aria-label="Se déconnecter"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-3 py-4">

        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {[
            { key: 'requested', label: '⏳ Demandes'  },
            { key: 'verified',  label: '✅ Vérifiés'  },
            { key: 'boutiques', label: '🪟 Boutiques' },
            { key: 'all',       label: '👥 Tous'      },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.key ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
          <span className="ml-auto bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 flex-shrink-0">
            {vendors.length} vendeur{vendors.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">Aucun vendeur dans cette catégorie</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map(vendor => {
              const levelConfig = LEVEL_CONFIG[vendor.level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.basic
              const isConfirmed = vendor.level === 'confirmed' || vendor.level === 'certified'

              return (
                <div key={vendor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        {vendor.logo_url ? (
                          <img src={vendor.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                            {vendor.prenom?.[0]?.toUpperCase() || 'V'}
                          </div>
                        )}
                        {vendor.verified_seller && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-white">
                            <CheckCircle size={10} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">{vendor.prenom} {vendor.nom}</p>
                          {vendor.trust_badge && (
                            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                              <Award size={10} /> Badge Confiance
                            </span>
                          )}
                          {vendor.boutique_active && vendor.boutique_slug && (
                            <a
                              href={`/boutique/${vendor.boutique_slug}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold hover:bg-emerald-200 transition-colors"
                            >
                              <Store size={9} /> Boutique active <ExternalLink size={9} />
                            </a>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5">{vendor.email}</p>
                        {vendor.tel && <p className="text-xs text-gray-400">{vendor.tel}</p>}
                        {isConfirmed && vendor.boutique_name && (
                          <p className="text-xs text-emerald-600 mt-0.5 font-medium">🪟 {vendor.boutique_name}</p>
                        )}

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${levelConfig.color}`}>
                            {levelConfig.label}
                          </span>
                          {vendor.account_level && vendor.account_level !== vendor.level && (
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                              acc: {vendor.account_level}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User size={10} /> {vendor.nb_annonces || 0} annonces
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Star size={10} /> {vendor.note?.toFixed(1) || '5.0'}
                          </span>
                        </div>

                        {vendor.verification_requested && (
                          <div className="mt-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                            <p className="text-xs font-semibold text-orange-700">⏳ Demande de vérification en attente</p>
                            {vendor.verification_requested_at && (
                              <p className="text-xs text-orange-500 mt-0.5">
                                {new Date(vendor.verification_requested_at).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleTrustBadge(vendor)}
                      disabled={processingId === vendor.id}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 ${
                        vendor.trust_badge
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                      }`}
                    >
                      <Award size={12} />
                      {vendor.trust_badge ? 'Retirer badge' : 'Badge confiance'}
                    </button>

                    {levelConfig.next && (
                      <button
                        onClick={() => upgradeLevel(vendor)}
                        disabled={processingId === vendor.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={12} /> Passer en {levelConfig.next}
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => toggleBoutique(vendor)}
                        disabled={processingId === vendor.id}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 ${
                          vendor.boutique_active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        <Store size={12} />
                        {vendor.boutique_active ? 'Désactiver boutique' : 'Activer boutique'}
                      </button>
                    )}

                    {vendor.verification_requested && (
                      <>
                        <button
                          onClick={() => rejectVerification(vendor)}
                          disabled={processingId === vendor.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 ml-auto"
                        >
                          ❌ Refuser
                        </button>
                        <button
                          onClick={() => approveVerification(vendor)}
                          disabled={processingId === vendor.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                          {processingId === vendor.id
                            ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : '✅'
                          } Approuver → Confirmé
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
