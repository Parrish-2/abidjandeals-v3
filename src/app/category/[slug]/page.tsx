'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdCard } from '@/components/AdCard'
import { CategoryBanner } from '@/components/categoryBanner'
import { CITIES, getCategoryById } from '@/lib/data'
import { getCategoryBySlug } from '@/config/categories.config'
import { supabase } from '@/lib/supabase'
import { SlidersHorizontal, Grid3X3, List, X, Lock } from 'lucide-react'
import { useStore } from '@/lib/store'

const CATEGORIES_DEF = [
  { id: 'hightech',       name: 'High-Tech',           icon: '📱' },
  { id: 'auto',           name: 'Automobile',           icon: '🚗' },
  { id: 'immobilier',     name: 'Immobilier',           icon: '🏠' },
  { id: 'location',       name: 'Location & Mobilité',  icon: '🔑' },
  { id: 'services',       name: 'Services & Autres',    icon: '🛠️' },
  { id: 'electromenager', name: 'Électroménager',       icon: '📺' },
  { id: 'bebe',           name: 'Bébé & Mamans',        icon: '👶' },
  { id: 'mode',           name: 'Mode & Beauté',        icon: '👗' },
]

function hasAccess(user: any): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.is_verified === true) return true
  if (user.verified_seller === true) return true
  return false
}

