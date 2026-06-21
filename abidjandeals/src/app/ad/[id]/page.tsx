'use client'
import BoostCTA from '@/components/boost/BoostCTA'
import { Footer } from '@/components/Footer'
import { HybridGallery } from '@/components/HybridGallery'
import { Navbar } from '@/components/Navbar'
import { SmartBanner } from '@/components/SmartBanner'
import { useI18n } from '@/contexts/i18nContext'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, Calendar, Edit, Eye, Heart, Loader2, MapPin, MessageCircle, Phone, Share2, Shield, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

function filterMedia(images: string[]): { images: string[]; videoUrl: string | null } {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.avi']
    const isVideo = (url: string) => videoExtensions.some(ext => url.toLowerCase().endsWith(ext))
    return {
        images: images.filter(url => !isVideo(url)),
        videoUrl: images.find(url => isVideo(url)) ?? null,
    }
}

export default function AdDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { t, locale } = useI18n()
    const adId = params?.id as string
    const storeUser = useStore(s => s.user)

    const [ad, setAd] = useState<any>(null)
    const [found, setFound] = useState<boolean | null>(null)
    const [isFav, setIsFav] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [adBanner, setAdBanner] = useState<any>(null)

    const [translatedTitle, setTranslatedTitle] = useState<string | null>(null)
    const [translatedDesc, setTranslatedDesc] = useState<string | null>(null)
    const [translating, setTranslating] = useState(false)
    const lastTranslatedLocale = useRef<string | null>(null)

    // ── Chargement de l'annonce — INDEPENDANT de la session ───────────────────
    // Le chargement de l'annonce ne doit JAMAIS dependre de l'auth :
    // une annonce active est publique (RLS: status='active'), donc on la
    // charge sans attendre/bloquer sur getSession() pour eviter tout conflit
    // de lock Supabase entre plusieurs appels auth concurrents sur la page.
    useEffect(() => {
        async function loadAd() {
            if (!adId) return
            try {
                const { data, error } = await supabase
                    .from('ads').select('*').eq('id', adId).maybeSingle()
                if (error || !data) { setFound(false); return }
                setAd(data)
                setFound(true)
                if (data.status === 'active') {
                    supabase.from('ads').update({ views: (data.views || 0) + 1 }).eq('id', adId)
                }
            } catch { setFound(false) }
        }
        loadAd()
    }, [adId])

    // Note: l'utilisateur connecte est lu depuis le store global (useStore),
    // deja alimente par AuthProvider au niveau racine de l'app. On evite
    // ainsi un second appel a supabase.auth.getSession() ici, qui entrait
    // en conflit de lock avec celui d'AuthProvider (meme token, meme onglet).
    const sessionUid = storeUser?.id ?? null

    // Bannière ad_detail
    useEffect(() => {
        async function loadBanner() {
            try {
                const now = new Date().toISOString()
                const { data } = await supabase
                    .from('banners')
                    .select('id, company_name, image_url, link_url, placement, active, contract_end, click_count')
                    .eq('placement', 'ad_detail')
                    .eq('active', true)
                    .or(`contract_end.is.null,contract_end.gt.${now}`)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()
                if (data) {
                    setAdBanner({
                        id: data.id,
                        company_name: data.company_name ?? '',
                        image_url: data.image_url,
                        link_url: data.link_url ?? null,
                        placement: data.placement,
                        active: data.active,
                        contract_end: data.contract_end ? new Date(data.contract_end).getTime() : null,
                        click_count: data.click_count ?? 0,
                        created_at: '',
                    })
                }
            } catch { }
        }
        loadBanner()
    }, [])

    // Traduction DeepL
    useEffect(() => {
        if (!ad || locale === lastTranslatedLocale.current) return
        if (locale === 'en') {
            setTranslating(true)
            const texts = [ad.title, ad.description].filter(Boolean)
            fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: texts, target_lang: 'EN' }),
            })
                .then(r => r.json())
                .then(data => {
                    if (data.translations) {
                        setTranslatedTitle(data.translations[0] ?? ad.title)
                        setTranslatedDesc(data.translations[1] ?? ad.description)
                    }
                })
                .catch(() => { })
                .finally(() => setTranslating(false))
        } else {
            setTranslatedTitle(null)
            setTranslatedDesc(null)
        }
        lastTranslatedLocale.current = locale
    }, [locale, ad])

    function formatPrice(p: number) {
        if (!p && p !== 0) return t('publish.select')
        return new Intl.NumberFormat('fr-CI').format(p) + ' FCFA'
    }

    function timeAgo(iso: string) {
        if (!iso) return ''
        try {
            const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
            if (days === 0) return t('ad_page.today')
            if (days === 1) return t('ad_page.yesterday')
            if (days < 7) return `${days} ${t('ad_page.days_ago')}`
            const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-GB'
            return new Date(iso).toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' })
        } catch { return '' }
    }

    function translateCondition(etat: string): string {
        const map: Record<string, string> = {
            'Neuf': t('publish.condition_new'),
            'Comme neuf': t('publish.condition_like_new'),
            'Bon état': t('publish.condition_good'),
            'Très bon état': t('publish.condition_like_new'),
            'État correct': t('publish.condition_correct'),
            'Disponible': t('publish.condition_available'),
        }
        return map[etat] ?? etat
    }

    function share() {
        if (!ad) return
        if (navigator.share) {
            navigator.share({ title: ad.title, url: window.location.href })
        } else {
            navigator.clipboard.writeText(window.location.href)
            toast.success(t('ad.link_copied'))
        }
    }

    async function handleDelete() {
        if (!confirm(t('moderation.confirm_delete'))) return
        setDeleting(true)
        try {
            const res = await fetch('/api/admin/ads', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: adId, images: ad?.images || [] }),
            })
            if (res.ok) { toast.success(t('moderation.ad_deleted')); router.push('/dashboard') }
            else toast.error(t('publish.error'))
        } catch { toast.error(t('publish.error')) }
        finally { setDeleting(false) }
    }

    function buildWhatsAppUrl() {
        if (!ad) return '#'
        const number = (ad.whatsapp || ad.tel)?.replace(/[\s+]/g, '')
        if (!number) return '#'
        const message = encodeURIComponent(
            `${t('ad.whatsapp_message')} "${ad.title}" sur KIVOO. ${t('ad.whatsapp_available')}`
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
                <h1 className="text-xl font-bold">{t('ads.no_results')}</h1>
                <div className="flex gap-3">
                    <button onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm">
                        Réessayer
                    </button>
                    <Link href="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-2xl font-semibold text-sm">
                        {t('ad.home')}
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    )

    const { images, videoUrl: extractedVideo } = filterMedia(ad.images ?? [])
    const finalVideoUrl = ad.video_url ?? extractedVideo
    const isOwner = !!(sessionUid && sessionUid === ad.user_id)
    const hasWhatsApp = !!(ad.whatsapp || ad.tel)
    const whatsappUrl = buildWhatsAppUrl()
    const displayTitle = (locale === 'en' && translatedTitle) ? translatedTitle : ad.title
    const displayDesc = (locale === 'en' && translatedDesc) ? translatedDesc : ad.description

    return (
        <>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Toaster position="top-center" />
                <Navbar />
                <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-28 lg:pb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                        <Link href="/" className="hover:text-orange-500">{t('ad.home')}</Link>
                        <span>/</span>
                        <span className="text-gray-600 font-medium truncate">{displayTitle}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <HybridGallery images={images} videoUrl={finalVideoUrl} alt={ad.title} />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => { setIsFav(f => !f); toast.success(isFav ? t('ad.removed_favorite') : t('ad.added_favorite')) }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${isFav ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-500 hover:border-red-200'}`}>
                                    <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                                    {isFav ? t('ad.favorited') : t('ad.add_favorite')}
                                </button>
                                <button onClick={share}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm font-medium hover:border-orange-200 transition">
                                    <Share2 size={15} /> {t('ad.share')}
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                            {displayTitle}
                                            {translating && <Loader2 size={14} className="animate-spin text-orange-400 flex-shrink-0" />}
                                        </h1>
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
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {translateCondition(ad.etat)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-4 flex-wrap">
                                    <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Eye size={11} /> {ad.views || 0} {t('ads.views')}
                                    </span>
                                    {ad.status === 'active' && (
                                        <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full">
                                            {t('ad_page.verified_ad')}
                                        </span>
                                    )}
                                    {ad.marque && (
                                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{ad.marque}</span>
                                    )}
                                </div>

                                {displayDesc && (
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                        {displayDesc}
                                    </p>
                                )}
                            </div>

                            {isOwner && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                                    <Shield size={16} className="text-amber-600" />
                                    <span className="text-sm text-amber-700 font-medium flex-1">{t('ad_page.your_ad')}</span>
                                    <div className="flex gap-2">
                                        <Link href={`/ad/${adId}/edit`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-sm text-amber-700 font-medium">
                                            <Edit size={13} /> {t('ad_page.edit')}
                                        </Link>
                                        <button onClick={handleDelete} disabled={deleting}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium disabled:opacity-50">
                                            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                            {t('ad_page.delete')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── BoostCTA mobile (sticky bottom, visible uniquement sur mobile) ── */}
                            {isOwner && (
                                <BoostCTA
                                    adId={adId}
                                    adTitle={ad.title}
                                    isBoosted={ad.boost_level > 0}
                                    boostExpiresAt={ad.boost_expires_at ?? null}
                                    userId={sessionUid ?? undefined}
                                    adUserId={ad.user_id}
                                />
                            )}

                            {adBanner && (
                                <div className="lg:hidden">
                                    <SmartBanner banner={adBanner} className="rounded-2xl overflow-hidden shadow-sm" />
                                </div>
                            )}
                        </div>

                        {/* ── Sidebar desktop ───────────────────────────────────────────────── */}
                        <div className="space-y-4 hidden lg:block">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">V</div>
                                    <p className="font-bold text-gray-900">{t('ad.seller')}</p>
                                </div>
                                <div className="space-y-2.5">
                                    {ad.tel && (
                                        <a href={`tel:${ad.tel}`}
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition">
                                            <Phone size={16} /> {t('ad.call')}
                                        </a>
                                    )}
                                    {hasWhatsApp && (
                                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition">
                                            <MessageCircle size={16} /> WhatsApp
                                        </a>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 text-center mt-3">{t('ad_page.no_advance_payment')}</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield size={15} className="text-blue-500" />
                                    <p className="text-sm font-semibold text-blue-700">{t('ad.safety_title')}</p>
                                </div>
                                <ul className="text-xs text-blue-600 space-y-1">
                                    <li>{t('ad.safety_2')}</li>
                                    <li>{t('ad.safety_3')}</li>
                                    <li>{t('ad_page.safety_4')}</li>
                                    <li>{t('ad.safety_1')}</li>
                                </ul>
                            </div>

                            {/* ── BoostCTA desktop (carte inline dans la sidebar) ── */}
                            {isOwner && (
                                <BoostCTA
                                    adId={adId}
                                    adTitle={ad.title}
                                    isBoosted={ad.boost_level > 0}
                                    boostExpiresAt={ad.boost_expires_at ?? null}
                                    userId={sessionUid ?? undefined}
                                    adUserId={ad.user_id}
                                />
                            )}

                            {adBanner && (
                                <SmartBanner banner={adBanner} className="rounded-2xl overflow-hidden shadow-sm" />
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>

            {hasWhatsApp && (
                <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20b858] active:scale-95 text-white font-extrabold text-base shadow-lg shadow-green-200 transition-all">
                        <MessageCircle size={20} />
                        {t('ads.contact_seller')}
                    </a>
                </div>
            )}
        </>
    )
}
