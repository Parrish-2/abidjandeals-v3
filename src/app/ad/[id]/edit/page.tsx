'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowLeft, Save, Loader2, ImagePlus, X, AlertTriangle } from 'lucide-react'

// ─── Constantes ────────────────────────────────────────────────────────────────

const CITIES_ABIDJAN = [
  'Cocody', 'Yopougon', 'Abobo', 'Marcory', 'Koumassi',
  'Adjamé', 'Treichville', 'Port-Bouët', 'Bingerville', 'Anyama', 'Plateau',
]
const CITIES_AUTRES = [
  'Grand-Bassam', 'Bouaké', 'Yamoussoukro', 'San-Pédro',
  'Korhogo', 'Daloa', 'Assinie', 'Man', 'Gagnoa', 'Divo', 'Abengourou',
]
const ETATS = ['Neuf', 'Très bon état', 'Bon état', 'État correct', 'À réparer']

// ─── Types ──────────────────────────────────────────────────────────────────────

interface AdForm {
  title: string
  description: string
  price: string
  city: string
  quartier: string
  etat: string
  marque: string
  tel: string
  whatsapp: string
}

interface AdData extends AdForm {
  id: string
  user_id: string
  category_id: string
  images: string[]
  status: string
  boost_level: string | null
}

// ─── Helper erreur ─────────────────────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (!err) return 'Erreur inconnue'
  if (typeof err === 'string') return err
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.error_description === 'string') return obj.error_description
  }
  return 'Erreur inconnue'
}

// ─── Composant image preview ────────────────────────────────────────────────────

