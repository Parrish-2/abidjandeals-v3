'use client'

import { BoostModal } from '@/components/BoostModal'
import { formatFCFA } from '@/lib/format'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import {
  CheckCircle,
  Clock,
  Eye,
  Package,
  PencilLine,
  PlusCircle,
  Star,
  Trash2,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface Ad {
  id: string
  title: string
  price: number
  status: 'active' | 'pending' | 'rejected'
  category_id: string
  city: string
  images: string[] | null
  created_at: string
  boost_level: 'STANDARD' | 'PREMIUM' | 'URGENT' | null
}

interface Profile {
  nom: string
  prenom?: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, color, icon }: { value: number; label: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, color, margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{label}</p>
      </div>
    </div>
  )
}

function BoostBanner({ onBoostClick }: { onBoostClick: () => void }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0F1117 0%, #1a2535 100%)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap size={22} style={{ color: '#F97316' }} />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>
            Boostez votre annonce et obtenez <span style={{ color: '#F97316' }}>3x plus de vues</span>
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '3px 0 0' }}>
            Dès 2 500 FCFA · Wave, Orange Money, MTN, Moov
          </p>
        </div>
      </div>
      <button
        onClick={onBoostClick}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #F97316, #ef4444)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 16px rgba(249,115,22,0.4)', flexShrink: 0 }}
      >
        <Zap size={15} style={{ fill: 'white' }} />
        Booster une annonce
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: Ad['status'] }) {
  const cfg = {
    active: { icon: <CheckCircle size={10} />, label: 'Active', bg: '#f0fdf4', color: '#16a34a' },
    pending: { icon: <Clock size={10} />, label: 'En attente', bg: '#fefce8', color: '#a16207' },
    rejected: { icon: <XCircle size={10} />, label: 'Refusée', bg: '#fef2f2', color: '#dc2626' },
  }[status]

  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function AdRow({ ad, deleting, onDelete, onBoost }: {
  ad: Ad
  deleting: boolean
  onDelete: (id: string, title: string) => void
  onBoost: (ad: Ad) => void
}) {
  const boosted = !!ad.boost_level
  const thumb = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '0.5px solid #f3f4f6' }}>
      <div style={{ width: 52, height: 52, borderRadius: 10, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
        {thumb
          ? <img src={thumb} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📦</div>
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
            {ad.title ?? 'Sans titre'}
          </p>
          {boosted && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#F97316', background: '#fff7ed', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>
              Boosté
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#F97316', margin: '2px 0 0' }}>{formatFCFA(ad.price)}</p>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '1px 0 0' }}>{ad.city ?? '-'} · {ad.category_id ?? '-'}</p>
      </div>

      <StatusBadge status={ad.status} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <Link href={`/ad/${ad.id}`} target="_blank" title="Voir" style={{ padding: '6px 8px', borderRadius: 8, color: '#9ca3af', display: 'flex', textDecoration: 'none' }}>
          <Eye size={17} />
        </Link>
        <Link href={`/ad/${ad.id}/edit`} title="Modifier" style={{ padding: '6px 8px', borderRadius: 8, color: '#9ca3af', display: 'flex', textDecoration: 'none' }}>
          <PencilLine size={17} />
        </Link>

        <button
          onClick={() => onBoost(ad)}
          disabled={boosted}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: 'none', background: boosted ? '#f3f4f6' : 'linear-gradient(135deg, #F97316, #ef4444)', color: boosted ? '#9ca3af' : '#fff', fontSize: 11, fontWeight: 700, cursor: boosted ? 'default' : 'pointer' }}
        >
          <Zap size={12} style={{ fill: boosted ? 'none' : 'white' }} />
          {boosted ? 'Boosté' : '2 500 F'}
        </button>

        <button
          onClick={() => onDelete(ad.id, ad.title ?? 'cette annonce')}
          disabled={deleting}
          title="Supprimer"
          style={{ padding: '6px 8px', borderRadius: 8, color: deleting ? '#fca5a5' : '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
        >
          {deleting
            ? <div style={{ width: 17, height: 17, border: '2px solid #fca5a5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            : <Trash2 size={17} />
          }
        </button>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, setUser } = useStore()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [authChecked, setAuthChecked] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [boostTarget, setBoostTarget] = useState<Ad | null>(null)

  const fetchedRef = useRef(false)

  // ── Étape 1 : vérifier la session UNE SEULE FOIS, avec timeout de sécurité ──
  useEffect(() => {
    let cancelled = false

    // Timeout de sécurité : si Supabase ne répond pas en 5s → rediriger
    const timeout = setTimeout(() => {
      if (!cancelled && !authChecked) {
        setAuthChecked(true)
        setAuthed(false)
      }
    }, 5000)

    async function checkSession() {
      try {
        // getSession() lit le JWT en cache local → quasi instantané
        const { data: { session } } = await supabase.auth.getSession()

        if (cancelled) return

        if (!session?.user) {
          setAuthChecked(true)
          setAuthed(false)
          return
        }

        // Mettre à jour le store si nécessaire (sans appel réseau supplémentaire)
        if (!user && session.user) {
          setUser({ id: session.user.id, email: session.user.email ?? '' } as Parameters<typeof setUser>[0])
        }

        setAuthed(true)
        setAuthChecked(true)
      } catch {
        if (!cancelled) {
          setAuthChecked(true)
          setAuthed(false)
        }
      } finally {
        clearTimeout(timeout)
      }
    }

    checkSession()
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Étape 2 : charger profil + annonces en parallèle une fois auth confirmée ──
  useEffect(() => {
    if (!authChecked || !authed) return
    if (fetchedRef.current) return
    fetchedRef.current = true

    async function fetchData() {
      setDataLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const uid = user?.id ?? session?.user?.id
        if (!uid) return

        // Profil + annonces en parallèle → deux fois plus rapide
        const [profileRes, adsRes] = await Promise.allSettled([
          supabase.from('profiles').select('prenom, nom').eq('id', uid).single(),
          supabase
            .from('ads')
            .select('id, title, price, status, category_id, city, images, created_at, boost_level')
            .eq('user_id', uid)
            .order('created_at', { ascending: false }),
        ])

        if (profileRes.status === 'fulfilled' && profileRes.value.data) {
          setProfile(profileRes.value.data as Profile)
        }

        if (adsRes.status === 'fulfilled') {
          const { data: userAds, error } = adsRes.value
          if (error) {
            console.error('Erreur fetch annonces:', error.message)
            toast.error('Impossible de charger vos annonces')
          }
          setAds(Array.isArray(userAds) ? (userAds as Ad[]) : [])
        }
      } catch (err) {
        console.error('fetchData error:', err)
        toast.error('Erreur de chargement')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, authed])

  // ── Redirection si non connecté ───────────────────────────────────────────
  if (authChecked && !authed) {
    if (typeof window !== 'undefined') {
      window.location.href = '/?auth=login&redirect=/dashboard'
    }
    return null
  }

  // ── Écran de chargement ───────────────────────────────────────────────────
  if (!authChecked || dataLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', gap: 12 }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ width: 32, height: 32, border: '3px solid #F97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#9ca3af' }}>
          {!authChecked ? 'Vérification de la session…' : 'Chargement de vos annonces…'}
        </p>
      </div>
    )
  }

  // ── Données calculées ─────────────────────────────────────────────────────
  const activeCount = ads.filter(a => a.status === 'active').length
  const pendingCount = ads.filter(a => a.status === 'pending').length
  const boostedCount = ads.filter(a => !!a.boost_level).length
  const prenom = profile?.prenom || profile?.nom?.split(' ')[0] || ''

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" définitivement ?`)) return
    setDeleting(id)
    try {
      const { error } = await supabase.from('ads').delete().eq('id', id)
      if (error) throw error
      setAds(prev => prev.filter(a => a.id !== id))
      toast.success('Annonce supprimée')
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  const handleBoostSuccess = async () => {
    setBoostTarget(null)
    toast.success('Annonce boostée avec succès !')
    const { data: { session } } = await supabase.auth.getSession()
    const uid = user?.id ?? session?.user?.id
    if (!uid) return
    const { data } = await supabase
      .from('ads')
      .select('id, title, price, status, category_id, city, images, created_at, boost_level')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (data) setAds(data as Ad[])
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Toaster position="top-center" />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Retour accueil */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
            Abidjan<span style={{ color: '#F97316' }}>Deals</span>
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, background: '#fff7ed', color: '#F97316', border: '1px solid #fed7aa', borderRadius: 6, padding: '2px 7px' }}>
            ← Accueil
          </span>
        </Link>
      </div>

      {boostTarget && (
        <BoostModal
          adId={boostTarget.id}
          adTitle={boostTarget.title ?? ''}
          userId={user?.id ?? ''}
          onClose={() => setBoostTarget(null)}
          onSuccess={handleBoostSuccess}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
            Bonjour{prenom ? `, ${prenom}` : ''} 👋
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Gérez vos annonces AbidjanDeals</p>
        </div>
        <Link href="/publier" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F97316', color: 'white', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          <PlusCircle size={16} /> Nouvelle annonce
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard value={ads.length} label="Total annonces" color="#F97316" icon={<Package size={18} />} />
        <StatCard value={activeCount} label="Actives" color="#16a34a" icon={<TrendingUp size={18} />} />
        <StatCard value={boostedCount} label="Boostées" color="#7c3aed" icon={<Star size={18} />} />
      </div>

      {ads.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <BoostBanner onBoostClick={() => setBoostTarget(ads.find(a => !a.boost_level) ?? ads[0])} />
        </div>
      )}

      {authChecked && authed && !profile && !dataLoading && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#a16207' }}>
          Profil temporairement indisponible — vos annonces restent accessibles.
        </div>
      )}

      {/* Liste annonces */}
      <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Mes annonces</h2>
          <Link href="/publier" style={{ fontSize: 12, color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>+ Publier</Link>
        </div>

        {ads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📦</p>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
              Vous n'avez pas encore d'annonces publiées.
            </p>
            <Link href="/publier" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F97316', color: 'white', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              <PlusCircle size={18} /> Publier ma première annonce
            </Link>
          </div>
        ) : (
          ads.map(ad => (
            <AdRow
              key={ad.id}
              ad={ad}
              deleting={deleting === ad.id}
              onDelete={handleDelete}
              onBoost={setBoostTarget}
            />
          ))
        )}
      </div>

      {pendingCount > 0 && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, fontSize: 13, color: '#c2410c' }}>
          <strong>{pendingCount} annonce{pendingCount > 1 ? 's' : ''}</strong> en attente de validation — vous pourrez les booster dès leur approbation.
        </div>
      )}
    </div>
  )
}
