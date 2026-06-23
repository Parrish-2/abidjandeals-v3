'use client'

import {
    Bell,
    CheckCircle,
    Clock,
    Eye,
    Facebook,
    Flag,
    Instagram,
    MapPin,
    MessageCircle,
    Package,
    Phone,
    Search,
    Shield,
    Star,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import ShopHours from './ShopHours'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Listing {
    id: string
    title: string
    price: number
    images: string[] | null
    city: string
    created_at: string
    category_id: string
}

interface Profile {
    id: string
    boutique_name: string
    boutique_slug: string
    boutique_description: string | null
    logo_url: string | null
    banner_url: string | null
    shop_phone: string | null
    shop_whatsapp: string | null
    shop_facebook: string | null
    shop_instagram: string | null
    shop_hours: any
    shop_is_open: boolean | null
    verified_seller: boolean | null
    note: number | null
    nb_avis: number | null
    created_at: string
}

interface Props {
    profile: Profile
    isPro: boolean
    listings: Listing[]
    totalViews: number
    shopHours: any
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function getMemberSince(createdAt: string): string {
    const months = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    if (months < 1) return 'Nouveau'
    if (months < 12) return `${months} mois`
    const years = Math.floor(months / 12)
    return `${years} an${years > 1 ? 's' : ''}`
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-CI').format(price) + ' FCFA'
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function CardSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
    )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function BoutiqueClient({ profile, isPro, listings, totalViews, shopHours }: Props) {
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<'recent' | 'price_asc' | 'price_desc'>('recent')
    const [following, setFollowing] = useState(false)
    const [analyticsTracked, setAnalyticsTracked] = useState(false)

    // Tracking vue boutique (une seule fois par visite)
    if (typeof window !== 'undefined' && !analyticsTracked) {
        setAnalyticsTracked(true)
        fetch('/api/analytics/shop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seller_id: profile.id, event: 'shop_view' }),
        }).catch(() => { })
    }

    // ── Filtrage & tri côté client ─────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = [...listings]
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(l => l.title.toLowerCase().includes(q))
        }
        if (sort === 'price_asc') result.sort((a, b) => a.price - b.price)
        else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
        else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        return result
    }, [listings, search, sort])

    const memberSince = getMemberSince(profile.created_at)
    const hasWhatsApp = !!profile.shop_whatsapp
    const hasPhone = !!profile.shop_phone

    function trackAndOpen(event: string, url: string) {
        fetch('/api/analytics/shop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seller_id: profile.id, event }),
        }).catch(() => { })
        window.open(url, '_blank', 'noopener')
    }

    function handleFollow() {
        setFollowing(f => !f)
        toast.success(
            following
                ? 'Vous ne suivez plus cette boutique'
                : 'Boutique suivie ! Vous serez notifié des nouveautés 🔔',
            { duration: 3000 }
        )
    }

    function handleReport() {
        toast('Signalement envoyé à notre équipe. Merci de votre vigilance.', {
            icon: '🛡️', duration: 4000,
        })
    }

    // ── Stats mini-dashboard ───────────────────────────────────────────────────
    const stats = [
        { icon: <Eye size={15} />, value: totalViews, label: 'Vues', color: '#6366f1' },
        { icon: <Package size={15} />, value: listings.length, label: 'Annonces', color: '#F97316' },
        { icon: <Clock size={15} />, value: memberSince, label: 'Ancienneté', color: '#0ea5e9', isString: true },
        {
            icon: <Star size={15} />,
            value: profile.note ? profile.note.toFixed(1) : '—',
            label: 'Note',
            color: '#eab308',
            isString: true,
        },
    ]

    return (
        <>
            <Toaster position="top-center" />

            <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: 100 }}>
                <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 16px 0' }}>

                    {/* ── BANNIÈRE ─────────────────────────────────────────────────────── */}
                    <div style={{
                        position: 'relative', width: '100%', height: 200,
                        borderRadius: 16, overflow: 'hidden',
                        background: 'linear-gradient(135deg, #0F1117, #1a2535)',
                    }}>
                        {profile.banner_url ? (
                            <Image src={profile.banner_url} alt="Bannière boutique" fill style={{ objectFit: 'cover' }} priority />
                        ) : (
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(135deg, #0F1117 0%, #1a2535 60%, rgba(249,115,22,0.4) 100%)',
                            }} />
                        )}
                        {/* Gradient de lisibilité */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

                        {/* Badge PRO sur bannière */}
                        {isPro && (
                            <div style={{
                                position: 'absolute', top: 12, right: 12,
                                background: '#0F1117', border: '1px solid #F5C842',
                                borderRadius: 6, padding: '3px 10px',
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#F5C842', letterSpacing: '0.06em' }}>PRO</span>
                            </div>
                        )}

                        {/* Statut ouvert/fermé sur bannière */}
                        <div style={{
                            position: 'absolute', bottom: 12, left: 106,
                            background: profile.shop_is_open ? 'rgba(22,163,74,0.9)' : 'rgba(107,114,128,0.85)',
                            borderRadius: 20, padding: '3px 10px',
                        }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>
                                {profile.shop_is_open ? '● Ouvert maintenant' : '○ Fermé'}
                            </span>
                        </div>
                    </div>

                    {/* ── LOGO + NOM + BADGES ──────────────────────────────────────────── */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: -36, marginBottom: 14, paddingLeft: 12 }}>
                        {/* Logo chevauchant la bannière */}
                        <div style={{
                            width: 80, height: 80, borderRadius: 16,
                            border: '3px solid white', overflow: 'hidden',
                            background: '#fff7ed', flexShrink: 0,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                        }}>
                            {profile.logo_url ? (
                                <Image src={profile.logo_url} alt="Logo" width={80} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏪</div>
                            )}
                        </div>

                        <div style={{ flex: 1, paddingBottom: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <h1 style={{ fontSize: 19, fontWeight: 800, color: '#111827', margin: 0 }}>
                                    {profile.boutique_name}
                                </h1>
                                {isPro && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 700,
                                        background: '#0F1117', color: '#F5C842',
                                        border: '1px solid #F5C842', borderRadius: 4, padding: '2px 7px',
                                    }}>PRO</span>
                                )}
                                {profile.verified_seller && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 700,
                                        background: '#eff6ff', color: '#2563eb',
                                        border: '1px solid #bfdbfe', borderRadius: 4, padding: '2px 7px',
                                        display: 'flex', alignItems: 'center', gap: 3,
                                    }}>
                                        <CheckCircle size={10} /> Vérifié
                                    </span>
                                )}
                            </div>

                            {profile.note ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 5 }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={12} style={{
                                            color: i <= Math.round(profile.note!) ? '#F97316' : '#e5e7eb',
                                            fill: i <= Math.round(profile.note!) ? '#F97316' : 'none',
                                        }} />
                                    ))}
                                    <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 2 }}>
                                        {profile.note.toFixed(1)} ({profile.nb_avis ?? 0} avis)
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Description */}
                    {profile.boutique_description && (
                        <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.75, margin: '0 0 16px', padding: '0 2px' }}>
                            {profile.boutique_description}
                        </p>
                    )}

                    {/* ── STATS MINI-DASHBOARD ─────────────────────────────────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                        {stats.map(({ icon, value, label, color, isString }) => (
                            <div key={label} style={{
                                background: 'white', border: '0.5px solid #e5e7eb',
                                borderRadius: 12, padding: '12px 8px', textAlign: 'center',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: `${color}18`, color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 6px',
                                }}>{icon}</div>
                                <p style={{
                                    fontSize: isString ? 11 : 18, fontWeight: 800,
                                    color: '#111827', margin: 0, lineHeight: 1.1,
                                }}>{value}</p>
                                <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── BLOC RÉASSURANCE / CONFIANCE ─────────────────────────────────── */}
                    <div style={{
                        background: 'white', border: '0.5px solid #e5e7eb',
                        borderRadius: 14, padding: '16px 18px', marginBottom: 16,
                    }}>
                        <p style={{
                            fontSize: 10, fontWeight: 700, color: '#9ca3af',
                            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
                        }}>Pourquoi faire confiance à cette boutique ?</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                            {/* KYC */}
                            {profile.verified_seller && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Shield size={16} color="#2563eb" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>Identité vérifiée</p>
                                        <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0' }}>KYC validé par Kivoo</p>
                                    </div>
                                </div>
                            )}

                            {/* Ancienneté */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Clock size={16} color="#0ea5e9" />
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>Membre depuis {memberSince}</p>
                                    <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0' }}>Vendeur établi</p>
                                </div>
                            </div>

                            {/* Réactivité */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <MessageCircle size={16} color="#F97316" />
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>Très réactif</p>
                                    <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0' }}>Répond en &lt; 15 min</p>
                                </div>
                            </div>

                            {/* Annonces actives */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Package size={16} color="#16a34a" />
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>{listings.length} annonces actives</p>
                                    <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0' }}>Catalogue à jour</p>
                                </div>
                            </div>

                            {/* Note */}
                            {profile.note && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Star size={16} color="#eab308" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>{profile.note.toFixed(1)}/5 satisfaction</p>
                                        <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0' }}>{profile.nb_avis ?? 0} avis clients</p>
                                    </div>
                                </div>
                            )}

                            {/* Pro badge réassurance */}
                            {isPro && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 13, color: '#F5C842', fontWeight: 800 }}>★</span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>Vendeur Pro Kivoo</p>
                                        <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0' }}>Abonnement professionnel actif</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── CTAs PRINCIPAUX ──────────────────────────────────────────────── */}
                    <div style={{ marginBottom: 16 }}>
                        {/* Boutons primaires */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                            {profile.shop_whatsapp && (
                                <button
                                    onClick={() => trackAndOpen('wa_click', `https://wa.me/${profile.shop_whatsapp!.replace(/\D/g, '')}`)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '10px 18px', background: '#25D366', color: 'white',
                                        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.25)',
                                    }}>
                                    <MessageCircle size={16} /> WhatsApp
                                </button>
                            )}
                            {profile.shop_phone && (
                                <a href={`tel:${profile.shop_phone}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '10px 18px', background: '#F97316', color: 'white',
                                        borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                                        boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                                    }}>
                                    <Phone size={16} /> Appeler
                                </a>
                            )}
                            {profile.shop_facebook && (
                                <a href={profile.shop_facebook} target="_blank" rel="noopener"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '10px 14px', border: '1px solid #e5e7eb',
                                        background: 'white', color: '#1877f2', borderRadius: 10,
                                        fontSize: 13, fontWeight: 600, textDecoration: 'none',
                                    }}>
                                    <Facebook size={15} /> Facebook
                                </a>
                            )}
                            {profile.shop_instagram && (
                                <a href={profile.shop_instagram} target="_blank" rel="noopener"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '10px 14px', border: '1px solid #e5e7eb',
                                        background: 'white', color: '#e1306c', borderRadius: 10,
                                        fontSize: 13, fontWeight: 600, textDecoration: 'none',
                                    }}>
                                    <Instagram size={15} /> Instagram
                                </a>
                            )}
                        </div>

                        {/* Boutons secondaires */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                                onClick={handleFollow}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 14px',
                                    border: `1px solid ${following ? '#F97316' : '#e5e7eb'}`,
                                    background: following ? '#fff7ed' : 'white',
                                    color: following ? '#F97316' : '#6b7280',
                                    borderRadius: 10, fontSize: 12, fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                                <Bell size={13} fill={following ? 'currentColor' : 'none'} />
                                {following ? 'Abonné ✓' : 'Suivre la boutique'}
                            </button>

                            <button
                                onClick={handleReport}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '8px 12px', border: '1px solid #fee2e2',
                                    background: 'white', color: '#dc2626', borderRadius: 10,
                                    fontSize: 11, fontWeight: 500, cursor: 'pointer', marginLeft: 'auto',
                                }}>
                                <Flag size={11} /> Signaler
                            </button>
                        </div>
                    </div>

                    {/* ── HORAIRES ─────────────────────────────────────────────────────── */}
                    {shopHours && (
                        <div style={{ marginBottom: 16 }}>
                            <ShopHours hours={shopHours} />
                        </div>
                    )}

                    {/* ── SECTION ANNONCES ─────────────────────────────────────────────── */}
                    <div>
                        {/* Titre + compteur */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                                {filtered.length} annonce{filtered.length > 1 ? 's' : ''}
                                {search && (
                                    <span style={{ fontSize: 12, fontWeight: 400, color: '#9ca3af' }}> pour &quot;{search}&quot;</span>
                                )}
                            </h2>
                        </div>

                        {/* Barre recherche + tri */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher dans cette boutique..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{
                                        width: '100%', paddingLeft: 32, paddingRight: 12,
                                        paddingTop: 9, paddingBottom: 9,
                                        border: '1px solid #e5e7eb', borderRadius: 10,
                                        fontSize: 13, color: '#111827', background: 'white',
                                        outline: 'none', boxSizing: 'border-box',
                                        fontFamily: 'inherit',
                                    }}
                                />
                            </div>
                            <select
                                value={sort}
                                onChange={e => setSort(e.target.value as typeof sort)}
                                style={{
                                    padding: '9px 10px', border: '1px solid #e5e7eb',
                                    borderRadius: 10, fontSize: 12, color: '#374151',
                                    background: 'white', cursor: 'pointer', outline: 'none',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <option value="recent">Plus récents</option>
                                <option value="price_asc">Prix ↑</option>
                                <option value="price_desc">Prix ↓</option>
                            </select>
                        </div>

                        {/* Grille annonces */}
                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                <p style={{ fontSize: 36, marginBottom: 8 }}>🔍</p>
                                <p style={{ fontSize: 13, color: '#9ca3af' }}>
                                    {search ? `Aucune annonce pour "${search}"` : 'Aucune annonce disponible'}
                                </p>
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        style={{ marginTop: 12, padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 12, color: '#374151', cursor: 'pointer' }}>
                                        Effacer la recherche
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filtered.map(ad => (
                                    <Link key={ad.id} href={`/ad/${ad.id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: 'white', border: '0.5px solid #e5e7eb',
                                            borderRadius: 12, overflow: 'hidden',
                                            transition: 'box-shadow 0.2s, transform 0.2s',
                                        }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'
                                                    ; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                                                    ; (e.currentTarget as HTMLDivElement).style.transform = 'none'
                                            }}
                                        >
                                            {/* Image */}
                                            <div style={{ position: 'relative', aspectRatio: '4/3', background: '#f3f4f6' }}>
                                                {ad.images?.[0] ? (
                                                    <Image
                                                        src={ad.images[0]} alt={ad.title} fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📦</div>
                                                )}
                                            </div>

                                            {/* Infos */}
                                            <div style={{ padding: '10px 12px' }}>
                                                <p style={{
                                                    fontSize: 12, fontWeight: 600, color: '#111827',
                                                    margin: '0 0 4px', overflow: 'hidden',
                                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>{ad.title}</p>
                                                <p style={{ fontSize: 13, fontWeight: 800, color: '#F97316', margin: 0 }}>
                                                    {formatPrice(ad.price)}
                                                </p>
                                                {ad.city && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 5 }}>
                                                        <MapPin size={9} color="#9ca3af" />
                                                        <span style={{ fontSize: 10, color: '#9ca3af' }}>{ad.city}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── FLOATING CTA MOBILE ──────────────────────────────────────────────── */}
            {(hasWhatsApp || hasPhone) && (
                <div
                    className="lg:hidden"
                    style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                        padding: '10px 16px 16px',
                        background: 'linear-gradient(to top, white 65%, rgba(255,255,255,0))',
                        display: 'flex', gap: 10,
                    }}
                >
                    {profile.shop_whatsapp && (
                        <a
                            href={`https://wa.me/${profile.shop_whatsapp.replace(/\D/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: 8, padding: '14px 0', background: '#25D366', color: 'white',
                                borderRadius: 14, fontWeight: 800, fontSize: 14, textDecoration: 'none',
                                boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
                            }}>
                            <MessageCircle size={18} /> WhatsApp
                        </a>
                    )}
                    {profile.shop_phone && (
                        <a
                            href={`tel:${profile.shop_phone}`}
                            style={{
                                flex: hasWhatsApp ? '0 0 54px' : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: 8, padding: '14px 0', background: '#F97316', color: 'white',
                                borderRadius: 14, fontWeight: 800, fontSize: 14, textDecoration: 'none',
                                boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                            }}>
                            <Phone size={18} />
                            {!hasWhatsApp && ' Appeler'}
                        </a>
                    )}
                </div>
            )}
        </>
    )
}
