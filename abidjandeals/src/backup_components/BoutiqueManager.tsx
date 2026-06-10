'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { Store, Upload, ExternalLink, CheckCircle, Lock, Image, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────
// Ce composant est à intégrer dans src/app/dashboard/page.tsx
// Affichage conditionnel : uniquement si account_level === 'confirmed' || 'certified'
// ─────────────────────────────────────────────────────────────────────────────

export function BoutiqueManager() {
  const { user, setUser } = useStore()
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null)

  const logoRef   = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  // Champs éditables
  const [boutiqueName, setBoutiqueName]   = useState(user?.boutique_name || '')
  const [boutiqueDesc, setBoutiqueDesc]   = useState(user?.boutique_description || '')
  const [boutiqueSlug, setBoutiqueSlug]   = useState(user?.boutique_slug || '')
  const [active,       setActive]         = useState(user?.boutique_active ?? false)

  // Vérifie si l'utilisateur a accès à la boutique
  const hasAccess = user?.role === 'admin' ||
    user?.account_level === 'confirmed' ||
    user?.account_level === 'certified'

  if (!hasAccess) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Lock size={18} className="text-gray-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Ma Boutique</h3>
            <p className="text-xs text-gray-500">Réservé aux vendeurs Confirmés</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700 mb-3">
            🏪 Passez au niveau <strong>Confirmé</strong> pour obtenir votre boutique personnalisée avec logo, bannière et URL dédiée.
          </p>
          <a
            href="/vendeur#niveaux"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
          >
            Voir les plans →
          </a>
        </div>
      </div>
    )
  }

  // ── Upload image (logo ou bannière) ───────────────────────────────────────
  async function handleImageUpload(file: File, type: 'logo' | 'banner') {
    if (!user) return
    if (!file.type.startsWith('image/')) { toast.error('Fichier image requis'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 Mo'); return }

    setUploading(type)
    try {
      const ext  = file.name.split('.').pop()
      const path = `${user.id}/${type}-${Date.now()}.${ext}`
      const bucket = type === 'logo' ? 'boutique-logos' : 'boutique-banners'

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })
      if (upErr) throw upErr

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      const url = data.publicUrl

      // Sauvegarder l'URL dans profiles
      const column = type === 'logo' ? 'logo_url' : 'banner_url'
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ [column]: url })
        .eq('id', user.id)

      if (dbErr) throw dbErr

      // Mettre à jour le store
      setUser({ ...user, [column]: url })
      toast.success(type === 'logo' ? 'Logo mis à jour ✅' : 'Bannière mise à jour ✅')
    } catch (e: any) {
      toast.error(e.message || 'Erreur upload')
    } finally {
      setUploading(null)
    }
  }

  // ── Sauvegarder les infos boutique ────────────────────────────────────────
  async function handleSave() {
    if (!user) return

    // Valider le slug : lettres, chiffres, tirets uniquement
    const slugRegex = /^[a-z0-9-]+$/
    if (boutiqueSlug && !slugRegex.test(boutiqueSlug)) {
      toast.error('URL invalide : lettres minuscules, chiffres et tirets uniquement')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          boutique_name:        boutiqueName || `Boutique de ${user.prenom}`,
          boutique_description: boutiqueDesc,
          boutique_slug:        boutiqueSlug || null,
          boutique_active:      active,
        })
        .eq('id', user.id)

      if (error) throw error

      setUser({
        ...user,
        boutique_name:        boutiqueName,
        boutique_description: boutiqueDesc,
        boutique_slug:        boutiqueSlug,
        boutique_active:      active,
      })

      toast.success('Boutique mise à jour 🎉')
    } catch (e: any) {
      // Slug déjà pris
      if (e.message?.includes('unique')) {
        toast.error('Cette URL est déjà prise, choisissez-en une autre')
      } else {
        toast.error(e.message || 'Erreur sauvegarde')
      }
    } finally {
      setSaving(false)
    }
  }

  const boutiqueUrl = boutiqueSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/boutique/${boutiqueSlug}`
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Ma Boutique</h3>
              <p className="text-emerald-100 text-xs">Vendeur Confirmé ✅</p>
            </div>
          </div>
          {boutiqueUrl && active && (
            <a
              href={boutiqueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <ExternalLink size={13} /> Voir ma boutique
            </a>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Bannière ───────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Bannière <span className="text-gray-400 font-normal">(1200×300px recommandé)</span>
          </label>
          <div
            className="relative h-32 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-emerald-400 cursor-pointer transition-colors group"
            onClick={() => bannerRef.current?.click()}
          >
            {user?.banner_url ? (
              <>
                <img src={user.banner_url} alt="Bannière" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Image size={16} /> Changer la bannière
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
                {uploading === 'banner' ? (
                  <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={24} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                    <p className="text-sm text-gray-400 group-hover:text-emerald-500 transition-colors">
                      Cliquez pour ajouter une bannière
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          <input
            ref={bannerRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
          />
        </div>

        {/* ── Logo ───────────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Logo <span className="text-gray-400 font-normal">(carré recommandé)</span>
          </label>
          <div className="flex items-center gap-4">
            <div
              className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-emerald-400 cursor-pointer transition-colors group flex-shrink-0"
              onClick={() => logoRef.current?.click()}
            >
              {user?.logo_url ? (
                <>
                  <img src={user.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit3 size={14} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  {uploading === 'logo' ? (
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Logo de votre boutique</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Max 5 Mo</p>
              <button
                onClick={() => logoRef.current?.click()}
                className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {user?.logo_url ? 'Changer le logo' : 'Ajouter un logo'}
              </button>
            </div>
          </div>
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
          />
        </div>

        {/* ── Nom boutique ───────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Nom de la boutique *
          </label>
          <input
            type="text"
            value={boutiqueName}
            onChange={e => setBoutiqueName(e.target.value)}
            maxLength={60}
            placeholder={`Boutique de ${user?.prenom}`}
            className="input-field"
          />
        </div>

        {/* ── Description ────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Slogan / Description
          </label>
          <textarea
            value={boutiqueDesc}
            onChange={e => setBoutiqueDesc(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="Ex: Spécialiste iPhone reconditionnés à Abidjan · Livraison rapide"
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{boutiqueDesc.length}/200</p>
        </div>

        {/* ── URL personnalisée ──────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            URL de votre boutique
          </label>
          <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <span className="bg-gray-50 px-3 py-3 text-sm text-gray-400 border-r border-gray-200 whitespace-nowrap">
              abidjandeals.com/boutique/
            </span>
            <input
              type="text"
              value={boutiqueSlug}
              onChange={e => setBoutiqueSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="mon-shop"
              className="flex-1 px-3 py-3 text-sm outline-none bg-white"
            />
          </div>
          {boutiqueSlug && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle size={11} /> Votre boutique sera accessible sur :
              <span className="font-semibold">/boutique/{boutiqueSlug}</span>
            </p>
          )}
        </div>

        {/* ── Activer la boutique ────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-700">Boutique visible publiquement</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {active ? 'Votre boutique est accessible via son URL' : 'Votre boutique est masquée'}
            </p>
          </div>
          <button
            onClick={() => setActive(!active)}
            className={`relative w-12 h-6 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* ── Bouton sauvegarder ─────────────────────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-2xl transition-all hover:scale-[1.01]"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sauvegarde...</>
          ) : (
            <><CheckCircle size={16} /> Sauvegarder ma boutique</>
          )}
        </button>

      </div>
    </div>
  )
}
