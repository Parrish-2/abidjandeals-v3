'use client'

import { useState, useCallback, useRef } from 'react'   // ← ajoute useRef
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import toast, { Toaster } from 'react-hot-toast'
import { Volume2, VolumeX } from 'lucide-react'          // ← ajoute cet import

const CATEGORIES = [
  { slug: 'immobilier',   label: 'Immobilier',     emoji: '🏠', videoInfo: '3 min max' },
  { slug: 'vehicules',    label: 'Véhicules',       emoji: '🚗', videoInfo: '2 min max' },
  { slug: 'electronique', label: 'Électronique',    emoji: '📱', videoInfo: '1 min max' },
  { slug: 'mode',         label: 'Mode & Beauté',   emoji: '👗', videoInfo: '45 sec max' },
  { slug: 'emploi',       label: 'Emploi',          emoji: '💼', videoInfo: '1 min max' },
  { slug: 'alimentation', label: 'Alimentation',    emoji: '🍽️', videoInfo: '45 sec max' },
  { slug: 'services',     label: 'Services',        emoji: '🛠️', videoInfo: '1 min max' },
  { slug: 'animaux',      label: 'Animaux',         emoji: '🐾', videoInfo: '45 sec max' },
  { slug: 'sport',        label: 'Sport & Loisirs', emoji: '⚽', videoInfo: '1 min max' },
  { slug: 'autres',       label: 'Autres',          emoji: '📦', videoInfo: '1 min max' },
]

const CITIES = [
  'Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro',
  'Korhogo', 'Daloa', 'Man', 'Divo', 'Gagnoa', 'Autre'
]

