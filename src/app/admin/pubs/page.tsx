'use client'

// src/app/admin/pubs/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Régie Publicitaire — Module Boost + Bannières
// Guard : role === 'ADMIN' vérifié via useStore() avant tout rendu
// Tables Supabase : `ads` (boosts) · `banners` (régie)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import toast, { Toaster } from 'react-hot-toast'
import { useStore } from '@/lib/store'
import { SmartBanner } from '@/components/SmartBanner'
import {
  BOOST_CONFIGS,
  PLACEMENT_LABELS,
  type BoostLevel,
  type BannerData,
  type BannerPlacement,
} from '@/types/admin'

// ─── Types locaux ─────────────────────────────────────────────────────────────

interface Ad {
  id: string
  title: string
  city: string
  category: string
  price: number
  status: string
  is_boosted: boolean
  boost_level: BoostLevel | null
  boost_until: string | null
  photos: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isBoostActive(boost_until: string | null): boolean {
  if (!boost_until) return false
  return new Date(boost_until) > new Date()
}

function daysLeft(boost_until: string | null): number {
  if (!boost_until) return 0
  return Math.max(0, Math.ceil((new Date(boost_until).getTime() - Date.now()) / 86_400_000))
}

const LEVEL_UI: Record<BoostLevel, { label: string; color: string; bg: string; border: string }> = {
  STANDARD: { label: '⚡ Standard', color: '#1D4ED8', bg: '#EFF6FF', border: '#93C5FD' },
  PREMIUM:  { label: '★ Premium',  color: '#7C3AED', bg: '#FDF4FF', border: '#D8B4FE' },
  URGENT:   { label: '🔥 Urgent',  color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
}

// ─── Styles inline réutilisables ──────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'white',
  border: '0.5px solid #e5e7eb',
  borderRadius: 12,
  padding: '16px 20px',
  marginBottom: 12,
}
const lbl: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 6,
  display: 'block',
}
const inp: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '0.5px solid #e5e7eb',
  fontSize: 13,
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'white',
}

// ✅ FIX CRITIQUE : Supabase au niveau module, PAS dans le composant
// Cela évite de recréer le client à chaque rendu ET permet aux hooks
// d'être appelés inconditionnellement avant le guard admin.
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Composant principal ───────────────────────────────────────────────────────

