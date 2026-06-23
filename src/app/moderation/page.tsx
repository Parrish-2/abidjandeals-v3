'use client'

import { supabase } from '@/lib/supabase'
import { AlertTriangle, CheckCircle2, Eye, LogOut, RefreshCw, Shield, Trash2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  prenom: string
  nom: string
  email?: string
}

interface Ad {
  id: string
  title: string
  description: string
  price: number
  city: string
  category: string
  images: string[]
  status: string
  created_at: string
  user_id: string
  profiles: Profile | Profile[] | null
}

function getProfile(ad: Ad): Profile | null {
  if (!ad.profiles) return null
  if (Array.isArray(ad.profiles)) return ad.profiles[0] ?? null
  return ad.profiles
}

function fmtPrice(n: number) {
  return new Intl.NumberFormat('fr-CI').format(n) + ' FCFA'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

// ─── Photo Analysis ───────────────────────────────────────────────────────────

interface PhotoAnalysis {
  suspicious: boolean
  reasons: string[]
  score: number
}

function analyzePhotoUrl(url: string): PhotoAnalysis {
  const reasons: string[] = []
  let score = 0
  const lower = url.toLowerCase()
  const suspiciousDomains = [
    'shutterstock', 'gettyimages', 'istockphoto', 'dreamstime',
    'depositphotos', 'alamy', 'unsplash', 'pexels', 'pixabay',
    'amazon', 'aliexpress', 'jumia', 'cdiscount', 'fnac',
    'catalogue', 'catalog', 'studio', 'product-image', 'product_image',
  ]
  for (const domain of suspiciousDomains) {
    if (lower.includes(domain)) { reasons.push(`URL contient "${domain}"`); score += 40; break }
  }
  if (lower.includes('white-background') || lower.includes('fond-blanc')) {
    reasons.push("Fond blanc dans l'URL"); score += 30
  }
  if (lower.includes('stock') || lower.includes('royalty')) {
    reasons.push('Photo stock'); score += 35
  }
  if (url.includes('?') && (lower.includes('w=') || lower.includes('width='))) {
    reasons.push('Image redimensionnée'); score += 15
  }
  return { suspicious: score >= 30, reasons, score: Math.min(score, 100) }
}

async function analyzeImageDimensions(url: string): Promise<PhotoAnalysis> {
  return new Promise((resolve) => {
    const img = new Image()
    const reasons: string[] = []
    let score = 0
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img
      if (w > 2500 || h > 2500) { reasons.push(`Résolution très haute (${w}×${h}px)`); score += 25 }
      if (w === h) { reasons.push('Format carré (catalogue)'); score += 20 }
      if (w % 100 === 0 && h % 100 === 0) { reasons.push(`Dimensions rondes (${w}×${h})`); score += 10 }
      resolve({ suspicious: score >= 20, reasons, score: Math.min(score, 100) })
    }
    img.onerror = () => resolve({ suspicious: false, reasons: [], score: 0 })
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

async function analyzePhoto(url: string): Promise<PhotoAnalysis> {
  const urlAnalysis = analyzePhotoUrl(url)
  const dimAnalysis = await analyzeImageDimensions(url)
  return {
    suspicious: urlAnalysis.score + dimAnalysis.score >= 25,
    reasons: [...urlAnalysis.reasons, ...dimAnalysis.reasons],
    score: Math.min(urlAnalysis.score + dimAnalysis.score, 100),
  }
}

// ─── Composants UI ────────────────────────────────────────────────────────────

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      style={{ width: size, height: size, flexShrink: 0 }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; style: React.CSSProperties }> = {
    pending: { label: 'En attente', style: { background: 'rgba(251,191,36,0.15)', color: '#d97706', border: '1px solid rgba(251,191,36,0.3)' } },
    active: { label: 'Active', style: { background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)' } },
    rejected: { label: 'Rejetée', style: { background: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' } },
  }
  const c = cfg[status] ?? cfg.pending
  return (
    <span style={{
      ...c.style,
      fontSize: 10, fontWeight: 700,
      padding: '3px 8px', borderRadius: 20,
      whiteSpace: 'nowrap' as const,
      display: 'inline-block',
    }}>
      {c.label}
    </span>
  )
}

function SuspicionBadge({ analysis }: { analysis: PhotoAnalysis | null }) {
  if (!analysis) return (
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s infinite' }} />
  )
  if (!analysis.suspicious) {
    return (
      <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', padding: '2px 8px', borderRadius: 20 }}>
        ✓ OK
      </span>
    )
  }
  return (
    <span
      title={analysis.reasons.join('\n')}
      style={{
        fontSize: 10, fontWeight: 700,
        background: analysis.score >= 60 ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)',
        color: analysis.score >= 60 ? '#f87171' : '#fbbf24',
        border: `1px solid ${analysis.score >= 60 ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'}`,
        padding: '2px 8px', borderRadius: 20, cursor: 'help',
      }}
    >
      {analysis.score >= 60 ? '⚠ Suspect' : '~ Douteux'}
    </span>
  )
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

const REJECTION_REASONS = [
  { id: 'fake_photos', label: 'Photos non-réelles / Catalogue', message: 'Votre annonce a été refusée car nous privilégions les photos réelles. Merci de republier avec de vraies photos de votre produit.' },
  { id: 'bad_quality', label: 'Photos de mauvaise qualité', message: 'Votre annonce a été refusée en raison de la mauvaise qualité des photos. Merci de prendre des photos nettes et bien éclairées.' },
  { id: 'wrong_category', label: 'Mauvaise catégorie', message: 'Votre annonce a été refusée car elle est dans la mauvaise catégorie. Merci de la republier dans la bonne catégorie.' },
  { id: 'incomplete', label: 'Annonce incomplète', message: "Votre annonce manque d'informations importantes. Merci de la compléter avant de la republier." },
  { id: 'prohibited', label: 'Contenu interdit', message: 'Votre annonce contient du contenu non autorisé sur notre plateforme.' },
  { id: 'other', label: 'Autre motif', message: '' },
]

function RejectModal({ ad, onClose, onConfirm }: {
  ad: Ad
  onClose: () => void
  onConfirm: (reason: string, message: string) => void
}) {
  const [selected, setSelected] = useState(REJECTION_REASONS[0])
  const [custom, setCustom] = useState('')
  const finalMessage = selected.id === 'other' ? custom : selected.message

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, width: '100%', maxWidth: 460,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Motif de refus</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.title}</p>
        </div>
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REJECTION_REASONS.map(r => (
            <label key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="radio" name="reason"
                checked={selected.id === r.id}
                onChange={() => setSelected(r)}
                style={{ marginTop: 2, accentColor: '#f97316' }}
              />
              <span style={{ fontSize: 13, color: selected.id === r.id ? '#fb923c' : '#94a3b8', fontWeight: selected.id === r.id ? 600 : 400 }}>
                {r.label}
              </span>
            </label>
          ))}
          {selected.id === 'other' && (
            <textarea
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="Précisez le motif..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px',
                background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, fontSize: 13, color: '#e2e8f0',
                resize: 'none', outline: 'none', fontFamily: 'inherit',
              }}
            />
          )}
          {finalMessage && selected.id !== 'other' && (
            <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', margin: '0 0 4px' }}>Message au vendeur :</p>
              <p style={{ fontSize: 11, color: '#93c5fd', margin: 0, fontStyle: 'italic' }}>{finalMessage}</p>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(selected.label, finalMessage)}
            disabled={selected.id === 'other' && !custom.trim()}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              opacity: selected.id === 'other' && !custom.trim() ? 0.5 : 1,
            }}
          >
            Confirmer le refus
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Approve Button ───────────────────────────────────────────────────────────

function ApproveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <>
      <style>{`
        @keyframes glow-approve {
          0%,100% { box-shadow: 0 0 8px rgba(34,197,94,0.4), 0 0 20px rgba(34,197,94,0.2); }
          50%      { box-shadow: 0 0 16px rgba(34,197,94,0.7), 0 0 36px rgba(34,197,94,0.4); }
        }
        .btn-approve:not(:disabled) { animation: glow-approve 2s ease-in-out infinite; }
        .btn-approve:not(:disabled):hover { filter: brightness(1.1); transform: scale(1.02); }
        .btn-approve:not(:disabled):active { transform: scale(0.97); }
        .btn-approve { transition: filter 0.15s, transform 0.15s; }
      `}</style>
      <button
        onClick={onClick}
        disabled={loading}
        className="btn-approve"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 18px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: '#fff', fontSize: 12, fontWeight: 800,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1, fontFamily: 'inherit',
        }}
      >
        {loading ? <Spinner size={13} /> : <CheckCircle2 size={13} />}
        APPROUVER
      </button>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ModerationPage() {
  const router = useRouter()

  const [authUserId, setAuthUserId] = useState<string | null | undefined>(undefined)
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'active' | 'rejected'>('pending')
  const [photoAnalyses, setPhotoAnalyses] = useState<Record<string, PhotoAnalysis>>({})
  const [rejectingAd, setRejectingAd] = useState<Ad | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)
  const [massMode, setMassMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/')
      else setAuthUserId(data.session.user.id)
    })
  }, [router])

  // Fetch ads — ✅ FIX : utilise label_fr au lieu de name
  const fetchAds = useCallback(async () => {
    setLoading(true)
    setDbError(null)
    setSelected(new Set())

    const { data, error } = await supabase
      .from('ads')
      .select(`
        id, title, description, price, city, category_id,
        images, status, created_at, user_id,
        profiles(prenom, nom, email),
        categories(label_fr)
      `)
      .eq('status', filter)
      .order('created_at', { ascending: false })

    if (error) {
      setDbError(`Erreur Supabase [${error.code}]: ${error.message}`)
      toast.error('Erreur de chargement')
    } else {
      const mapped = (data || []).map((a: Record<string, unknown>) => ({
        ...a,
        // ✅ FIX : label_fr est le vrai nom de colonne dans ta table categories
        category: (a.categories as Record<string, string> | null)?.label_fr ?? a.category_id ?? '—',
        images: (a.images as string[]) || [],
      })) as Ad[]

      setAds(mapped)

      for (const ad of mapped) {
        if (ad.images?.[0]) {
          analyzePhoto(ad.images[0]).then(analysis =>
            setPhotoAnalyses(prev => ({ ...prev, [ad.id]: analysis }))
          )
        }
      }
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (authUserId) fetchAds()
  }, [fetchAds, authUserId])

  // Actions
  async function approveAd(id: string) {
    setProcessingId(id)
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'active' }),
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error)
      else {
        toast.success('Annonce approuvée !')
        setAds(p => p.filter(a => a.id !== id))
      }
    } catch { toast.error('Erreur serveur') }
    setProcessingId(null)
  }

  async function handleRejectConfirm(reason: string, message: string) {
    if (!rejectingAd) return
    const { id, user_id } = rejectingAd
    setRejectingAd(null)
    setProcessingId(id)

    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); setProcessingId(null); return }
    } catch { toast.error('Erreur serveur'); setProcessingId(null); return }

    // Notification optionnelle
    if (message && user_id) {
      await supabase.from('notifications').insert({
        user_id, type: 'ad_rejected',
        title: 'Annonce refusée', message, ad_id: id, read: false,
      }).then(({ error }) => { if (error) console.warn('Notif échouée:', error.message) })
    }

    toast.success('Annonce refusée')
    setAds(p => p.filter(a => a.id !== id))
    setProcessingId(null)
  }

  async function deleteAd(id: string) {
    if (!confirm('Supprimer définitivement cette annonce ?')) return
    setProcessingId(id)
    const ad = ads.find(a => a.id === id)
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, images: ad?.images || [] }),
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error)
      else { toast.success('Annonce supprimée'); setAds(p => p.filter(a => a.id !== id)) }
    } catch { toast.error('Erreur serveur') }
    setProcessingId(null)
  }

  async function massApprove() {
    const ids = Array.from(selected)
    await Promise.all(ids.map(id => approveAd(id)))
    setSelected(new Set())
    setMassMode(false)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (authUserId === undefined) return null

  const suspiciousCount = Object.values(photoAnalyses).filter(a => a.suspicious).length

  // ─── Styles constants ─────────────────────────────────────────────────────
  const BG_PAGE = '#0f1219'
  const BG_CARD = '#161b27'
  const BG_CARD2 = '#1a2035'
  const BORDER = 'rgba(255,255,255,0.07)'
  const TEXT_PRI = '#f1f5f9'
  const TEXT_SEC = '#64748b'
  const TEXT_MUT = '#475569'
  const ORANGE = '#f97316'

  return (
    <div style={{ minHeight: '100vh', background: BG_PAGE, color: TEXT_PRI, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Toaster position="top-center" toastOptions={{ style: { background: BG_CARD2, color: TEXT_PRI, border: `1px solid ${BORDER}` } }} />

      {rejectingAd && (
        <RejectModal
          ad={rejectingAd}
          onClose={() => setRejectingAd(null)}
          onConfirm={handleRejectConfirm}
        />
      )}

      {/* ── Topbar ── */}
      <header style={{
        background: BG_CARD, borderBottom: `1px solid ${BORDER}`,
        padding: '0 24px', height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: 17, fontWeight: 800, color: TEXT_PRI, letterSpacing: '-0.4px' }}>
            Abidjan<span style={{ color: ORANGE }}>Deals</span>
          </Link>
          <div style={{ width: 1, height: 18, background: BORDER }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={13} color={ORANGE} />
            <span style={{ fontSize: 10, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Administration
            </span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRI }}>Modération</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {suspiciousCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 12px', borderRadius: 20 }}>
              ⚠ {suspiciousCount} photo{suspiciousCount > 1 ? 's' : ''} suspecte{suspiciousCount > 1 ? 's' : ''}
            </span>
          )}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600, color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px', borderRadius: 8 }}>
            <LogOut size={13} /> Quitter
          </Link>
          <button
            onClick={() => { supabase.auth.signOut(); window.location.href = '/' }}
            style={{ fontSize: 12, color: TEXT_SEC, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

        {/* Erreur BDD */}
        {dbError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
            <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: 0 }}>Diagnostic BDD</p>
              <p style={{ fontSize: 11, color: '#fca5a5', margin: '4px 0 0', fontFamily: 'monospace', wordBreak: 'break-all' }}>{dbError}</p>
            </div>
            <button onClick={() => setDbError(null)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* Filtres + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {(['pending', 'active', 'rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setMassMode(false); setSelected(new Set()) }}
              style={{
                padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
                background: filter === s ? ORANGE : BG_CARD2,
                color: filter === s ? '#fff' : TEXT_SEC,
                boxShadow: filter === s ? `0 4px 14px rgba(249,115,22,0.3)` : 'none',
              }}
            >
              {s === 'pending' ? '⏳ En attente' : s === 'active' ? '✅ Actives' : '❌ Rejetées'}
            </button>
          ))}

          <button
            onClick={fetchAds}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: BG_CARD2, border: `1px solid ${BORDER}`, color: TEXT_SEC, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.5 : 1 }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            Actualiser
          </button>

          {filter === 'pending' && (
            <button
              onClick={() => setMassMode(m => !m)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: massMode ? 'rgba(249,115,22,0.15)' : BG_CARD2, border: `1px solid ${massMode ? 'rgba(249,115,22,0.3)' : BORDER}`, color: massMode ? ORANGE : TEXT_SEC, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {massMode ? '✕ Annuler' : 'Sélection multiple'}
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: 12, color: TEXT_MUT, background: BG_CARD2, border: `1px solid ${BORDER}`, padding: '6px 14px', borderRadius: 10 }}>
            {ads.length} annonce{ads.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Barre masse */}
        {massMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 12, padding: '12px 18px', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#fb923c', flex: 1 }}>
              {selected.size} annonce{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
            </span>
            <button
              onClick={massApprove}
              disabled={!selected.size}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', opacity: selected.size ? 1 : 0.5 }}
            >
              <CheckCircle2 size={13} /> Approuver la sélection
            </button>
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 13, color: TEXT_SEC, margin: 0 }}>Chargement des annonces...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : ads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px', background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 20 }}>
            <p style={{ fontSize: 48, margin: '0 0 16px' }}>🔭</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRI, margin: '0 0 6px' }}>
              Aucune annonce {filter === 'pending' ? 'en attente' : filter === 'active' ? 'active' : 'rejetée'}
            </p>
            <p style={{ fontSize: 13, color: TEXT_SEC, margin: '0 0 20px' }}>Tout est à jour !</p>
            <button
              onClick={fetchAds}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: ORANGE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}
            >
              <RefreshCw size={14} /> Réessayer
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ads.map(ad => {
              const analysis = photoAnalyses[ad.id] ?? null
              const profile = getProfile(ad)
              const isProcessing = processingId === ad.id

              return (
                <div
                  key={ad.id}
                  style={{
                    background: BG_CARD,
                    border: `1px solid ${massMode && selected.has(ad.id) ? 'rgba(249,115,22,0.4)' : analysis?.suspicious ? 'rgba(251,191,36,0.2)' : BORDER}`,
                    borderRadius: 16,
                    overflow: 'hidden',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Bandeau suspicion */}
                  {analysis?.suspicious && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.15)', padding: '8px 16px' }}>
                      <AlertTriangle size={13} color="#fbbf24" />
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', margin: 0 }}>
                        Photo suspecte (score: {analysis.score}/100) — {analysis.reasons.join(' · ')}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 16, padding: '16px' }}>
                    {/* Checkbox masse */}
                    {massMode && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 4 }}>
                        <input
                          type="checkbox"
                          checked={selected.has(ad.id)}
                          onChange={() => toggleSelect(ad.id)}
                          style={{ width: 16, height: 16, accentColor: ORANGE, cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    {/* Image */}
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ width: 110, height: 80, borderRadius: 12, overflow: 'hidden', background: BG_CARD2 }}>
                        {ad.images?.[0] ? (
                          <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <SuspicionBadge analysis={analysis} />
                        <span style={{ fontSize: 10, color: TEXT_MUT }}>
                          {ad.images?.length || 0} photo{(ad.images?.length || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Infos */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRI, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ad.title}
                          </h3>
                          <p style={{ fontSize: 12, color: TEXT_SEC, margin: '4px 0 0' }}>
                            {profile ? `${profile.prenom} ${profile.nom}` : 'Vendeur inconnu'}
                            {' · '}{ad.city}
                            {' · '}<span style={{ color: TEXT_MUT }}>{ad.category}</span>
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <StatusBadge status={ad.status} />
                            <span style={{ fontSize: 11, color: TEXT_MUT }}>{fmtDate(ad.created_at)}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: ORANGE, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {fmtPrice(ad.price)}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: TEXT_SEC, margin: '8px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ad.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    borderTop: `1px solid ${BORDER}`,
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px 16px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <a
                      href={`/ad/${ad.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}
                    >
                      <Eye size={13} /> Prévisualiser
                    </a>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {filter === 'pending' && (
                        <>
                          <button
                            onClick={() => setRejectingAd(ad)}
                            disabled={isProcessing}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: isProcessing ? 0.5 : 1 }}
                          >
                            <XCircle size={13} /> Refuser
                          </button>
                          <ApproveButton loading={isProcessing} onClick={() => approveAd(ad.id)} />
                        </>
                      )}
                      <button
                        onClick={() => deleteAd(ad.id)}
                        disabled={isProcessing}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', opacity: isProcessing ? 0.5 : 1 }}
                      >
                        {isProcessing ? <Spinner size={13} /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>
    </div>
  )
}