// ─── Sous-composant preview vidéo ─────────────────────────────────────────────
function VideoPreviewThumb({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !muted
    setMuted(next)
    if (videoRef.current) videoRef.current.muted = next
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted        // requis pour l'autoplay navigateur
        playsInline  // iOS : pas de plein écran automatique
        preload="metadata"
        className="w-full h-full object-cover"
        style={{ pointerEvents: 'none', display: 'block' }}
      />

      {/* Badge "Vidéo" */}
      <div className="absolute top-1 left-1 bg-black/60 rounded px-1.5 py-0.5">
        <span className="text-white text-[9px] font-semibold tracking-wide">VIDÉO</span>
      </div>

      {/* Bouton toggle son */}
      <button
        type="button"
        onClick={toggleMute}
        title={muted ? 'Activer le son' : 'Couper le son'}
        className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/60 rounded-full px-1.5 py-0.5 z-10"
      >
        {muted
          ? <VolumeX size={9} className="text-white/80" />
          : <Volume2 size={9} className="text-white" />
        }
        <span className="text-[8px] text-white/80 font-medium">
          {muted ? 'off' : 'on'}
        </span>
      </button>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CreateAdPage() {
  const router = useRouter()
  const { user } = useStore()
  const { uploadFiles, uploading, progress, acceptedFormats, videoLimits } = useMediaUpload()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    city: '',
    tel: '',
    negotiable: false,
  })

  const selectedCategory = CATEGORIES.find(c => c.slug === form.category)
  const videoLimit = form.category ? videoLimits[form.category] : null

  const handleMediaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + mediaFiles.length > 8) {
      toast.error('Maximum 8 médias par annonce')
      return
    }
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setMediaFiles(prev => [...prev, ...files])
    setMediaPreviews(prev => [...prev, ...newPreviews])
  }, [mediaFiles.length])

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index])
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
    setMediaPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user) { toast.error('Connectez-vous pour publier'); return }
    if (!form.title.trim()) { toast.error('Ajoutez un titre'); return }
    if (!form.category) { toast.error('Choisissez une catégorie'); return }
    if (!form.city) { toast.error('Indiquez votre ville'); return }
    if (!form.price || isNaN(Number(form.price))) { toast.error('Entrez un prix valide'); return }

    setSubmitting(true)
    const toastId = toast.loading('📤 Publication en cours...')

    try {
      let photos: string[] = []
      let video_url: string | undefined

      if (mediaFiles.length > 0) {
        toast.loading('🗜️ Compression et upload...', { id: toastId })
        const result = await uploadFiles(mediaFiles, user.id, form.category)
        photos = result.photos
        video_url = result.videoUrl
      }

      const { error } = await supabase
        .from('ads')
        .insert({
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          category: form.category,
          city: form.city,
          tel: form.tel.trim() || user.tel || '',
          photos,
          video_url,
          user_id: user.id,
          status: 'pending',
          views: 0,
          boost_level: 0,
        })

      if (error) throw error

      toast.success('🎉 Annonce soumise ! En attente de validation.', { id: toastId, duration: 5000 })
      router.push('/dashboard')

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      toast.error(`Erreur: ${message}`, { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const canGoNext = () => {
    if (step === 1) return form.title.trim().length > 3 && !!form.category && !!form.city
    if (step === 2) return !!form.price
    return true
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-lg">←</button>
        <h1 className="font-bold text-gray-900">Publier une annonce</h1>
      </div>

      {/* Steps */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step > s ? 'bg-green-500 text-white' : step === s ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-xs ${step === s ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? 'Infos' : s === 2 ? 'Prix' : 'Médias'}
              </span>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* ÉTAPE 1 — Infos */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: iPhone 14 Pro Max 256Go"
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Décrivez votre article en détail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">Catégorie *</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.slug }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition ${
                      form.category === cat.slug
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">Ville *</label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, city }))}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                      form.city === city
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Prix */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix (FCFA) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="Ex: 150000"
                  min={0}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.negotiable}
                  onChange={e => setForm(f => ({ ...f, negotiable: e.target.checked }))}
                  className="w-5 h-5 rounded text-orange-500"
                />
                <span className="text-sm text-gray-700">Prix négociable</span>
              </label>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de contact</label>
              <input
                type="tel"
                value={form.tel}
                onChange={e => setForm(f => ({ ...f, tel: e.target.value }))}
                placeholder="+225 07 XX XX XX XX"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Laissez vide pour utiliser celui de votre profil</p>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Médias ─────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Photos & Vidéo</h3>
              <p className="text-xs text-gray-500">Max 8 fichiers · Images compressées automatiquement en WebP</p>
              {videoLimit && selectedCategory && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700">
                  📹 Vidéo {selectedCategory.label} : max <strong>{selectedCategory.videoInfo}</strong> · max <strong>{videoLimit.maxSizeMB}MB</strong>
                </div>
              )}
            </div>

            {/* Zone de dépôt */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-8 cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition">
              <span className="text-3xl mb-2">📁</span>
              <span className="text-sm text-gray-500 font-medium">Cliquez pour ajouter des médias</span>
              <span className="text-xs text-gray-400 mt-1">JPG · PNG · WebP · MP4</span>
              <input type="file" multiple accept={acceptedFormats} onChange={handleMediaChange} className="hidden" />
            </label>

            {/* ── Grille de prévisualisations ─────────────────────────────── */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">

                    {/* ✅ Vidéo : autoplay silencieux + toggle son */}
                    {mediaFiles[i]?.type.startsWith('video') ? (
                      <VideoPreviewThumb src={src} />
                    ) : (
                      /* Image normale */
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    )}

                    {/* Bouton supprimer */}
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs shadow z-20"
                    >✕</button>

                    {/* Badge "Principale" sur la première miniature */}
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-md z-10">
                        Principale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Barre de progression upload */}
            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Upload en cours...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Boutons fixes en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
              className="flex-1 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              ← Retour
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)}
              disabled={!canGoNext()}
              className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition"
            >
              Continuer →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl transition"
            >
              {submitting ? '...' : '✅ Publier l\'annonce'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
