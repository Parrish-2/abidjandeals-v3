'use client'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { CATEGORIES, CITIES } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Loader2, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const ETATS = ['Neuf', 'Très bon état', 'Bon état', 'État correct', 'Pour pièces']

export default function PublierPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    etat: '',
    marque: '',
    city: '',
    quartier: '',
    tel: '',
    whatsapp: '',
  })

  const selectedCat = CATEGORIES.find(c => c.id === form.category)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const newFiles = [...images, ...files].slice(0, 5)
    setImages(newFiles)
    setPreviews(newFiles.map(f => URL.createObjectURL(f)))
  }

  function removeImage(i: number) {
    const newFiles = images.filter((_, idx) => idx !== i)
    setImages(newFiles)
    setPreviews(newFiles.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Connectez-vous pour publier'); setLoading(false); return }

      // Upload images
      const uploadedUrls: string[] = []
      for (const file of images) {
        const ext = file.name.split('.').pop()
        const path = `ads/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('ads-media').upload(path, file)
        if (!error) {
          const { data } = supabase.storage.from('ads-media').getPublicUrl(path)
          uploadedUrls.push(data.publicUrl)
        }
      }

      const { error } = await supabase.from('ads').insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        price: parseInt(form.price),
        category_id: form.category,
        subcategory: form.subcategory,
        etat: form.etat,
        marque: form.marque,
        city: form.city,
        quartier: form.quartier,
        tel: form.tel,
        whatsapp: form.whatsapp || form.tel,
        images: uploadedUrls,
        status: 'pending',
        views: 0,
      })

      if (error) { toast.error('Erreur: ' + error.message); setLoading(false); return }

      setSuccess(true)
      toast.success('Annonce publiée ! En attente de validation.')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err) {
      toast.error('Une erreur est survenue')
    }
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <CheckCircle size={64} className="text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900">Annonce publiée !</h1>
        <p className="text-gray-500">Votre annonce est en cours de validation (24h max).</p>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" />
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Publier une annonce</h1>
        <p className="text-gray-500 text-sm mb-8">Remplissez les informations pour mettre en vente votre article.</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Catégorie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-800">Catégorie</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat.id, subcategory: '' }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition ${form.category === cat.id ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>
            {selectedCat && (
              <select name="subcategory" value={form.subcategory} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                <option value="">Sous-catégorie (optionnel)</option>
                {selectedCat.subcats.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {/* Infos principales */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-800">Informations</h2>
            <input name="title" value={form.title} onChange={handleChange} required
              placeholder="Titre de l'annonce *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              placeholder="Description détaillée..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input name="price" value={form.price} onChange={handleChange} required type="number"
                placeholder="Prix (FCFA) *" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
              <input name="marque" value={form.marque} onChange={handleChange}
                placeholder="Marque (optionnel)" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <select name="etat" value={form.etat} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400">
              <option value="">État de l'article</option>
              {ETATS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Localisation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-800">Localisation</h2>
            <select name="city" value={form.city} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400">
              <option value="">Ville *</option>
              {CITIES.map(c => <option key={c} value={c.replace(/^[^\s]+\s/, '')}>{c}</option>)}
            </select>
            <input name="quartier" value={form.quartier} onChange={handleChange}
              placeholder="Quartier (optionnel)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-800">Contact</h2>
            <input name="tel" value={form.tel} onChange={handleChange} required
              placeholder="Téléphone * (+225...)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange}
              placeholder="WhatsApp (si différent du téléphone)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-800">Photos <span className="text-gray-400 font-normal text-sm">(max 5)</span></h2>
            <div className="grid grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition">
                  <Upload size={20} />
                  <span className="text-xs">Ajouter</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Publication...</> : '🚀 Publier mon annonce'}
          </button>
          <p className="text-center text-xs text-gray-400">* Champs obligatoires. Annonce en modération (24h max).</p>
        </form>
      </main>
      <Footer />
    </div>
  )
}