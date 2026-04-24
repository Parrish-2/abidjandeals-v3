'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdCard } from '@/components/AdCard'
import { supabase } from '@/lib/supabase'
import { Star, Shield, Package, Eye, CheckCircle, ArrowLeft } from 'lucide-react'

export default function BoutiquePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [profile, setProfile]   = useState<any>(null)
  const [ads,     setAds]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadBoutique()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug])

  async function loadBoutique() {
    setLoading(true)

    // 1. Charger le profil du vendeur via boutique_slug
    const { data: vendor, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('boutique_slug', params.slug)
      .eq('boutique_active', true)
      .single()

    if (error || !vendor) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(vendor)

    // 2. Charger les annonces actives de ce vendeur
    const { data: vendorAds } = await supabase
      .from('ads')
      .select('id, title, price, photos, city, category, views, created_at')
      .eq('user_id', vendor.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    setAds(vendorAds || [])
    setLoading(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Chargement de la boutique...</p>
        </div>
      </main>
      <Footer />
    </div>
  )

  // ── 404 boutique ───────────────────────────────────────────────────────────
  if (notFound) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-md">
          <p className="text-6xl mb-4">🏪</p>
          <h2 className="font-bold text-xl text-gray-900 mb-2">Boutique introuvable</h2>
          <p className="text-gray-500 text-sm mb-6">
            Cette boutique n'existe pas ou n'est pas encore active.
          </p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Retour à l'accueil
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )

  const totalViews = ads.reduce((sum, ad) => sum + (ad.views || 0), 0)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">

        {/* ── Bannière ─────────────────────────────────────────────────────── */}
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {profile.banner_url ? (
            <img
              src={profile.banner_url}
              alt="Bannière boutique"
              className="w-full h-full object-cover"
            />
          ) : (
            // Bannière par défaut avec motif
            <div className="w-full h-full bg-gradient-to-br from-orange-500/20 via-gray-800 to-gray-900 flex items-center justify-center">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
              />
            </div>
          )}
          {/* Overlay dégradé bas */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Bouton retour */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-black/50 transition-colors"
          >
            <ArrowLeft size={15} /> Retour
          </button>
        </div>

        {/* ── Header boutique ───────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative -mt-16 mb-6 flex items-end gap-5">

            {/* Logo / Avatar */}
            <div className="relative flex-shrink-0">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Logo boutique"
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-white shadow-xl flex items-center justify-center text-white font-extrabold text-4xl">
                  {(profile.boutique_name || profile.prenom)?.[0]?.toUpperCase() || '🏪'}
                </div>
              )}
              {/* Badge vérifié */}
              {(profile.verified_seller || profile.account_level === 'confirmed') && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white">
                  <CheckCircle size={14} />
                </div>
              )}
            </div>

            {/* Infos boutique */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-2xl text-gray-900">
                  {profile.boutique_name || `Boutique de ${profile.prenom}`}
                </h1>
                {(profile.verified_seller || profile.account_level === 'confirmed') && (
                  <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                    <Shield size={11} /> Vendeur Vérifié
                  </span>
                )}
                {profile.honor_badge && (
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                    ⭐ Honor Badge
                  </span>
                )}
              </div>
              {profile.boutique_description && (
                <p className="text-gray-500 text-sm mt-1">{profile.boutique_description}</p>
              )}
            </div>
          </div>

          {/* ── Stats ─────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Package, value: ads.length, label: 'Annonces actives' },
              { icon: Eye,     value: totalViews, label: 'Vues totales' },
              { icon: Star,    value: profile.note ? profile.note.toFixed(1) : '5.0', label: 'Note vendeur' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
                <stat.icon size={18} className="text-orange-500 mx-auto mb-1" />
                <p className="font-extrabold text-xl text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Annonces ──────────────────────────────────────────────────── */}
          <div className="mb-12">
            <h2 className="font-bold text-lg text-gray-900 mb-4">
              Toutes les annonces
              <span className="ml-2 text-sm font-normal text-gray-400">({ads.length})</span>
            </h2>

            {ads.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-gray-500">Aucune annonce active pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}