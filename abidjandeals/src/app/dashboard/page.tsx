'use client'

import { BoostModal } from '@/components/BoostModal'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import { formatFCFA } from '@/lib/format'
import { useStore } from '@/lib/store'
import { usePlan } from '@/hooks/usePlan'
import { supabase } from '@/lib/supabase'
import {
  CheckCircle, Clock, Eye, KeyRound, Package,
  PencilLine, PlusCircle, Star, Store, Trash2, TrendingUp, XCircle, Zap,
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

interface BoutiqueProfile {
  boutique_slug: string | null
  boutique_name: string | null
  boutique_description: string | null
  logo_url: string | null
  banner_url: string | null
  boutique_active: boolean | null
  level: string | null
  role: string | null
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

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
      <button onClick={onBoostClick}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #F97316, #ef4444)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 16px rgba(249,115,22,0.4)', flexShrink: 0 }}>
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
  ad: Ad; deleting: boolean
  onDelete: (id: string, title: string) => void
  onBoost: (ad: Ad) => void
}) {
  const boosted = !!ad.boost_level
  const thumb = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '0.5px solid #f3f4f6' }}>
      <div style={{ width: 52, height: 52, borderRadius: 10, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
        {thumb ? <img src={thumb} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📦</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{ad.title ?? 'Sans titre'}</p>
          {boosted && <span style={{ fontSize: 10, fontWeight: 700, color: '#F97316', background: '#fff7ed', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>Boosté</span>}
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#F97316', margin: '2px 0 0' }}>{formatFCFA(ad.price)}</p>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '1px 0 0' }}>{ad.city ?? '-'} · {ad.category_id ?? '-'}</p>
      </div>
      <StatusBadge status={ad.status} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <Link href={`/ad/${ad.id}`} target="_blank" title="Voir" style={{ padding: '6px 8px', borderRadius: 8, color: '#9ca3af', display: 'flex', textDecoration: 'none' }}><Eye size={17} /></Link>
        <Link href={`/ad/${ad.id}/edit`} title="Modifier" style={{ padding: '6px 8px', borderRadius: 8, color: '#9ca3af', display: 'flex', textDecoration: 'none' }}><PencilLine size={17} /></Link>
        <button onClick={() => onBoost(ad)} disabled={boosted}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: 'none', background: boosted ? '#f3f4f6' : 'linear-gradient(135deg, #F97316, #ef4444)', color: boosted ? '#9ca3af' : '#fff', fontSize: 11, fontWeight: 700, cursor: boosted ? 'default' : 'pointer' }}>
          <Zap size={12} style={{ fill: boosted ? 'none' : 'white' }} />{boosted ? 'Boosté' : '2 500 F'}
        </button>
        <button onClick={() => onDelete(ad.id, ad.title ?? 'cette annonce')} disabled={deleting} title="Supprimer"
          style={{ padding: '6px 8px', borderRadius: 8, color: deleting ? '#fca5a5' : '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
          {deleting
            ? <div style={{ width: 17, height: 17, border: '2px solid #fca5a5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            : <Trash2 size={17} />}
        </button>
      </div>
    </div>
  )
}

// ─── Onglet Ma Boutique ───────────────────────────────────────────────────────

function BoutiqueTab({ userId }: { userId: string }) {
  const [boutique, setBoutique] = useState<BoutiqueProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const [form, setForm] = useState({
    boutique_name: '',
    boutique_slug: '',
    boutique_description: '',
    boutique_active: false,
  })

  const logoRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('boutique_slug, boutique_name, boutique_description, logo_url, banner_url, boutique_active, level, role')
        .eq('id', userId)
        .single()
      if (data) {
        setBoutique(data as BoutiqueProfile)
        setForm({
          boutique_name: data.boutique_name ?? '',
          boutique_slug: data.boutique_slug ?? '',
          boutique_description: data.boutique_description ?? '',
          boutique_active: data.boutique_active ?? false,
        })
      }
      setLoading(false)
    }
    load()
  }, [userId])

  async function handleSave() {
    if (!form.boutique_name.trim()) return toast.error('Le nom de la boutique est requis')

    const slug = form.boutique_slug.trim()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    if (!slug) return toast.error('L\'URL est invalide')

    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      boutique_name: form.boutique_name.trim(),
      boutique_slug: slug,
      boutique_description: form.boutique_description.trim(),
      boutique_active: form.boutique_active,
    }).eq('id', userId)

    if (error) {
      toast.error(error.message.includes('unique') ? 'Cette URL est déjà prise' : 'Erreur : ' + error.message)
    } else {
      toast.success('Boutique mise à jour ✅')
      setBoutique(prev => prev ? { ...prev, ...form, boutique_slug: slug } : prev)
      setForm(f => ({ ...f, boutique_slug: slug }))
    }
    setSaving(false)
  }

  async function handleImageUpload(file: File, type: 'logo' | 'banner') {
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingBanner
    setUploading(true)

    const ext = file.name.split('.').pop()
    const filename = `${type}_${userId}_${Date.now()}.${ext}`
    const bucket = 'avatars'

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filename, file, { upsert: true })
    if (uploadError) { toast.error('Upload échoué'); setUploading(false); return }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename)
    const field = type === 'logo' ? 'logo_url' : 'banner_url'

    const { error } = await supabase.from('profiles').update({ [field]: urlData.publicUrl }).eq('id', userId)
    if (error) { toast.error('Erreur BDD'); setUploading(false); return }

    setBoutique(prev => prev ? { ...prev, [field]: urlData.publicUrl } : prev)
    toast.success(type === 'logo' ? 'Logo mis à jour ✅' : 'Bannière mise à jour ✅')
    setUploading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid #e5e7eb', fontSize: 13, color: '#111827',
    outline: 'none', boxSizing: 'border-box', background: 'white', fontFamily: 'inherit',
  }
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block',
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>

  const isConfirmed = boutique?.level === 'confirmed' || boutique?.level === 'certified' || boutique?.role === 'admin'

  if (!isConfirmed) {
    return (
      <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: '#fff7ed', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>🔒</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Boutique Pro réservée aux vendeurs Confirmés</p>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
          Passez au niveau Confirmé (KYC) pour accéder à votre boutique personnalisée avec logo, bannière et URL dédiée.
        </p>
        <Link href="/vendeur" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F97316', color: 'white', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          Passer Confirmé →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Aperçu boutique */}
      {boutique?.boutique_slug && (
        <div style={{ background: 'linear-gradient(135deg, #0F1117, #1a2535)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={18} color="#F97316" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{boutique.boutique_name || 'Ma boutique'}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>kivoo.ci/boutique/{boutique.boutique_slug}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/boutique/${boutique.boutique_slug}`} target="_blank"
              style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              Voir ma boutique →
            </Link>
            <span style={{ padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: boutique.boutique_active ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.05)', color: boutique.boutique_active ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
              {boutique.boutique_active ? '● Active' : '○ Inactive'}
            </span>
          </div>
        </div>
      )}

      {/* Logo + Bannière */}
      <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Visuels de la boutique</p>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Logo */}
          <div>
            <span style={lbl}>Logo (carré, 200×200px min)</span>
            <div style={{ position: 'relative', width: 100, height: 100, borderRadius: 16, border: '1px dashed #e5e7eb', overflow: 'hidden', cursor: 'pointer', background: '#f9fafb' }}
              onClick={() => logoRef.current?.click()}>
              {boutique?.logo_url
                ? <img src={boutique.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" />
                : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: 24 }}>🏪</span>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Ajouter</span>
                </div>}
              {uploadingLogo && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 20, border: '2px solid #F97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>}
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'logo') }} />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Cliquer pour changer</p>
          </div>

          {/* Bannière */}
          <div>
            <span style={lbl}>Bannière (970×250px recommandé)</span>
            <div style={{ position: 'relative', width: '100%', height: 80, borderRadius: 10, border: '1px dashed #e5e7eb', overflow: 'hidden', cursor: 'pointer', background: '#f9fafb' }}
              onClick={() => bannerRef.current?.click()}>
              {boutique?.banner_url
                ? <img src={boutique.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Bannière" />
                : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: 20 }}>🖼️</span>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Ajouter une bannière</span>
                </div>}
              {uploadingBanner && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 20, border: '2px solid #F97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>}
            </div>
            <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'banner') }} />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Cliquer pour changer</p>
          </div>
        </div>
      </div>

      {/* Informations boutique */}
      <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Informations</p>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={lbl}>Nom de la boutique *</label>
            <input style={inp} placeholder="Ex: Patrick Auto CI" value={form.boutique_name}
              onChange={e => {
                const name = e.target.value
                const autoSlug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                setForm(f => ({ ...f, boutique_name: name, boutique_slug: f.boutique_slug || autoSlug }))
              }} />
          </div>

          <div>
            <label style={lbl}>URL personnalisée *</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
              <span style={{ padding: '10px 12px', background: '#f9fafb', color: '#9ca3af', fontSize: 12, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>kivoo.ci/boutique/</span>
              <input style={{ ...inp, border: 'none', borderRadius: 0 }} placeholder="mon-nom" value={form.boutique_slug}
                onChange={e => setForm(f => ({ ...f, boutique_slug: e.target.value }))} />
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Uniquement lettres minuscules, chiffres et tirets</p>
          </div>

          <div>
            <label style={lbl}>Description (optionnel)</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
              placeholder="Décrivez votre boutique en quelques mots..."
              value={form.boutique_description}
              onChange={e => setForm(f => ({ ...f, boutique_description: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.boutique_active}
                onChange={e => setForm(f => ({ ...f, boutique_active: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: '#F97316', cursor: 'pointer' }} />
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Boutique visible publiquement</span>
            </label>
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: saving ? '#e5e7eb' : 'linear-gradient(135deg, #F97316, #ef4444)', color: saving ? '#9ca3af' : '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}>
            {saving ? 'Enregistrement...' : '✅ Enregistrer la boutique'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

type Tab = 'annonces' | 'boutique'

export default function DashboardPage() {
  const { user, setUser } = useStore()
  const { isPro, isTrial } = usePlan()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [authChecked, setAuthChecked] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [boostTarget, setBoostTarget] = useState<Ad | null>(null)
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('annonces')

  const fetchedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(() => {
      if (!cancelled && !authChecked) { setAuthChecked(true); setAuthed(false) }
    }, 20000)

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return
        if (!session?.user) { setAuthChecked(true); setAuthed(false); return }
        if (!user && session.user) {
          setUser({ id: session.user.id, email: session.user.email ?? '' } as Parameters<typeof setUser>[0])
        }
        setAuthed(true); setAuthChecked(true)
      } catch {
        if (!cancelled) { setAuthChecked(true); setAuthed(false) }
      } finally { clearTimeout(timeout) }
    }

    checkSession()
    return () => { cancelled = true; clearTimeout(timeout) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

        const [profileRes, adsRes] = await Promise.allSettled([
          supabase.from('profiles').select('prenom, nom').eq('id', uid).single(),
          supabase.from('ads')
            .select('id, title, price, status, category_id, city, images, created_at, boost_level')
            .eq('user_id', uid)
            .order('created_at', { ascending: false }),
        ])

        if (profileRes.status === 'fulfilled' && profileRes.value.data) setProfile(profileRes.value.data as Profile)
        if (adsRes.status === 'fulfilled') {
          const { data: userAds, error } = adsRes.value
          if (error) toast.error('Impossible de charger vos annonces')
          setAds(Array.isArray(userAds) ? (userAds as Ad[]) : [])
        }
      } catch {
        toast.error('Erreur de chargement')
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, authed])

  if (authChecked && !authed) {
    if (typeof window !== 'undefined') window.location.href = '/?auth=login&redirect=/dashboard'
    return null
  }

  if (!authChecked || dataLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', gap: 12 }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ width: 32, height: 32, border: '3px solid #F97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#9ca3af' }}>{!authChecked ? 'Vérification de la session…' : 'Chargement de vos annonces…'}</p>
      </div>
    )
  }

  const activeCount = ads.filter(a => a.status === 'active').length
  const pendingCount = ads.filter(a => a.status === 'pending').length
  const boostedCount = ads.filter(a => !!a.boost_level).length
  const prenom = profile?.prenom || profile?.nom?.split(' ')[0] || ''

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
    } finally { setDeleting(null) }
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

  const userId = user?.id ?? ''

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Toaster position="top-center" />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}

      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>ki<span style={{ color: '#F97316' }}>voo</span></span>
          <span style={{ fontSize: 10, fontWeight: 700, background: '#fff7ed', color: '#F97316', border: '1px solid #fed7aa', borderRadius: 6, padding: '2px 7px' }}>← Accueil</span>
        </Link>
        <button onClick={() => setShowChangePwd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <KeyRound size={14} color="#F97316" /> Changer mon mot de passe
        </button>
      </div>

      {boostTarget && (
        <BoostModal adId={boostTarget.id} adTitle={boostTarget.title ?? ''} userId={userId}
          onClose={() => setBoostTarget(null)} onSuccess={handleBoostSuccess} />
      )}

      {/* Header utilisateur */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Bonjour{prenom ? `, ${prenom}` : ''} 👋</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>
            {isPro && (
              <span style={{ fontSize: 11, fontWeight: 700, background: isTrial ? '#fff7ed' : '#0F1117', color: isTrial ? '#ea580c' : '#F5C842', border: isTrial ? '1px solid #fed7aa' : '1px solid #F5C842', borderRadius: 20, padding: '2px 10px', display: 'inline-block', marginBottom: 6 }}>
                {isTrial ? 'Pro - Essai gratuit' : 'Abonnement Pro actif'}
              </span>
            )}
            <br />Gérez vos annonces et votre boutique KIVOO</p>
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

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f3f4f6', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {([
          { id: 'annonces', label: '📋 Mes annonces', count: ads.length },
          { id: 'boutique', label: '🏪 Ma boutique', count: null },
        ] as { id: Tab; label: string; count: number | null }[]).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', background: activeTab === tab.id ? 'white' : 'transparent', color: activeTab === tab.id ? '#111827' : '#6b7280', boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
            {tab.label}
            {tab.count !== null && (
              <span style={{ fontSize: 11, fontWeight: 700, background: activeTab === tab.id ? '#F97316' : '#d1d5db', color: 'white', borderRadius: 20, padding: '1px 7px' }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu onglets */}
      {activeTab === 'annonces' && (
        <>
          {authChecked && authed && !profile && !dataLoading && (
            <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#a16207' }}>
              Profil temporairement indisponible — vos annonces restent accessibles.
            </div>
          )}
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Mes annonces</h2>
              <Link href="/publier" style={{ fontSize: 12, color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>+ Publier</Link>
            </div>
            {ads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📦</p>
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Vous n'avez pas encore d'annonces publiées.</p>
                <Link href="/publier" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F97316', color: 'white', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  <PlusCircle size={18} /> Publier ma première annonce
                </Link>
              </div>
            ) : (
              ads.map(ad => (
                <AdRow key={ad.id} ad={ad} deleting={deleting === ad.id} onDelete={handleDelete} onBoost={setBoostTarget} />
              ))
            )}
          </div>

          {pendingCount > 0 && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, fontSize: 13, color: '#c2410c' }}>
              <strong>{pendingCount} annonce{pendingCount > 1 ? 's' : ''}</strong> en attente de validation — vous pourrez les booster dès leur approbation.
            </div>
          )}
        </>
      )}

      {activeTab === 'boutique' && userId && <BoutiqueTab userId={userId} />}
    </div>
  )
}