export default function PubsPage() {
  const { user } = useStore()

  // ✅ FIX CRITIQUE : TOUS les hooks sont déclarés ICI,
  // AVANT tout return conditionnel (règle des hooks React).
  // Auparavant ils étaient après le guard if(!user) → crash garanti.

  // Boosts
  const [tab,           setTab]           = useState<'boosts' | 'banners'>('boosts')
  const [ads,           setAds]           = useState<Ad[]>([])
  const [adsLoading,    setAdsLoading]    = useState(true)
  const [selectedAd,    setSelectedAd]    = useState<Ad | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<BoostLevel>('STANDARD')
  const [boostLoading,  setBoostLoading]  = useState(false)
  const [search,        setSearch]        = useState('')

  // Bannières
  const [banners,        setBanners]        = useState<BannerData[]>([])
  const [bannersLoading, setBannersLoading] = useState(true)
  const [bannerFile,     setBannerFile]     = useState<File | null>(null)
  const [bannerPreview,  setBannerPreview]  = useState<string | null>(null)
  const [uploadLoading,  setUploadLoading]  = useState(false)
  const [newBanner,      setNewBanner]      = useState({
    company_name: '',
    link_url: '',
    placement: 'homepage_top' as BannerPlacement,
    contract_end_date: '',
  })

  const fileRef = useRef<HTMLInputElement>(null)

  // ✅ useEffect AVANT le guard — si l'utilisateur n'est pas admin, on ne charge rien
  useEffect(() => {
    if (!user || user.role !== 'admin') return
    fetchAds()
    fetchBanners()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role])

  // ── ✅ GUARD ADMIN — placé APRÈS tous les hooks ───────────────────────────
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>🔒</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          Accès réservé aux administrateurs
        </p>
        <p style={{ fontSize: 13, color: '#6b7280' }}>
          Votre rôle actuel : <strong>{user?.role ?? 'non connecté'}</strong>
        </p>
        <p style={{ fontSize: 13, color: '#6b7280' }}>
          ID : <strong>{user?.id ?? '—'}</strong>
        </p>
      </div>
    )
  }

  // ── Fetch annonces ────────────────────────────────────────────────────────
  async function fetchAds() {
    setAdsLoading(true)
    const { data } = await supabase
      .from('ads')
      .select('id, title, city, category, price, status, is_boosted, boost_level, boost_until, photos')
      .order('created_at', { ascending: false })
    setAds((data as Ad[]) || [])
    setAdsLoading(false)
  }

  // ── Appliquer un boost ────────────────────────────────────────────────────
  async function applyBoost() {
    if (!selectedAd) return
    setBoostLoading(true)

    const config = BOOST_CONFIGS[selectedLevel]
    const boost_until = new Date(Date.now() + config.durationDays * 86_400_000).toISOString()

    const { error } = await supabase
      .from('ads')
      .update({ is_boosted: true, boost_level: selectedLevel, boost_until })
      .eq('id', selectedAd.id)

    if (error) {
      toast.error('Erreur : ' + error.message)
    } else {
      toast.success(`🚀 Boost ${selectedLevel} appliqué — ${config.durationDays} jours`)
      setSelectedAd(null)
      fetchAds()
    }
    setBoostLoading(false)
  }

  // ── Retirer un boost ──────────────────────────────────────────────────────
  async function removeBoost(id: string) {
    await supabase
      .from('ads')
      .update({ is_boosted: false, boost_level: null, boost_until: null })
      .eq('id', id)
    toast.success('Boost retiré')
    fetchAds()
  }

  // ── Fetch bannières ───────────────────────────────────────────────────────
  async function fetchBanners() {
    setBannersLoading(true)
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })

    const mapped: BannerData[] = (data || []).map((b: any) => ({
      id: b.id,
      company_name: b.company_name ?? '',
      image_url: b.image_url,
      link_url: b.link_url ?? null,
      placement: b.placement,
      active: b.active,
      contract_end: b.contract_end ? new Date(b.contract_end).getTime() : null,
      click_count: b.click_count ?? 0,
      created_at: b.created_at,
    }))
    setBanners(mapped)
    setBannersLoading(false)
  }

  // ── Upload bannière ───────────────────────────────────────────────────────
  async function uploadBanner() {
    if (!bannerFile) return
    setUploadLoading(true)

    const ext = bannerFile.name.split('.').pop()
    const filename = `banner_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filename, bannerFile, { upsert: true })

    if (uploadError) {
      toast.error('Upload échoué : ' + uploadError.message)
      setUploadLoading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(filename)

    const { error: insertError } = await supabase.from('banners').insert({
      company_name: newBanner.company_name || 'Annonceur',
      image_url:    urlData.publicUrl,
      link_url:     newBanner.link_url || null,
      placement:    newBanner.placement,
      active:       true,
      click_count:  0,
      contract_end: newBanner.contract_end_date
        ? new Date(newBanner.contract_end_date).toISOString()
        : null,
    })

    if (insertError) {
      toast.error('Erreur BDD : ' + insertError.message)
    } else {
      toast.success('✅ Bannière ajoutée')
      setBannerFile(null)
      setBannerPreview(null)
      setNewBanner({ company_name: '', link_url: '', placement: 'homepage_top', contract_end_date: '' })
      fetchBanners()
    }
    setUploadLoading(false)
  }

  async function toggleBanner(id: string, active: boolean) {
    await supabase.from('banners').update({ active: !active }).eq('id', id)
    fetchBanners()
  }

  async function deleteBanner(banner: BannerData) {
    if (!confirm('Supprimer cette bannière ?')) return
    const filename = banner.image_url.split('/').pop()
    if (filename) await supabase.storage.from('banners').remove([filename])
    await supabase.from('banners').delete().eq('id', banner.id)
    toast.success('🗑️ Supprimée')
    fetchBanners()
  }

  const filteredAds = ads.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase())
  )
  const boostedAds = ads.filter((a) => isBoostActive(a.boost_until))

  // ── RENDU ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Toaster position="top-center" />

      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Régie Publicitaire
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>
          Boosts d&apos;annonces et bannières publicitaires — Connecté en tant que&nbsp;
          <strong style={{ color: '#111827' }}>{user.prenom} {user.nom}</strong>
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Annonces boostées', value: boostedAds.length,                                                        color: '#F97316' },
          { label: 'Boost URGENT',      value: boostedAds.filter(a => a.boost_level === 'URGENT').length,                color: '#DC2626' },
          { label: 'Boost PREMIUM',     value: boostedAds.filter(a => a.boost_level === 'PREMIUM').length,               color: '#7C3AED' },
          { label: 'Bannières actives', value: banners.filter(b => b.active).length,                                     color: '#16a34a' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {s.label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#f3f4f6', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {(['boosts', 'banners'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
              background: tab === t ? '#F97316' : 'transparent',
              color: tab === t ? 'white' : '#6b7280',
            }}
          >
            {t === 'boosts' ? '🚀 Boosts annonces' : '🖼️ Bannières'}
          </button>
        ))}
      </div>

      {/* ════════════════ BOOSTS ════════════════ */}
      {tab === 'boosts' && (
        <div>
          {boostedAds.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <span style={lbl}>Boosts actifs ({boostedAds.length})</span>
              {boostedAds.map((ad) => {
                const lvl = ad.boost_level ? LEVEL_UI[ad.boost_level] : null
                return (
                  <div
                    key={ad.id}
                    style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, borderLeft: `3px solid ${lvl?.color ?? '#F97316'}` }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                      {ad.photos?.[0]
                        ? <img src={ad.photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ad.title}
                      </p>
                      <p style={{ fontSize: 11, color: '#6b7280' }}>{ad.city} · {ad.category}</p>
                    </div>
                    {lvl && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: lvl.color, background: lvl.bg, border: `0.5px solid ${lvl.border}`, borderRadius: 6, padding: '3px 10px', flexShrink: 0 }}>
                        {lvl.label}
                      </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316', background: '#fff7ed', border: '0.5px solid #fed7aa', borderRadius: 6, padding: '3px 10px', flexShrink: 0 }}>
                      {daysLeft(ad.boost_until)}j restants
                    </span>
                    <button
                      onClick={() => removeBoost(ad.id)}
                      style={{ padding: '6px 12px', borderRadius: 7, border: '0.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                    >
                      Retirer
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <div style={card}>
            <span style={lbl}>Appliquer un boost</span>

            <input
              style={{ ...inp, marginBottom: 12 }}
              placeholder="🔍 Rechercher par titre ou ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 16, border: '0.5px solid #e5e7eb', borderRadius: 8 }}>
              {adsLoading ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Chargement...</div>
              ) : filteredAds.map((ad) => (
                <div
                  key={ad.id}
                  onClick={() => setSelectedAd(selectedAd?.id === ad.id ? null : ad)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: '0.5px solid #f3f4f6',
                    background: selectedAd?.id === ad.id ? '#fff7ed' : 'white',
                    borderLeft: selectedAd?.id === ad.id ? '3px solid #F97316' : '3px solid transparent',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                    {ad.photos?.[0]
                      ? <img src={ad.photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ad.title}
                    </p>
                    <p style={{ fontSize: 11, color: '#6b7280' }}>{ad.city} · {ad.price.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  {isBoostActive(ad.boost_until) && ad.boost_level && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: LEVEL_UI[ad.boost_level].color, background: LEVEL_UI[ad.boost_level].bg, border: `0.5px solid ${LEVEL_UI[ad.boost_level].border}`, borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>
                      {LEVEL_UI[ad.boost_level].label}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {selectedAd && (
              <>
                <span style={lbl}>
                  Niveau de boost pour :{' '}
                  <strong style={{ color: '#111827' }}>{selectedAd.title}</strong>
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                  {(Object.entries(BOOST_CONFIGS) as [BoostLevel, typeof BOOST_CONFIGS[BoostLevel]][]).map(([level, cfg]) => {
                    const ui = LEVEL_UI[level]
                    const isSelected = selectedLevel === level
                    return (
                      <div
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        style={{ padding: '14px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'center', border: isSelected ? `2px solid ${ui.border}` : '1px solid #e5e7eb', background: isSelected ? ui.bg : 'white' }}
                      >
                        <p style={{ fontSize: 15, fontWeight: 800, color: ui.color, marginBottom: 4 }}>{ui.label}</p>
                        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{cfg.durationDays} jours · ×{cfg.multiplier} visibilité</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{cfg.price.toLocaleString('fr-FR')} FCFA</p>
                        {isSelected && <p style={{ fontSize: 10, color: ui.color, fontWeight: 700, marginTop: 4 }}>✓ Sélectionné</p>}
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={applyBoost}
                  disabled={boostLoading}
                  style={{ padding: 11, width: '100%', borderRadius: 8, border: 'none', background: '#F97316', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: boostLoading ? 0.5 : 1 }}
                >
                  {boostLoading ? 'Application...' : `🚀 Appliquer Boost ${selectedLevel} — ${BOOST_CONFIGS[selectedLevel].durationDays}j`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ BANNIÈRES ════════════════ */}
      {tab === 'banners' && (
        <div>
          <div style={card}>
            <span style={lbl}>Ajouter une bannière</span>

            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: 24, textAlign: 'center', cursor: 'pointer', marginBottom: 12, background: '#fafafa' }}
            >
              {bannerPreview
                ? <img src={bannerPreview} style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8 }} alt="Aperçu" />
                : <>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>🖼️</p>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>Cliquez pour uploader une image</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>PNG, JPG, WebP</p>
                  </>
              }
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)) }
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <span style={lbl}>Nom de l&apos;entreprise</span>
                <input style={inp} placeholder="Orange CI" value={newBanner.company_name} onChange={(e) => setNewBanner((p) => ({ ...p, company_name: e.target.value }))} />
              </div>
              <div>
                <span style={lbl}>Emplacement</span>
                <select style={{ ...inp }} value={newBanner.placement} onChange={(e) => setNewBanner((p) => ({ ...p, placement: e.target.value as BannerPlacement }))}>
                  {(Object.entries(PLACEMENT_LABELS) as [BannerPlacement, string][]).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <span style={lbl}>Lien de redirection</span>
                <input style={inp} placeholder="https://..." value={newBanner.link_url} onChange={(e) => setNewBanner((p) => ({ ...p, link_url: e.target.value }))} />
              </div>
              <div>
                <span style={lbl}>Fin de contrat</span>
                <input type="date" style={inp} value={newBanner.contract_end_date} onChange={(e) => setNewBanner((p) => ({ ...p, contract_end_date: e.target.value }))} />
              </div>
            </div>

            <button
              onClick={uploadBanner}
              disabled={!bannerFile || uploadLoading}
              style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#16a34a', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: !bannerFile || uploadLoading ? 0.5 : 1 }}
            >
              {uploadLoading ? 'Upload...' : '✅ Ajouter la bannière'}
            </button>
          </div>

          <span style={lbl}>Bannières existantes ({banners.length})</span>

          {bannersLoading ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Chargement...</div>
          ) : banners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, background: 'white', borderRadius: 12, border: '0.5px solid #e5e7eb' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🖼️</p>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Aucune bannière pour l&apos;instant</p>
            </div>
          ) : banners.map((banner) => {
            const dl = banner.contract_end
              ? Math.max(0, Math.ceil((banner.contract_end - Date.now()) / 86_400_000))
              : null
            const isExpired = banner.contract_end !== null && Date.now() > banner.contract_end

            return (
              <div key={banner.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                  <img
                    src={banner.image_url}
                    style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 7, border: '0.5px solid #e5e7eb', flexShrink: 0 }}
                    alt={banner.company_name}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{banner.company_name || '—'}</p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 2 }}>
                      {PLACEMENT_LABELS[banner.placement as BannerPlacement] ?? banner.placement}
                    </p>
                    {banner.link_url && (
                      <p style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🔗 {banner.link_url}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#2563EB', background: '#EFF6FF', borderRadius: 4, padding: '2px 7px', fontWeight: 600 }}>
                        {banner.click_count} clics
                      </span>
                      {dl !== null && (
                        <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 4, padding: '2px 7px', color: isExpired ? '#991B1B' : dl <= 5 ? '#C2410C' : '#065F46', background: isExpired ? '#FEE2E2' : dl <= 5 ? '#FFF7ED' : '#D1FAE5' }}>
                          {isExpired ? '✕ Expiré' : `${dl}j restants`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => toggleBanner(banner.id, banner.active)}
                      style={{ padding: '6px 12px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: banner.active ? '#f0fdf4' : '#f3f4f6', color: banner.active ? '#16a34a' : '#6b7280' }}
                    >
                      {banner.active ? '✓ Active' : '○ Inactive'}
                    </button>
                    <button
                      onClick={() => deleteBanner(banner)}
                      style={{ padding: '6px 12px', borderRadius: 7, border: '0.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '0.5px solid #f3f4f6', paddingTop: 12 }}>
                  <span style={{ ...lbl, marginBottom: 8 }}>
                    Aperçu SmartBanner
                    {isExpired && <span style={{ color: '#DC2626', marginLeft: 6 }}>(contrat expiré — non affiché)</span>}
                  </span>
                  <SmartBanner banner={banner} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
