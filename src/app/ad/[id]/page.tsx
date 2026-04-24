'use client'

import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import {
  AlertTriangle,
  Calendar,
  ChevronLeft, ChevronRight,
  Edit,
  Eye,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface AdProfile {
  id: string
  prenom: string
  nom: string
  avatar_url?: string
  verified_seller?: boolean
  created_at: string
}

interface AdDetail {
  id: string
  title: string
  description: string
  price: number
  city: string
  quartier?: string
  etat?: string
  marque?: string
  tel?: string
  whatsapp?: string
  images: string[]
  video_url?: string
  status: string
  boost_level?: string | null
  views: number
  created_at: string
  user_id: string
  category_id: string
  profiles?: AdProfile | null
}

export default function AdDetailPage() {
  const params = useParams()
  const router = useRouter()
  const adId = params?.id as string
  const { user } = useStore()

  const [ad, setAd] = useState<AdDetail | null>(null)
  // null = pas encore vérifiée | false = introuvable | true = trouvée
  const [found, setFound] = useState<boolean | null>(null)
  // On attend que la session Supabase soit confirmée avant le check d'ownership
  const [sessionUid, setSessionUid] = useState<string | null | undefined>(undefined)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Évite un double-fetch en React Strict Mode
  const loadedIdRef = useRef<string | null>(null)

  // ── Étape 1 : récupérer l'uid de session dès le montage ───────────────────
  // On utilise getSession() (lecture du cache local, pas de réseau) pour avoir
  // l'uid réel AVANT de charger l'annonce et de faire le check d'ownership.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // undefined → pas encore vérifié | null → non connecté | string → connecté
      setSessionUid(session?.user?.id ?? null)
    })
  }, [])

  // ── Étape 2 : charger l'annonce une fois la session connue ─────────────────
  // On dépend de [adId, sessionUid] pour re-tenter si l'auth arrive après le
  // premier render (cas du refresh rapide ou de la navigation client-side).
  useEffect(() => {
    // Attendre que sessionUid soit résolu (undefined = pas encore prêt)
    if (!adId || sessionUid === undefined) return
    // Ne pas recharger si c'est déjà la même annonce ET qu'on a déjà un résultat
    if (loadedIdRef.current === adId && found !== null) return

    loadAd(sessionUid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adId, sessionUid])

  async function loadAd(uid: string | null) {
    loadedIdRef.current = adId
    setFound(null) // reset → affiche le spinner

    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          id, title, description, price, city, quartier,
          etat, marque, tel, whatsapp, images, video_url,
          status, boost_level, views, created_at, user_id, category_id
        `)
        .eq('id', adId)
        .single()

      if (error || !data) {
        setFound(false)
        return
      }

      const adData = data as AdDetail

      // Check d'ownership avec l'uid réel de la session (pas le store qui peut être vide)
      const isOwner = uid && uid === adData.user_id
      const isAdmin = user?.role === 'admin'

      if (adData.status !== 'active' && !isOwner && !isAdmin) {
        // Annonce inactive ET l'utilisateur n'est pas le propriétaire → 404
        setFound(false)
        return
      }

      setAd(adData)
      setFound(true)

      // Incrémenter les vues uniquement pour les annonces actives
      if (adData.status === 'active') {
        supabase
          .from('ads')
          .update({ views: (adData.views || 0) + 1 })
          .eq('id', adId)
          .then(() => { }) // fire and forget
      }
    } catch (err) {
      console.error('loadAd error:', err)
      setFound(false)
    }
  }

  // ─── Helpers photos ────────────────────────────────────────────────────────
  function prevPhoto() {
    if (!ad?.images?.length) return
    setPhotoIndex(i => (i - 1 + ad.images.length) % ad.images.length)
  }
  function nextPhoto() {
    if (!ad?.images?.length) return
    setPhotoIndex(i => (i + 1) % ad.images.length)
  }

  function toggleFav() {
    if (!sessionUid) { toast.error('Connectez-vous pour sauvegarder'); return }
    setIsFav(f => !f)
    toast.success(isFav ? 'Retiré des favoris' : 'Ajouté aux favoris')
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: ad?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié !')
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette annonce définitivement ?')) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adId, images: ad?.images || [] }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(`Erreur: ${json.error}`); return }
      toast.success('Annonce supprimée')
      router.push(user?.role === 'admin' ? '/admin/moderation' : '/dashboard')
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  function formatPrice(p: number) {
    return new Intl.NumberFormat('fr-CI').format(p) + ' FCFA'
  }
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }
  function timeAgo(iso: string) {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return 'Hier'
    if (days < 7) return `Il y a ${days} jours`
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? 's' : ''}`
    return formatDate(iso)
  }

  // ─── États d'affichage ─────────────────────────────────────────────────────

  // Spinner : session pas encore vérifiée OU annonce en cours de chargement
  if (sessionUid === undefined || found === null) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-orange-500" />
        </div>
        <Footer />
      </div>
    )
  }

  if (found === false || !ad) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <AlertTriangle size={48} className="text-orange-400" />
          <h1 className="text-xl font-bold text-gray-800">Annonce introuvable</h1>
          <p className="text-gray-500 text-sm">Cette annonce n'existe pas ou a été supprimée.</p>
          <Link href="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-2xl font-semibold text-sm hover:bg-orange-600 transition">
            Retour à l'accueil
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  // Ownership calculé avec sessionUid (garanti à jour, pas le store)
  const isOwner = !!(sessionUid && sessionUid === ad.user_id)
  const isAdmin = user?.role === 'admin'
  const canEdit = isOwner || isAdmin

  const images = ad.images?.length ? ad.images : []
  const profile = ad.profiles ?? null
  const sellerName = profile ? `${profile.prenom} ${profile.nom}`.trim() : 'Vendeur'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">

        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-orange-500 transition">Accueil</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate">{ad.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Colonne principale ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Galerie */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100">
                {images.length > 0 ? (
                  <>
                    <img src={images[photoIndex]} alt={ad.title} className="w-full h-full object-cover" />
                    {images.length > 1 && (
                      <>
                        <button onClick={prevPhoto} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition">
                          <ChevronLeft size={18} />
                        </button>
                        <button onClick={nextPhoto} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition">
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button key={i} onClick={() => setPhotoIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === photoIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
                          ))}
                        </div>
                      </>
                    )}
                    {ad.boost_level && (
                      <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white ${ad.boost_level === 'URGENT' ? 'bg-red-500' : ad.boost_level === 'PREMIUM' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        {ad.boost_level}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">📷</div>
                )}

                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={toggleFav} className={`w-9 h-9 rounded-full shadow flex items-center justify-center transition ${isFav ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:bg-white'}`}>
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={share} className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-500 hover:bg-white transition">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {images.length > 1 && (
                <div className="p-3 flex gap-2 overflow-x-auto">
                  {images.map((src, i) => (
                    <button key={i} onClick={() => setPhotoIndex(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === photoIndex ? 'border-orange-500' : 'border-transparent'}`}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vidéo */}
            {ad.video_url && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3">🎬 Vidéo</h3>
                <video src={ad.video_url} controls className="w-full rounded-xl" style={{ maxHeight: 320 }} />
              </div>
            )}

            {/* Détails */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900 leading-tight">{ad.title}</h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <MapPin size={13} className="text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-500">{ad.quartier ? `${ad.quartier}, ` : ''}{ad.city}</span>
                    <span className="text-gray-300">·</span>
                    <Calendar size={13} className="text-gray-400" />
                    <span className="text-sm text-gray-400">{timeAgo(ad.created_at)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-extrabold text-orange-500">{formatPrice(ad.price)}</p>
                  {ad.etat && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{ad.etat}</span>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {ad.marque && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">🏷️ {ad.marque}</span>
                )}
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full flex items-center gap-1">
                  <Eye size={11} /> {ad.views} vues
                </span>
                {ad.status === 'active' && (
                  <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">✓ Annonce vérifiée</span>
                )}
                {ad.status !== 'active' && canEdit && (
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${ad.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'}`}>
                    {ad.status === 'pending' ? '⏳ En attente de validation' : '❌ Rejetée'}
                  </span>
                )}
              </div>

              {ad.description && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{ad.description}</p>
                </div>
              )}
            </div>

            {/* Actions owner/admin */}
            {canEdit && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <Shield size={16} className="text-amber-600 flex-shrink-0" />
                <span className="text-sm text-amber-700 font-medium flex-1">
                  {isAdmin && !isOwner ? "Vous modérez cette annonce en tant qu'admin" : 'Votre annonce'}
                </span>
                <div className="flex gap-2">
                  <Link href={`/ad/${adId}/edit`} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-sm text-amber-700 font-medium hover:bg-amber-50 transition">
                    <Edit size={13} /> Modifier
                  </Link>
                  <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium hover:bg-red-100 transition disabled:opacity-50">
                    {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Colonne vendeur ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 overflow-hidden">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span>V</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-gray-900 truncate">{sellerName}</p>
                    {profile?.verified_seller && <span className="text-orange-500 text-xs">✓</span>}
                  </div>
                  {profile?.created_at && (
                    <p className="text-xs text-gray-400">
                      Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {ad.tel && (
                  <a href={`tel:${ad.tel}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition">
                    <Phone size={16} /> Appeler
                  </a>
                )}
                {(ad.whatsapp || ad.tel) && (
                  <a
                    href={`https://wa.me/${(ad.whatsapp || ad.tel)?.replace(/[\s+]/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">🔒 Ne payez jamais à l'avance sans voir le produit</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={15} className="text-blue-500" />
                <p className="text-sm font-semibold text-blue-700">Conseils de sécurité</p>
              </div>
              <ul className="text-xs text-blue-600 space-y-1 list-none">
                <li>• Rencontrez le vendeur en lieu public</li>
                <li>• Vérifiez le produit avant paiement</li>
                <li>• Méfiez-vous des prix trop bas</li>
                <li>• Ne transférez pas d'argent à l'avance</li>
              </ul>
            </div>

            <button className="w-full text-xs text-gray-400 hover:text-red-400 transition py-2">
              🚩 Signaler cette annonce
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
