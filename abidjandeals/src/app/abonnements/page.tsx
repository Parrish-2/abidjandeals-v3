'use client'

import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { BadgeCheck, CheckCircle, Clock, Crown, Star, Users, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

// ─── Plans tarifaires ─────────────────────────────────────────────────────────

const PLANS = [
    {
        id: 'gratuit',
        name: 'Gratuit',
        price: 0,
        priceLabel: '0 FCFA',
        period: 'pour toujours',
        icon: <Star size={22} color="#6b7280" />,
        color: '#6b7280',
        border: '#e5e7eb',
        cta: 'Commencer gratuitement',
        ctaStyle: 'outline' as const,
        highlight: false,
        features: [
            { text: 'Annonces illimitées', included: true },
            { text: 'Contact WhatsApp & Téléphone', included: true },
            { text: 'Visibilité standard', included: true },
            { text: 'Badge PRO visible', included: false },
            { text: 'Page boutique personnalisée', included: false },
            { text: 'Statistiques de boutique', included: false },
            { text: 'Assistant IA rédaction ✨', included: false },
            { text: 'Modération prioritaire (2h)', included: false },
            { text: 'Support email dédié', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 3500,
        priceLabel: '3 500 FCFA',
        period: 'par mois',
        icon: <Zap size={22} color="#F97316" fill="#F97316" />,
        color: '#F97316',
        border: '#fed7aa',
        cta: 'Passer Pro',
        ctaStyle: 'filled' as const,
        highlight: true,
        badge: '⭐ RECOMMANDÉ',
        features: [
            { text: 'Annonces illimitées', included: true },
            { text: 'Contact WhatsApp & Téléphone', included: true },
            { text: 'Priorité dans les résultats', included: true },
            { text: 'Badge PRO noir/doré visible', included: true },
            { text: 'Page boutique personnalisée', included: true },
            { text: 'Statistiques de boutique', included: true },
            { text: 'Assistant IA rédaction ✨', included: true },
            { text: 'Modération prioritaire (2h)', included: true },
            { text: 'Support email dédié', included: true },
        ],
    },
    {
        id: 'business',
        name: 'Business',
        price: 9900,
        priceLabel: '9 900 FCFA',
        period: 'par mois',
        icon: <Crown size={22} color="#7c3aed" />,
        color: '#7c3aed',
        border: '#e9d5ff',
        cta: 'Passer Business',
        ctaStyle: 'filled' as const,
        highlight: false,
        features: [
            { text: 'Tout le plan Pro inclus', included: true },
            { text: 'Badge BUSINESS exclusif', included: true },
            { text: 'Analytics avancés', included: true },
            { text: '1 bannière pub/mois (valeur 80 000 FCFA)', included: true },
            { text: 'Support WhatsApp dédié', included: true },
            { text: 'Export données CSV', included: true },
            { text: 'Facturation automatique', included: true },
            { text: 'Idéal agences & boutiques', included: true },
            { text: 'Onboarding personnalisé', included: true },
        ],
    },
]

const FOUNDERS = { price: 1500, priceLabel: '1 500 FCFA', total: 200, remaining: 187 }

const FAQ = [
    { q: 'Puis-je annuler à tout moment ?', a: "Oui, vous pouvez annuler votre abonnement à tout moment. Vous conservez l'accès jusqu'à la fin de la période payée." },
    { q: 'Quels sont les moyens de paiement acceptés ?', a: 'Wave CI, Orange Money, MTN MoMo, Moov Money, Visa et Mastercard via GeniusPay.' },
    { q: "Qu'est-ce que l'offre Fondateurs ?", a: `C'est une offre exclusive réservée aux ${FOUNDERS.total} premiers vendeurs Pro. Vous bénéficiez du plan Pro à ${FOUNDERS.priceLabel}/mois à vie, tant que vous maintenez votre abonnement.` },
    { q: "L'assistant IA, c'est quoi exactement ?", a: "Un outil qui analyse votre titre et description d'annonce et vous propose une version améliorée, plus convaincante et optimisée pour les acheteurs locaux." },
    { q: "Quelle est la différence entre Basique et Confirmé ?", a: "Basique = inscription email uniquement. Confirmé = vérification KYC (CNI + téléphone) qui vous donne accès à plus de catégories premium et inspire davantage confiance aux acheteurs." },
    { q: "La bannière Business, où s'affiche-t-elle ?", a: "Sur la page d'accueil de Kivoo (970×250px) ou dans les résultats de recherche (300×250px) pendant 7 jours. Valeur commerciale : 80 000 FCFA." },
]

// ─── Composants ───────────────────────────────────────────────────────────────

function PlanCard({ plan, onSubscribe }: { plan: typeof PLANS[0]; onSubscribe: (id: string) => void }) {
    return (
        <div style={{
            position: 'relative', background: 'white',
            border: `2px solid ${plan.highlight ? plan.color : plan.border}`,
            borderRadius: 20, padding: '32px 24px',
            display: 'flex', flexDirection: 'column',
            boxShadow: plan.highlight ? `0 8px 32px ${plan.color}25` : '0 2px 8px rgba(0,0,0,0.06)',
            transform: plan.highlight ? 'scale(1.03)' : 'none',
        }}>
            {plan.badge && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                </div>
            )}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{plan.icon}</div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{plan.name}</span>
                </div>
                <div>
                    <span style={{ fontSize: 32, fontWeight: 900, color: plan.color }}>{plan.priceLabel}</span>
                    <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 6 }}>{plan.period}</span>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, flex: 1 }}>
                {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flexShrink: 0, marginTop: 1 }}>
                            {f.included
                                ? <CheckCircle size={16} color={plan.color} fill={`${plan.color}20`} />
                                : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #e5e7eb' }} />}
                        </div>
                        <span style={{ fontSize: 13, color: f.included ? '#374151' : '#9ca3af', lineHeight: 1.4 }}>{f.text}</span>
                    </div>
                ))}
            </div>
            <button onClick={() => onSubscribe(plan.id)} style={{
                width: '100%', padding: '14px 0', borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                border: plan.ctaStyle === 'outline' ? `2px solid ${plan.border}` : 'none',
                background: plan.ctaStyle === 'outline' ? 'transparent' : plan.color,
                color: plan.ctaStyle === 'outline' ? '#374151' : 'white',
                boxShadow: plan.ctaStyle === 'filled' ? `0 4px 16px ${plan.color}40` : 'none',
            }}>
                {plan.cta}
            </button>
        </div>
    )
}

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false)
    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '16px 20px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{q}</span>
                <span style={{ fontSize: 18, color: '#F97316', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
            </button>
            {open && (
                <div style={{ padding: '0 20px 16px', background: '#fafafa' }}>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{a}</p>
                </div>
            )}
        </div>
    )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AbonnementsPage() {
    const router = useRouter()
    const [subscribing, setSubscribing] = useState(false)

    async function handleSubscribe(planId: string) {
        if (planId === 'gratuit') { router.push('/?auth=register'); return }
        setSubscribing(true)
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planId }),
            })
            const data = await res.json()
            if (!res.ok || !data.checkout_url) {
                if (data.error === 'Non authentifié') { router.push('/?auth=login&redirect=/abonnements'); return }
                toast.error(data.error || 'Erreur lors de la création du paiement')
                return
            }
            window.location.href = data.checkout_url
        } catch {
            toast.error('Erreur réseau. Réessayez.')
        } finally {
            setSubscribing(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <Navbar />

            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 80px' }}>

                {/* ── HERO ── */}
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 20, padding: '4px 14px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Tarifs simples & transparents
                    </span>
                    <h1 style={{ fontSize: 42, fontWeight: 900, color: '#111827', margin: '16px 0 12px', lineHeight: 1.1 }}>
                        Vendez plus,<br /><span style={{ color: '#F97316' }}>payez moins</span>
                    </h1>
                    <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                        Commencez gratuitement. Passez Pro quand vous êtes prêt.<br />
                        Sans engagement, annulez à tout moment.
                    </p>
                </div>

                {/* ── OFFRE FONDATEURS ── */}
                <div style={{ background: 'linear-gradient(135deg, #0F1117 0%, #1a2535 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', border: '1px solid rgba(245,200,66,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(245,200,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Users size={24} color="#F5C842" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>🎁 Offre Fondateurs</span>
                                <span style={{ fontSize: 10, fontWeight: 700, background: '#F5C842', color: '#111827', borderRadius: 4, padding: '2px 8px' }}>LIMITÉ</span>
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                                <strong style={{ color: '#F5C842' }}>{FOUNDERS.remaining} places restantes</strong> sur {FOUNDERS.total} — Plan Pro à <strong style={{ color: '#F5C842' }}>{FOUNDERS.priceLabel}/mois à vie</strong> au lieu de 3 500 FCFA
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={14} color="rgba(255,255,255,0.4)" />
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{FOUNDERS.total - FOUNDERS.remaining} vendeurs déjà inscrits</span>
                        </div>
                        <button onClick={() => handleSubscribe('pro')} disabled={subscribing} style={{ padding: '12px 24px', borderRadius: 12, background: '#F5C842', color: '#111827', border: 'none', fontSize: 14, fontWeight: 800, cursor: subscribing ? 'not-allowed' : 'pointer', opacity: subscribing ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                            {subscribing ? 'Redirection...' : `★ Rejoindre — ${FOUNDERS.priceLabel}/mois`}
                        </button>
                    </div>
                </div>

                {/* ── PLANS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 80, alignItems: 'start' }}>
                    {PLANS.map(plan => <PlanCard key={plan.id} plan={plan} onSubscribe={handleSubscribe} />)}
                </div>

                {/* ── NIVEAUX DE CONFIANCE (KYC) ── */}
                <div style={{ marginBottom: 80 }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 14px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Niveaux de confiance
                        </span>
                        <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111827', margin: '16px 0 12px' }}>
                            Plus tu es vérifié,<br /><span style={{ color: '#16a34a' }}>plus tu vends</span>
                        </h2>
                        <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>
                            La vérification KYC inspire confiance aux acheteurs et débloque des catégories premium.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

                        {/* Basique */}
                        <div style={{ background: 'white', border: '2px solid #e5e7eb', borderRadius: 20, padding: '28px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Star size={20} color="#6b7280" />
                                </div>
                                <div>
                                    <p style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Basique</p>
                                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Inscription email uniquement</p>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
                                Accès immédiat à la plateforme après confirmation email. Idéal pour tester Kivoo.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {['Mode & Beauté', 'Maison & Déco', 'Enfants & Bébés', 'Autres & Divers'].map(c => (
                                    <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CheckCircle size={14} color="#6b7280" />
                                        <span style={{ fontSize: 13, color: '#374151' }}>{c}</span>
                                    </div>
                                ))}
                                {['Services & Emploi', 'Immobilier', 'High-Tech', 'Automobile'].map(c => (
                                    <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #e5e7eb', flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: '#9ca3af' }}>{c} (verrouillé)</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => router.push('/?auth=register')} style={{ width: '100%', marginTop: 20, padding: '12px 0', borderRadius: 12, border: '2px solid #e5e7eb', background: 'transparent', fontSize: 14, fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
                                Commencer gratuitement
                            </button>
                        </div>

                        {/* Confirmé */}
                        <div style={{ background: 'linear-gradient(135deg, #0F1117 0%, #1a2535 100%)', border: '2px solid #16a34a', borderRadius: 20, padding: '28px 24px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#16a34a', color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                                ✓ RECOMMANDÉ
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BadgeCheck size={20} color="#4ade80" />
                                </div>
                                <div>
                                    <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Confirmé</p>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Email + Téléphone + CNI (KYC)</p>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, lineHeight: 1.6 }}>
                                Vérification complète qui débloque toutes les catégories et inspire confiance aux acheteurs.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                                {['Mode & Beauté', 'Maison & Déco', 'Enfants & Bébés', 'Autres & Divers', 'Services & Emploi', 'Immobilier (exclusif)', 'High-Tech (exclusif)', 'Automobile (exclusif)'].map(c => (
                                    <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CheckCircle size={14} color="#4ade80" />
                                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{c}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                                <p style={{ fontSize: 12, color: '#4ade80', margin: 0, fontWeight: 600 }}>🔥 Offre Pionnière — Places limitées</p>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '3px 0 0' }}>Les 50 premiers vendeurs Confirmés obtiennent 3 mois Pro GRATUITS</p>
                            </div>
                            <button onClick={() => router.push('/verification-documents')} style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(22,163,74,0.4)' }}>
                                Devenir Confirmé →
                            </button>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: '8px 0 0' }}>Vérification rapide · 100% sécurisée</p>
                        </div>

                    </div>
                </div>

                {/* ── COMPARATIF ── */}
                <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 80 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Comparatif détaillé</h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Fonctionnalité</th>
                                    {PLANS.map(p => (
                                        <th key={p.id} style={{ padding: '12px 16px', textAlign: 'center', color: p.highlight ? p.color : '#6b7280', fontWeight: 700, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {['Annonces illimitées', 'Badge PRO visible', 'Page boutique', 'Statistiques', 'Assistant IA', 'Modération prioritaire', 'Support dédié', 'Bannière publicitaire', 'Analytics avancés'].map((feature, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 20px', color: '#374151', fontWeight: 500 }}>{feature}</td>
                                        {PLANS.map(p => {
                                            const f = p.features.find(f => f.text.toLowerCase().includes(feature.toLowerCase().split(' ')[0]))
                                            return (
                                                <td key={p.id} style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                    {f?.included ? <span style={{ color: p.color, fontSize: 16 }}>✓</span> : <span style={{ color: '#d1d5db', fontSize: 16 }}>—</span>}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                                <tr style={{ background: '#f9fafb' }}>
                                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#111827' }}>Prix mensuel</td>
                                    {PLANS.map(p => (
                                        <td key={p.id} style={{ padding: '16px 16px', textAlign: 'center', fontWeight: 800, color: p.color }}>{p.priceLabel}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── MOYENS DE PAIEMENT ── */}
                <div style={{ textAlign: 'center', marginBottom: 80 }}>
                    <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>🔒 Paiement sécurisé via GeniusPay</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {['🌊 Wave', '🟠 Orange Money', '🟡 MTN MoMo', '🔵 Moov Money'].map(m => (
                            <span key={m} style={{ fontSize: 13, color: '#6b7280', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontWeight: 600 }}>{m}</span>
                        ))}
                    </div>
                </div>

                {/* ── FAQ ── */}
                <div style={{ maxWidth: 680, margin: '0 auto', marginBottom: 80 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 32 }}>Questions fréquentes</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
                    </div>
                </div>

                {/* ── CTA FINAL ── */}
                <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #0F1117, #1a2535)', borderRadius: 24, padding: '48px 32px' }}>
                    <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Prêt à vendre plus ? 🚀</h2>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>
                        Rejoignez les premiers vendeurs Pro Kivoo en Côte d'Ivoire.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => handleSubscribe('pro')} disabled={subscribing} style={{ padding: '14px 32px', borderRadius: 12, background: '#F97316', color: 'white', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                            {subscribing ? 'Redirection...' : 'Passer Pro — 3 500 FCFA/mois'}
                        </button>
                        <button onClick={() => router.push('/')} style={{ padding: '14px 32px', borderRadius: 12, background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                            Voir les annonces
                        </button>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    )
}
