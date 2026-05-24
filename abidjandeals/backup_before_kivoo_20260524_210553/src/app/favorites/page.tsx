'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AdCard } from '@/components/AdCard'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { Heart, Trash2 } from 'lucide-react'

export default function FavoritesPage() {
  const router         = useRouter()
  const { user, setAuthModalOpen } = useStore()
  const [ads, setAds]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setAuthModalOpen(true); router.push('/'); return }
    loadFavorites()
  }, [user])

  async function loadFavorites() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('favorites')
      .select('ad_id, ads(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setAds((data || []).map((f: any) => f.ads).filter(Boolean))
    setLoading(false)
  }

  async function removeFavorite(adId: string) {
    if (!user) return
    await supabase.from('favorites').delete().eq('user_id', user.id).eq('ad_id', adId)
    setAds(prev => prev.filter(a => a.id !== adId))
  }

  async function clearAll() {
    if (!user) return
    await supabase.from('favorites').delete().eq('user_id', user.id)
    setAds([])
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-sans font-bold text-2xl text-dark flex items-center gap-3">
              <Heart size={24} className="text-red-500 fill-current" /> Mes favoris
            </h1>
            <p className="text-gray-500 text-sm mt-1">{ads.length} annonce{ads.length > 1 ? 's' : ''} sauvegardée{ads.length > 1 ? 's' : ''}</p>
          </div>
          {ads.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors">
              <Trash2 size={14} /> Tout supprimer
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({length: 4}).map((_,i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : ads.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ads.map(ad => (
              <div key={ad.id} className="relative group">
                <AdCard ad={ad} />
                <button onClick={() => removeFavorite(ad.id)}
                  className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                  title="Retirer des favoris">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Heart size={64} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark mb-2">Aucun favori</h2>
            <p className="text-gray-500 mb-6">Cliquez sur le ❤️ d'une annonce pour la sauvegarder ici</p>
            <Link href="/" className="btn-primary">Parcourir les annonces</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