function ImageThumb({ src, onRemove, isPrimary }: { src: string; onRemove: () => void; isPrimary: boolean }) {
  const [error, setError] = useState(false)
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
      {error ? (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Indisponible</div>
      ) : (
        <img src={src} alt="" onError={() => setError(true)} className="w-full h-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-white shadow transition"
      >
        <X size={11} />
      </button>
      {isPrimary && (
        <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
          Principale
        </span>
      )}
    </div>
  )
}

// ─── Page principale ────────────────────────────────────────────────────────────

export default function EditAdPage() {
  const router = useRouter()
  const params = useParams()
  const adId = params?.id as string
  const { user } = useStore()

  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notFound,   setNotFound]   = useState(false)
  const [forbidden,  setForbidden]  = useState(false)

  const [images,      setImages]      = useState<string[]>([])
  const [newFiles,    setNewFiles]    = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [uploading,   setUploading]   = useState(false)

  const [form, setForm] = useState<AdForm>({
    title: '', description: '', price: '', city: '',
    quartier: '', etat: '', marque: '', tel: '', whatsapp: '',
  })

  // ─── Chargement de l'annonce ─────────────────────────────────────────────────

  useEffect(() => {
    if (!adId) return

    async function loadAd() {
      setLoading(true)
      const { data, error } = await supabase
        .from('ads')
        .select('id, user_id, category_id, title, description, price, city, quartier, etat, marque, tel, whatsapp, images, status, boost_level')
        .eq('id', adId)
        .maybeSingle() // ✅ maybeSingle évite l'erreur si 0 ligne

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const ad = data as AdData

      // ✅ Autoriser si propriétaire OU admin
      if (ad.user_id !== user?.id && user?.role !== 'admin') {
        setForbidden(true)
        setLoading(false)
        return
      }

      setImages(ad.images || [])
      setForm({
        title:       ad.title       || '',
        description: ad.description || '',
        price:       ad.price       ? String(ad.price) : '',
        city:        ad.city        || '',
        quartier:    ad.quartier    || '',
        etat:        ad.etat        || '',
        marque:      ad.marque      || '',
        tel:         ad.tel         || '',
        whatsapp:    ad.whatsapp    || '',
      })
      setLoading(false)
    }

    loadAd()
  // ✅ FIX : user?.role ajouté dans les dépendances (était manquant)
  }, [adId, user?.id, user?.role])

  // ─── Gestion champs ───────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setForm(prev => ({ ...prev, [name]: value }))
    },
    []
  )

  // ─── Gestion images ───────────────────────────────────────────────────────────

  const handleAddImages = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      const total = images.length + newFiles.length + files.length
      if (total > 8) { toast.error('Maximum 8 photos par annonce'); return }
      const previews = files.map(f => URL.createObjectURL(f))
      setNewFiles(prev => [...prev, ...files])
      setNewPreviews(prev => [...prev, ...previews])
    },
    [images.length, newFiles.length]
  )

  const removeExistingImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const removeNewImage = useCallback((index: number) => {
    URL.revokeObjectURL(newPreviews[index])
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }, [newPreviews])

  // ─── Upload images ────────────────────────────────────────────────────────────

  const uploadNewImages = useCallback(async (): Promise<string[]> => {
    if (newFiles.length === 0) return []
    setUploading(true)
    const uploaded: string[] = []

    for (const file of newFiles) {
      const ext  = file.name.split('.').pop() || 'jpg'
      const path = `ads/${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('ads-images')
        .upload(path, file, { upsert: false, contentType: file.type })

      if (error) { toast.error(`Erreur upload: ${error.message}`); continue }

      const { data: urlData } = supabase.storage.from('ads-images').getPublicUrl(path)
      if (urlData?.publicUrl) uploaded.push(urlData.publicUrl)
    }

    setUploading(false)
    return uploaded
  }, [newFiles, user])

  // ─── Soumission ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!form.title.trim()) { toast.error('Le titre est obligatoire'); return }
      if (!form.price || isNaN(Number(form.price))) { toast.error('Prix invalide'); return }
      if (!form.city) { toast.error('La ville est obligatoire'); return }

      setSubmitting(true)
      const toastId = toast.loading('Sauvegarde en cours...')

      try {
        const freshUrls   = await uploadNewImages()
        const finalImages = [...images, ...freshUrls]

        let query = supabase
          .from('ads')
          .update({
            title:       form.title.trim(),
            description: form.description.trim(),
            price:       Number(form.price),
            city:        form.city,
            quartier:    form.quartier || null,
            etat:        form.etat     || null,
            marque:      form.marque   || null,
            tel:         form.tel      || null,
            whatsapp:    form.whatsapp || null,
            images:      finalImages,
          })
          .eq('id', adId)

        if (user?.role !== 'admin') {
          query = query.eq('user_id', user!.id)
        }

        const { error } = await query
        if (error) throw error

        toast.success('Annonce mise à jour !', { id: toastId, duration: 4000 })
        router.push(`/ad/${adId}`)
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        toast.error(`Erreur : ${msg}`, { id: toastId })
      } finally {
        setSubmitting(false)
      }
    },
    [form, images, adId, user, uploadNewImages, router]
  )

  // ─── États d'erreur ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-orange-500" />
        </div>
        <Footer />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <AlertTriangle size={40} className="text-orange-400" />
          <h1 className="text-xl font-bold text-gray-800">Annonce introuvable</h1>
          <p className="text-gray-500 text-sm">Cette annonce n&apos;existe pas ou a été supprimée.</p>
          <Link href="/" className="text-orange-500 font-semibold hover:underline">
            Retour à l&apos;accueil
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <AlertTriangle size={40} className="text-red-400" />
          <h1 className="text-xl font-bold text-gray-800">Accès refusé</h1>
          <p className="text-gray-500 text-sm">Vous n&apos;êtes pas autorisé à modifier cette annonce.</p>
          <Link href="/dashboard" className="text-orange-500 font-semibold hover:underline">
            Mon tableau de bord
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const allImages = [...images, ...newPreviews]
  const canAddMore = allImages.length < 8

  // ─── Rendu ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" />
      <Navbar />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* En-tête */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={`/ad/${adId}`}
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
            >
              <ArrowLeft size={17} />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">Modifier l&apos;annonce</h1>
              <p className="text-sm text-gray-400">Les modifications sont immédiates</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Photos ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-[15px] mb-4">Photos</h2>

              <div className="grid grid-cols-3 gap-2">
                {images.map((src, i) => (
                  <ImageThumb key={`existing-${i}`} src={src} onRemove={() => removeExistingImage(i)} isPrimary={i === 0 && newPreviews.length === 0} />
                ))}
                {newPreviews.map((src, i) => (
                  <ImageThumb key={`new-${i}`} src={src} onRemove={() => removeNewImage(i)} isPrimary={images.length === 0 && i === 0} />
                ))}
                {canAddMore && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-orange-300 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer">
                    <ImagePlus size={20} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-medium">Ajouter</span>
                    <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleAddImages} className="hidden" />
                  </label>
                )}
              </div>

              {uploading && (
                <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                  <Loader2 size={14} className="animate-spin" /> Upload en cours...
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">{allImages.length}/8 photos · JPG, PNG, WebP</p>
            </div>

            {/* ── Informations ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-gray-800 text-[15px]">Informations</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input name="title" value={form.title} onChange={handleChange} maxLength={100} placeholder="Ex: iPhone 14 Pro Max 256 Go"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} maxLength={2000} placeholder="Décrivez votre article en détail..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Prix (FCFA) <span className="text-red-500">*</span>
                </label>
                <input name="price" value={form.price} onChange={handleChange} type="number" min="0" placeholder="Ex: 150000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">État</label>
                  <select name="etat" value={form.etat} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white">
                    <option value="">Sélectionner</option>
                    {ETATS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Marque</label>
                  <input name="marque" value={form.marque} onChange={handleChange} placeholder="Ex: Samsung, Toyota..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
                </div>
              </div>
            </div>

            {/* ── Localisation & Contact ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-gray-800 text-[15px]">Localisation &amp; Contact</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ville <span className="text-red-500">*</span>
                </label>
                <select name="city" value={form.city} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white">
                  <option value="">Sélectionner une ville</option>
                  <optgroup label="── Abidjan ──">
                    {CITIES_ABIDJAN.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="── Autres Villes ──">
                    {CITIES_AUTRES.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quartier</label>
                <input name="quartier" value={form.quartier} onChange={handleChange} placeholder="Ex: Cocody Riviera, Zone 4..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
                  <input name="tel" value={form.tel} onChange={handleChange} type="tel" placeholder="+225 07 00 00 00 00"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                  <input name="whatsapp" value={form.whatsapp} onChange={handleChange} type="tel" placeholder="+225 07 00 00 00 00"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
                </div>
              </div>
            </div>

            {/* ── Boutons ── */}
            <div className="flex gap-3 pb-6">
              <Link href={`/ad/${adId}`}
                className="flex-1 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm text-center hover:bg-gray-50 transition">
                Annuler
              </Link>
              <button type="submit" disabled={submitting || uploading}
                className="flex-1 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition">
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" /> Sauvegarde...</>
                  : <><Save size={16} /> Sauvegarder</>
                }
              </button>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
