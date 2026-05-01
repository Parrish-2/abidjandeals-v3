'use client'
import { Footer } from '@/components/Footer'
import { HybridGallery } from '@/components/HybridGallery'
import { Navbar } from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, Calendar, Edit, Eye, Heart, Loader2, MapPin, MessageCircle, Phone, Share2, Shield, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function AdDetailPage() {
    const params = useParams()
    const router = useRouter()
    const adId = params?.id as string
    const [ad, setAd] = useState<any>(null)
    const [found, setFound] = useState<boolean | null>(null)
    const [sessionUid, setSessionUid] = useState<string | null>(null)
    const [isFav, setIsFav] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        async function loadAd() {
            if (!adId) return
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setSessionUid(session?.user?.id ?? null)
                const { data, error } = await supabase
                    .from('ads')
                    .select('*')
                    .eq('id', adId)
                    .maybeSingle()
                if (error) { setFound(false); return }
                if (!data) { setFound(false); return }
                setAd(data)
                setFound(true)
                if (data.status === 'active') {
                    await supabase.from('ads').update({ views: (data.views || 0) + 1 }).eq('id', adId)
                }
            } catch (err) {
                setFound(false)
            }
        }
        loadAd()
    }, [adId])

    function formatPrice(p: number) {
        if (!p && p !== 0) return 'Prix non specifie'
        return new Intl.NumberFormat('fr-CI').format(p) + ' FCFA'
    }

    function timeAgo(iso: string) {
        if (!iso) return ''
        try {
            const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
            if (days === 0) return "Aujourd'hui"
            if (days === 1) return 'Hier'
            if (days < 7) return `Il y a ${days} jours`
            return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        } catch (e) { return '' }
    }

    function share() {
        if (!ad) return
        if (navigator.share) {
            navigator.share({ title: ad.title, url: window.location.href })
        } else {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Lien copie !')
        }
    }

    async function handleDelete() {
        if (!confirm('Supprimer cette annonce ?')) return
        setDeleting(true)
        try {
            const res = await fetch('/api/admin/ads', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: adId, images: ad?.images || [] }),
            })
            if (res.ok) { toast.success('Supprimee'); router.push('/dashboard') }
            else toast.error('Erreur lors de la suppression')
        } catch (err) {
            toast.error('Erreur reseau')
        } finally {
            setDeleting(false)
        }
    }

    // ── Génère le lien WhatsApp avec message pré-rempli ──────────────────────
    function buildWhatsAppUrl() {
        if (!ad) return '#'
        const number = (ad.whatsapp || ad.tel)?.replace(/[\s+]/g, '')
        if (!number) return '#'
        const message = encodeURIComponent(
            `Bonjour, je suis intéressé(e) par votre annonce "${ad.title}" sur AbidjanDeals. Est-ce encore disponible ?`
        )
        return `https://wa.me/${number}?text=${message}`
    }

    if (found === null) return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 size={36} className="animate-spin text-orange-500" />
            </div>
            <Footer />
        </div>
    )

    if (found === false || !ad) return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <AlertTriangle size={48} className="text-orange-400" />
                <h1 className="text-xl font-bold">Annonce introuvable</h1>
                <p className="text-gray-500">Cette annonce n'existe plus ou a ete supprimee.</p>
                <Link href="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-2xl font-semibold text-sm">
                    Retour accueil
                </Link>
            </div>
            <Footer />
        </div>
    )

    const images = ad.images?.length ? ad.images : []
    const isOwner = !!(sessionUid && sessionUid === ad.user_id)
    const hasWhatsApp = !!(ad.whatsapp || ad.tel)
    const whatsappUrl = buildWhatsAppUrl()

    return (
        <>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Toaster position="top-center" />
                <Navbar />
                <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6
                    {/* Ajoute du padding en bas sur mobile pour ne pas que le bouton fixe cache le contenu */}
                    pb-28 lg:pb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                        <Link href="/" className="hover:text-orange-500">Accueil</Link>
                        <span>/</span>
                        <span className="text-gray-600 font-medium truncate">{ad.title}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">

                            {/* Galerie hybride */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <HybridGallery
                                    images={images}
                                    videoUrl={ad.video_url}
                                    alt={ad.title}
                                />
                            </div>

                            {/* Boutons favoris et partage */}
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => { setIsFav(f => !f); toast.success(isFav ? 'Retire' : 'Ajoute aux favoris') }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${isFav ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-500 hover:border-red-200'}`}>
                                    <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                                    {isFav ? 'Favori' : 'Ajouter aux favoris'}
                                </button>
                                <button
                                    onClick={share}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm font-medium hover:border-orange-200 transition">
                                    <Share2 size={15} />
                                    Partager
                                </button>
                            </div>

                            {/* Infos */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h1 className="text-xl font-extrabold text-gray-900">{ad.title}</h1>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <MapPin size={13} className="text-orange-500" />
                                            <span className="text-sm text-gray-500">
                                                {ad.quartier ? `${ad.quartier}, ` : ''}{ad.city}
                                            </span>
                                            <span className="text-gray-300">·</span>
                                            <Calendar size={13} className="text-gray-400" />
                                            <span className="text-sm text-gray-400">{timeAgo(ad.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-2xl font-extrabold text-orange-500">{formatPrice(ad.price)}</p>
                                        {ad.etat && (
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{ad.etat}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Eye size={11} /> {ad.views || 0} vues
                                    </span>
                                    {ad.status === 'active' && (
                                        <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full">Annonce verifiee</span>
                                    )}
                                    {ad.marque && (
                                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{ad.marque}</span>
                                    )}
                                </div>
                                {ad.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{ad.description}</p>
                                )}
                            </div>

                            {/* Actions proprietaire */}
                            {isOwner && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                                    <Shield size={16} className="text-amber-600" />
                                    <span className="text-sm text-amber-700 font-medium flex-1">Votre annonce</span>
                                    <div className="flex gap-2">
                                        <Link href={`/ad/${adId}/edit`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-sm text-amber-700 font-medium">
                                            <Edit size={13} /> Modifier
                                        </Link>
                                        <button onClick={handleDelete} disabled={deleting}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium disabled:opacity-50">
                                            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Colonne vendeur (desktop uniquement) ─────────────────────────── */}
                        <div className="space-y-4 hidden lg:block">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                        V
                                    </div>
                                    <p className="font-bold text-gray-900">Vendeur</p>
                                </div>
                                <div className="space-y-2.5">
                                    {ad.tel && (
                                        <a href={`tel:${ad.tel}`}
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition">
                                            <Phone size={16} /> Appeler
                                        </a>
                                    )}
                                    {hasWhatsApp && (
                                        <a href={whatsappUrl}
                                            target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition">
                                            <MessageCircle size={16} /> WhatsApp
                                        </a>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 text-center mt-3">
                                    Ne payez jamais a l avance sans voir le produit
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield size={15} className="text-blue-500" />
                                    <p className="text-sm font-semibold text-blue-700">Conseils de securite</p>
                                </div>
                                <ul className="text-xs text-blue-600 space-y-1">
                                    <li>Rencontrez le vendeur en lieu public</li>
                                    <li>Verifiez le produit avant paiement</li>
                                    <li>Mefiez-vous des prix trop bas</li>
                                    <li>Ne transferez pas d argent a l avance</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>

            {/* ── Bouton WhatsApp fixe en bas — mobile uniquement ───────────────────
                Visible uniquement sur mobile (lg:hidden).
                Toujours au premier plan, au-dessus du footer.
                Message pré-rempli via buildWhatsAppUrl().
            ──────────────────────────────────────────────────────────────────── */}
            {hasWhatsApp && (
                <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20b858] active:scale-95 text-white font-extrabold text-base shadow-lg shadow-green-200 transition-all"
                    >
                        <MessageCircle size={20} />
                        Contacter sur WhatsApp
                    </a>
                </div>
            )}
        </>
    )
}