function normalizeAd(ad: any) {
  return {
    ...ad,
    img: ad.photos?.[0] ?? null,
    seller: ad.profiles
      ? `${ad.profiles.prenom ?? ''} ${ad.profiles.nom ?? ''}`.trim() || 'Vendeur'
      : 'Vendeur',
    certified: (ad.profiles?.note ?? 0) >= 4.5,
  }
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { user, setAuthModalOpen, setPendingAction } = useStore()
  const catId = params.slug

  const categoryConfig = useMemo(() => getCategoryBySlug(catId), [catId])

  const categoryLocal = useMemo(() => {
    if (catId === 'all') return null
    return CATEGORIES_DEF.find(c => c.id === catId) ?? getCategoryById?.(catId) ?? null
  }, [catId])

  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'views'>('recent')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedEtat, setSelectedEtat] = useState<string | null>(null)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // 1. Timer de vérification initiale
  useEffect(() => {
    const timer = setTimeout(() => setAuthChecked(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // 2. Gestion de la redirection Auth
  useEffect(() => {
    if (!authChecked) return
    if (user?.role === 'admin' || hasAccess(user)) return
    
    if (!user) {
      setPendingAction(`category_${catId}`)
      setAuthModalOpen(true)
      router.push('/')
      return
    }
    router.push('/vendeur#niveaux')
  }, [authChecked, user, catId, router, setAuthModalOpen, setPendingAction])

  // 3. Fonction de chargement
  async function loadAds() {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('ads')
        .select('id, title, price, photos, city, quartier, category, subcategory, etat, views, created_at, is_boosted, boost_until, profiles(prenom, nom, note)')
        .eq('status', 'active')

      if (catId !== 'all') {
        // Note: Assure-toi que ta colonne dans Supabase est bien 'category_id'
        query = query.eq('category_id', catId)
      }
      
      if (selectedCity) query = query.eq('city', selectedCity)
      if (selectedEtat) query = query.eq('etat', selectedEtat)
      if (priceMin)     query = query.gte('price', parseInt(priceMin))
      if (priceMax)     query = query.lte('price', parseInt(priceMax))

      switch (sortBy) {
        case 'price_asc':  query = query.order('price', { ascending: true });  break
        case 'price_desc': query = query.order('price', { ascending: false }); break
        case 'views':      query = query.order('views', { ascending: false }); break
        default:
          query = query
            .order('is_boosted', { ascending: false })
            .order('created_at', { ascending: false })
      }

      const { data, error: err } = await query.limit(100)
      
      if (err) {
        console.error("Détail Erreur Supabase:", err)
        setError(err.message)
        return
      }

      setAds((data || []).map(normalizeAd))
    } catch (err: any) {
      console.error("Erreur inattendue lors du chargement:", err)
      setError("Une erreur inattendue est survenue.")
    } finally {
      setLoading(false)
    }
  }

  // 4. Déclencheur de chargement (REACTION AU CHANGEMENT DE CATID)
  useEffect(() => {
    if (authChecked && (user?.role === 'admin' || hasAccess(user))) {
      loadAds()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, user, catId, sortBy, selectedCity, selectedEtat, priceMin, priceMax])

  const activeFiltersCount = [selectedCity, selectedEtat, priceMin, priceMax].filter(Boolean).length

  function clearFilters() {
    setSelectedCity(null)
    setSelectedEtat(null)
    setPriceMin('')
    setPriceMax('')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Vérification des accès...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!hasAccess(user) && user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-md">
            <Lock size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="font-bold text-xl text-dark mb-2">Accès réservé aux vendeurs vérifiés</h2>
            <p className="text-gray-500 text-sm mb-6">
              Complétez la vérification de votre compte pour accéder aux annonces.
            </p>
            <button onClick={() => router.push('/vendeur#niveaux')} className="btn-primary">
              Vérifier mon compte →
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {categoryConfig ? (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <CategoryBanner
              category={categoryConfig}
              resultCount={loading ? undefined : ads.length}
            />
          </div>
        ) : (
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <button onClick={() => router.push('/')} className="hover:text-orange-500 transition-colors">
                  Accueil
                </button>
                <span>/</span>
                <span className="text-dark font-medium">{(categoryLocal as any)?.name || 'Toutes les annonces'}</span>
              </nav>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{(categoryLocal as any)?.icon || '🔍'}</span>
                <div>
                  <h1 className="font-sans font-bold text-2xl text-dark">
                    {(categoryLocal as any)?.name || 'Toutes les annonces'}
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {loading ? '...' : `${ads.length} annonce${ads.length > 1 ? 's' : ''} disponible${ads.length > 1 ? 's' : ''}`}
                  </p>
                </div>
                {user?.role === 'admin' && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-full">
                    🛡️ Mode Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'}`}
            >
              <SlidersHorizontal size={15} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${showFilters ? 'bg-white/20' : 'bg-orange-500 text-white'}`}>
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 outline-none focus:border-orange-400 cursor-pointer"
              >
                <option value="recent">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="views">Plus vus</option>
              </select>

              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid3X3 size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ville</label>
                  <select
                    value={selectedCity || ''}
                    onChange={e => setSelectedCity(e.target.value || null)}
                    className="input-field text-sm py-2.5"
                  >
                    <option value="">Toutes les villes</option>
                    {CITIES.slice(1).map(c => {
                      const name = c.split(' ').slice(1).join(' ')
                      return <option key={name} value={name}>{name}</option>
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">État</label>
                  <select
                    value={selectedEtat || ''}
                    onChange={e => setSelectedEtat(e.target.value || null)}
                    className="input-field text-sm py-2.5"
                  >
                    <option value="">Tous les états</option>
                    <option value="Neuf">Neuf</option>
                    <option value="Comme neuf">Comme neuf</option>
                    <option value="Bon état">Bon état</option>
                    <option value="État correct">État correct</option>
                    <option value="Disponible">Disponible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prix min (FCFA)</label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    className="input-field text-sm py-2.5"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prix max (FCFA)</label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    className="input-field text-sm py-2.5"
                    placeholder="Illimité"
                  />
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  <X size={14} /> Effacer tous les filtres
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="text-red-600 font-semibold mb-2">Erreur de chargement</p>
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button onClick={loadAds} className="bg-orange-500 text-white font-bold px-5 py-2.5 rounded-2xl">
                Réessayer
              </button>
            </div>
          ) : ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center px-4">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Aucune annonce dans cette catégorie pour le moment
              </h2>
              <p className="text-gray-500 text-sm mb-6 max-w-md">
                {activeFiltersCount > 0
                  ? 'Aucun résultat avec ces filtres. Essayez de les modifier.'
                  : `Soyez le premier à publier dans ${(categoryLocal as any)?.name || categoryConfig?.labelKey || 'cette catégorie'}.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="btn-ghost">
                    <X size={15} /> Retirer les filtres
                  </button>
                )}
                <button onClick={() => router.push('/publier')} className="btn-primary">
                  📸 Publier une annonce
                </button>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
            }>
              {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}