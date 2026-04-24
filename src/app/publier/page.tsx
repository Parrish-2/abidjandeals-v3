'use client'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { CATEGORIES, CITIES } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { CheckCircle, ChevronRight, Loader2, MapPin, Phone, Save, Upload, Video, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

// â”€â”€ Quartiers par ville â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const QUARTIERS: Record<string, string[]> = {
  'Abidjan': [
    'Abobo', 'AdjamÃ©', 'AttÃ©coubÃ©', 'Cocody', 'Koumassi', 'Marcory',
    'Plateau', 'Port-BouÃ«t', 'Treichville', 'Yopougon', 'Bingerville',
    'Riviera', 'AngrÃ©', 'Deux-Plateaux', 'Bassam', 'Songon',
    'Zone 4', 'Zone industrielle', 'Vridi', 'Williamsville',
    'Carrefour Bandji', "N'dotrÃ©", "M'Pouto", 'Anoumabo',
  ],
  'BouakÃ©': ['Centre', 'Air France', 'Belleville', 'Commerce', 'Koko', "N'Gattakro", 'Sokoura'],
  'Yamoussoukro': ['Habitat', 'Centre', 'Dioulakro', "N'Zuessy", 'MorofÃ©'],
  'San-PÃ©dro': ['Centre', 'Bardot', 'CitÃ©', 'Zone industrielle'],
  'Korhogo': ['Centre', 'Commerce', 'RÃ©sidentiel'],
  'Daloa': ['Centre', 'Lobia', 'Tazibouo'],
  'Man': ['Centre', 'Libreville', 'Domoraud'],
  'Gagnoa': ['Centre', 'Dioulabougou', 'RÃ©sidentiel'],
}

type ExtraField = { name: string; label: string; type?: string; options?: string[]; placeholder?: string }
type CatConfig = { etats: string[]; extraFields: ExtraField[] }

// â”€â”€ Champs dynamiques â€” IDs alignÃ©s sur src/lib/data.ts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CATEGORY_FIELDS: Record<string, CatConfig> = {
  cat_auto: {
    etats: ['Neuf', 'TrÃ¨s bon Ã©tat', 'Bon Ã©tat', 'Ã‰tat correct', 'Pour piÃ¨ces'],
    extraFields: [
      { name: 'marque', label: 'Marque *', placeholder: 'Toyota, Kia, Renault...' },
      { name: 'modele', label: 'ModÃ¨le', placeholder: 'Prado, Forte, Duster...' },
      { name: 'annee', label: 'AnnÃ©e', type: 'number', placeholder: '2020' },
      { name: 'kilometrage', label: 'KilomÃ©trage (km)', type: 'number', placeholder: '45000' },
      { name: 'carburant', label: 'Carburant', type: 'select', options: ['Essence', 'Diesel', 'Hybride', 'Ã‰lectrique', 'GPL'] },
      { name: 'boite', label: 'BoÃ®te de vitesse', type: 'select', options: ['Automatique', 'Manuelle'] },
    ],
  },
  cat_immo: {
    etats: ['Neuf', 'Bon Ã©tat', 'Ã€ rÃ©nover'],
    extraFields: [
      { name: 'type_bien', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison', 'Villa', 'Terrain', 'Bureau', 'EntrepÃ´t', 'Chambre'] },
      { name: 'surface', label: 'Surface (mÂ²)', type: 'number', placeholder: '120' },
      { name: 'pieces', label: 'Nombre de piÃ¨ces', type: 'select', options: ['Studio', '2 piÃ¨ces', '3 piÃ¨ces', '4 piÃ¨ces', '5 piÃ¨ces', '6+'] },
      { name: 'meuble', label: 'MeublÃ© ?', type: 'select', options: ['Oui', 'Non', 'Partiellement'] },
    ],
  },
  cat_tech: {
    etats: ['Neuf', 'ReconditionnÃ©', 'TrÃ¨s bon Ã©tat', 'Bon Ã©tat', 'Ã€ rÃ©parer'],
    extraFields: [
      { name: 'marque', label: 'Marque *', placeholder: 'Apple, Samsung, HP...' },
      { name: 'modele', label: 'ModÃ¨le', placeholder: 'iPhone 15, Galaxy S24...' },
      { name: 'stockage', label: 'Stockage', type: 'select', options: ['32 Go', '64 Go', '128 Go', '256 Go', '512 Go', '1 To', '2 To'] },
      { name: 'ram', label: 'RAM', type: 'select', options: ['2 Go', '4 Go', '6 Go', '8 Go', '12 Go', '16 Go', '32 Go'] },
      { name: 'couleur', label: 'Couleur', placeholder: 'Noir, Blanc, Or...' },
    ],
  },
  cat_elec: {
    etats: ['Neuf', 'TrÃ¨s bon Ã©tat', 'Bon Ã©tat', 'En panne'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'LG, Samsung, Midea...' },
      { name: 'modele', label: 'ModÃ¨le / RÃ©fÃ©rence', placeholder: 'RÃ©fÃ©rence du produit' },
      { name: 'capacite', label: 'CapacitÃ© / Puissance', placeholder: '350L, 1.5CV, 7kg...' },
    ],
  },
  cat_location: {
    etats: ['Disponible', 'Sous rÃ©serve'],
    extraFields: [
      { name: 'capacite', label: 'CapacitÃ© / Places', placeholder: '30 personnes, 300 invitÃ©s...' },
      { name: 'duree_min', label: 'DurÃ©e minimale', placeholder: '1 jour, 1 semaine...' },
      { name: 'caution', label: 'Caution (FCFA)', type: 'number', placeholder: '50000' },
    ],
  },
  cat_serv: {
    etats: ['Disponible', 'Sur rendez-vous'],
    extraFields: [
      { name: 'experience', label: 'ExpÃ©rience', type: 'select', options: ["Moins d'1 an", '1-3 ans', '3-5 ans', '5-10 ans', 'Plus de 10 ans'] },
      { name: 'deplacement', label: 'DÃ©placement', type: 'select', options: ['Ã€ domicile', 'En boutique', 'Les deux'] },
      { name: 'delai', label: "DÃ©lai d'intervention", placeholder: '24h, 1 semaine...' },
    ],
  },
  cat_bebe: {
    etats: ['Neuf', 'TrÃ¨s bon Ã©tat', 'Bon Ã©tat'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'Chicco, Graco...' },
      { name: 'age_cible', label: 'Ã‚ge cible', type: 'select', options: ['0-3 mois', '3-6 mois', '6-12 mois', '1-2 ans', '2-3 ans', '3-5 ans', '5+ ans'] },
    ],
  },
  cat_pharma: {
    etats: ['Neuf', 'Non ouvert', 'EntamÃ©'],
    extraFields: [
      { name: 'marque', label: 'Marque / Laboratoire', placeholder: 'Nom du fabricant' },
      { name: 'date_expiration', label: "Date d'expiration", placeholder: 'MM/AAAA' },
    ],
  },
  cat_epicerie: {
    etats: ['Disponible', 'Stock limitÃ©'],
    extraFields: [
      { name: 'poids', label: 'Poids / QuantitÃ©', placeholder: '1kg, 500g, 1L...' },
      { name: 'origine', label: 'Origine', placeholder: "CÃ´te d'Ivoire, ImportÃ©..." },
      { name: 'date_expiration', label: "Date d'expiration", placeholder: 'MM/AAAA' },
    ],
  },
  cat_lingerie: {
    etats: ['Neuf avec Ã©tiquette', 'Neuf sans Ã©tiquette', 'TrÃ¨s bon Ã©tat'],
    extraFields: [
      { name: 'taille', label: 'Taille', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46', 'Autre'] },
      { name: 'couleur', label: 'Couleur', placeholder: 'Noir, Rouge, Blanc...' },
      { name: 'marque', label: 'Marque', placeholder: 'Marque...' },
    ],
  },
}

const DEFAULT_CONFIG: CatConfig = {
  etats: ['Neuf', 'TrÃ¨s bon Ã©tat', 'Bon Ã©tat', 'Ã‰tat correct'],
  extraFields: [{ name: 'marque', label: 'Marque (optionnel)', placeholder: "Marque de l'article" }],
}

const STORAGE_KEY = 'abidjandeals_draft'
type MediaFile = { file: File; url: string; type: 'image' | 'video' }

export default function PublierPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [media, setMedia] = useState<MediaFile[]>([])
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const [form, setForm] = useState<Record<string, string>>({
    title: '', description: '', price: '',
    category: '', subcategory: '', etat: '',
    city: '', quartier: '', tel: '', whatsapp: '',
  })

  const selectedCat = CATEGORIES.find(c => c.id === form.category)
  const catConfig: CatConfig = form.category ? (CATEGORY_FIELDS[form.category] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG
  const quartiersForCity = form.city ? (QUARTIERS[form.city] ?? []) : []

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const draft = JSON.parse(saved)
        setForm(draft.form || {})
        setHasDraft(true)
        setLastSaved(draft.savedAt || null)
      }
    } catch { }
  }, [])

  useEffect(() => {
    const hasContent = form.title || form.description || form.price || form.category
    if (!hasContent) return
    const timer = setTimeout(() => {
      try {
        const draft = { form, savedAt: new Date().toLocaleTimeString('fr-FR') }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
        setLastSaved(draft.savedAt)
        setHasDraft(true)
      } catch { }
    }, 3000)
    return () => clearTimeout(timer)
  }, [form])

  function clearDraft() {
    localStorage.removeItem(STORAGE_KEY)
    setHasDraft(false)
    setLastSaved(null)
    setForm({ title: '', description: '', price: '', category: '', subcategory: '', etat: '', city: '', quartier: '', tel: '', whatsapp: '' })
    setMedia([])
    toast.success('Brouillon effacÃ©')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(f => {
      const updated = { ...f, [name]: value }
      if (name === 'city') updated.quartier = ''
      return updated
    })
  }

  function handleCategoryChange(catId: string) {
    setForm(f => ({ ...f, category: catId, subcategory: '', etat: '' }))
  }

  function addMedia(files: FileList | null, type: 'image' | 'video') {
    if (!files) return
    const limit = type === 'video' ? 1 : 5 - media.filter(m => m.type === 'image').length
    const newItems: MediaFile[] = Array.from(files).slice(0, limit).map(file => ({
      file, url: URL.createObjectURL(file), type,
    }))
    setMedia(prev => [...prev, ...newItems].slice(0, 6))
  }

  function removeMedia(i: number) { setMedia(prev => prev.filter((_, idx) => idx !== i)) }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    const images = Array.from(files).filter(f => f.type.startsWith('image/'))
    const videos = Array.from(files).filter(f => f.type.startsWith('video/'))
    if (images.length) addMedia(images as unknown as FileList, 'image')
    if (videos.length) addMedia(videos as unknown as FileList, 'video')
  }, [media])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.category) { toast.error('Choisissez une catÃ©gorie'); return }
    if (!form.city) { toast.error('Choisissez une ville'); return }
    setLoading(true)

    // Timeout global de 60 secondes sur toute la soumission
    const globalTimeout = setTimeout(() => {
      setLoading(false)
      toast.error('DÃ©lai dÃ©passÃ©. VÃ©rifiez votre connexion et rÃ©essayez.')
    }, 60000)

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      const user = session?.user
      if (authError || !user) {
        toast.error('Connectez-vous pour publier')
        clearTimeout(globalTimeout)
        setLoading(false)
        return
      }

      const uploadedImages: string[] = []
      let videoUrl = ''
      let uploadFailed = false

      if (media.length > 0) {
        toast.loading(`Upload des mÃ©dias (0/${media.length})...`, { id: 'upload' })
        for (let i = 0; i < media.length; i++) {
          const m = media[i]
          try {
            toast.loading(`Upload des mÃ©dias (${i + 1}/${media.length})...`, { id: 'upload' })
            const ext = m.file.name.split('.').pop()
            const bucket = m.type === 'image' ? 'ad-photos' : 'ad-videos'
            const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

            // Timeout par fichier : 15 secondes
            const uploadPromise = supabase.storage.from(bucket).upload(path, m.file, {
              cacheControl: '3600',
              upsert: false,
            })
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 15000)
            )
            const result = await Promise.race([uploadPromise, timeoutPromise]) as any

            if (result.error) {
              console.warn('Upload Ã©chouÃ©:', result.error.message)
              uploadFailed = true
            } else {
              const { data } = supabase.storage.from(bucket).getPublicUrl(path)
              if (m.type === 'image') uploadedImages.push(data.publicUrl)
              else videoUrl = data.publicUrl
            }
          } catch (err) {
            console.warn('Upload ignorÃ© (timeout):', err)
            uploadFailed = true
          }
        }
        toast.dismiss('upload')
        if (uploadFailed && uploadedImages.length === 0) {
          toast.error("Photos non uploadÃ©es. L'annonce sera publiÃ©e sans photos.", { duration: 4000 })
        } else if (uploadFailed) {
          toast.error('Certaines photos n\'ont pas pu Ãªtre uploadÃ©es.', { duration: 3000 })
        }
      }

      const { error } = await supabase.from('ads').insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        price: parseInt(form.price),
        category_id: form.category,
        subcategory: form.subcategory || null,
        etat: form.etat || null,
        marque: form.marque || null,
        city: form.city,
        quartier: form.quartier || null,
        tel: form.tel,
        whatsapp: form.whatsapp || form.tel,
        images: uploadedImages,
        video_url: videoUrl || null,
        status: 'pending',
        views: 0,
      })

      if (error) {
        toast.error('Erreur: ' + error.message)
        clearTimeout(globalTimeout)
        return
      }

      clearTimeout(globalTimeout)
      localStorage.removeItem(STORAGE_KEY)
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    } catch (err) {
      console.error('Erreur soumission:', err)
      toast.error('Une erreur est survenue. RÃ©essayez.')
      clearTimeout(globalTimeout)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Annonce publiÃ©e ! ðŸŽ‰</h1>
        <p className="text-gray-500">En cours de validation par notre Ã©quipe (24h max).</p>
        <p className="text-xs text-gray-400">Redirection vers votre tableau de bord...</p>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" />
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 pb-28 lg:pb-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Publier une annonce</h1>
            <p className="text-gray-400 mt-1">Le formulaire s'adapte automatiquement Ã  votre article</p>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Save size={11} /> SauvegardÃ© Ã  {lastSaved}
              </span>
            )}
            {hasDraft && (
              <button type="button" onClick={clearDraft}
                className="text-xs text-red-400 hover:text-red-500 border border-red-100 rounded-lg px-3 py-1.5 transition">
                Effacer le brouillon
              </button>
            )}
          </div>
        </div>

        {hasDraft && (
          <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <Save size={16} className="text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700 font-medium">Brouillon rÃ©cupÃ©rÃ© â€” vos donnÃ©es ont Ã©tÃ© restaurÃ©es automatiquement.</p>
          </div>
        )}

        <form id="publier-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">

              {/* Ã‰tape 1 â€” CatÃ©gorie */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">1</div>
                  <h2 className="font-bold text-gray-800">Choisissez une catÃ©gorie</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} type="button" onClick={() => handleCategoryChange(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${form.category === cat.id ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' : 'border-gray-100 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'}`}>
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
                {selectedCat && (
                  <select name="subcategory" value={form.subcategory} onChange={handleChange}
                    className="mt-3 w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                    <option value="">Sous-catÃ©gorie (optionnel)</option>
                    {selectedCat.subcats.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>

              {/* Ã‰tape 2 â€” Photos & VidÃ©o */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-3 border-b border-gray-50 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">2</div>
                  <h2 className="font-bold text-gray-800">Photos & VidÃ©o</h2>
                  <span className="ml-auto text-xs text-gray-400">{media.length}/6</span>
                </div>
                <div className="p-5">
                  <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-orange-400 transition-colors cursor-pointer mb-4 group"
                    onClick={() => fileInputRef.current?.click()}>
                    <Upload size={28} className="mx-auto text-gray-300 group-hover:text-orange-400 transition mb-2" />
                    <p className="font-semibold text-gray-600 text-sm">Glissez vos photos ou cliquez</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP Â· Max 5 photos + 1 vidÃ©o</p>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addMedia(e.target.files, 'image')} />
                  </div>
                  {media.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {media.map((m, i) => (
                        <div key={i} className={`relative rounded-xl overflow-hidden border-2 aspect-square ${i === 0 ? 'border-orange-400' : 'border-gray-100'}`}>
                          {m.type === 'image'
                            ? <img src={m.url} alt="" className="w-full h-full object-cover" />
                            : <video src={m.url} className="w-full h-full object-cover" muted />}
                          {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[9px] font-bold text-center py-0.5">PRINCIPALE</span>}
                          {m.type === 'video' && <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">ðŸ“¹</span>}
                          <button type="button" onClick={() => removeMedia(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {!media.find(m => m.type === 'video') && (
                    <button type="button" onClick={() => videoInputRef.current?.click()}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 border border-dashed border-gray-200 hover:border-orange-300 rounded-xl px-4 py-2.5 w-full justify-center transition">
                      <Video size={15} /> Ajouter une vidÃ©o (booste les contacts Ã—3)
                    </button>
                  )}
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => addMedia(e.target.files, 'video')} />
                </div>
              </div>

              {/* Ã‰tape 3 â€” DÃ©tails dynamiques */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">3</div>
                  <h2 className="font-bold text-gray-800">
                    {form.category ? `DÃ©tails â€” ${selectedCat?.name}` : "DÃ©tails de l'annonce"}
                  </h2>
                </div>
                <div className="space-y-3">
                  <input name="title" value={form.title} onChange={handleChange} required
                    placeholder={selectedCat ? `Titre â€” ex: ${selectedCat.name} Ã  vendre...` : "Titre de l'annonce *"}
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition font-medium" />
                  <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                    placeholder={
                      form.category === 'auto' ? "DÃ©crivez la voiture : options, historique d'entretien, raison de vente..." :
                        form.category === 'immobilier' ? 'DÃ©crivez le bien : Ã©quipements, voisinage, accÃ¨s, charges...' :
                          form.category === 'hightech' ? 'DÃ©crivez l\'Ã©tat, les accessoires inclus, raison de vente...' :
                            form.category === 'services' ? 'DÃ©crivez votre service, vos compÃ©tences, vos rÃ©fÃ©rences...' :
                              'DÃ©crivez votre article en dÃ©tail...'
                    }
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition resize-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input name="price" value={form.price} onChange={handleChange} required type="number" min="0"
                        placeholder={form.category === 'location' ? 'Prix / jour *' : form.category === 'services' ? 'Tarif *' : 'Prix *'}
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl pl-4 pr-16 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition font-bold" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">FCFA</span>
                    </div>
                    <select name="etat" value={form.etat} onChange={handleChange}
                      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                      <option value="">Ã‰tat</option>
                      {catConfig.etats.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  {catConfig.extraFields.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                      {catConfig.extraFields.map(field => (
                        <div key={field.name}>
                          {field.type === 'select' ? (
                            <select name={field.name} value={form[field.name] || ''} onChange={handleChange}
                              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                              <option value="">{field.label}</option>
                              {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input name={field.name} value={form[field.name] || ''} onChange={handleChange}
                              type={field.type || 'text'} placeholder={field.label}
                              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ã‰tape 4 â€” Localisation */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">4</div>
                  <MapPin size={16} className="text-orange-500" />
                  <h2 className="font-bold text-gray-800">Localisation</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select name="city" value={form.city} onChange={handleChange} required
                    className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                    <option value="">Ville *</option>
                    {CITIES.map(c => { const name = c.replace(/^[^\s]+\s/, ''); return <option key={name} value={name}>{name}</option> })}
                  </select>

                  {quartiersForCity.length > 0 ? (
                    <select name="quartier" value={form.quartier} onChange={handleChange}
                      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                      <option value="">Quartier (optionnel)</option>
                      {quartiersForCity.map(q => <option key={q} value={q}>{q}</option>)}
                      <option value="Autre">Autre quartier</option>
                    </select>
                  ) : (
                    <input name="quartier" value={form.quartier} onChange={handleChange}
                      placeholder="Quartier (optionnel)"
                      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                  )}
                </div>
                {form.quartier === 'Autre' && (
                  <input onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))}
                    placeholder="PrÃ©cisez votre quartier"
                    className="mt-3 w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                )}
              </div>

              {/* Ã‰tape 5 â€” Contact */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">5</div>
                  <Phone size={16} className="text-orange-500" />
                  <h2 className="font-bold text-gray-800">Contact</h2>
                </div>
                <div className="space-y-3">
                  <input name="tel" value={form.tel} onChange={handleChange} required
                    placeholder="TÃ©lÃ©phone * (+225 07 12 34 56 78)"
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                  <input name="whatsapp" value={form.whatsapp || ''} onChange={handleChange}
                    placeholder="WhatsApp si diffÃ©rent du tÃ©lÃ©phone"
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                </div>
              </div>
            </div>

            {/* Colonne droite sticky â€” desktop uniquement */}
            <div className="hidden lg:block">
              <div className="sticky top-4 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-800 mb-4">RÃ©sumÃ©</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'CatÃ©gorie', value: selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : 'â€”' },
                      { label: 'Photos', value: `${media.filter(m => m.type === 'image').length}/5` },
                      { label: 'VidÃ©o', value: media.find(m => m.type === 'video') ? 'âœ…' : 'â€”' },
                      { label: 'Prix', value: form.price ? `${parseInt(form.price).toLocaleString('fr')} FCFA` : 'â€”' },
                      { label: 'Ville', value: form.city || 'â€”' },
                      { label: 'Quartier', value: form.quartier || 'â€”' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="font-semibold text-gray-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-orange-600 mb-2">
                    ðŸ’¡ {form.category === 'auto' ? 'Conseils vente voiture' : form.category === 'immobilier' ? 'Conseils immobilier' : 'Conseils pour vendre vite'}
                  </p>
                  <ul className="text-xs text-orange-600/80 space-y-1.5">
                    {form.category === 'auto' ? <>
                      <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Photographiez l'extÃ©rieur, l'intÃ©rieur et le moteur</li>
                      <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Mentionnez si la vignette est Ã  jour</li>
                    </> : form.category === 'immobilier' ? <>
                      <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Montrez toutes les piÃ¨ces en photos</li>
                      <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />PrÃ©cisez l'accÃ¨s eau et Ã©lectricitÃ©</li>
                    </> : <>
                      <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Ajoutez au moins 3 photos de qualitÃ©</li>
                      <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Une vidÃ©o augmente les contacts de Ã—3</li>
                    </>}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Save size={14} className="text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-600">Sauvegarde automatique activÃ©e â€” vos donnÃ©es ne seront pas perdues</p>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-orange-200 text-base">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Publication...</> : 'ðŸš€ Publier mon annonce'}
                </button>
                <p className="text-center text-xs text-gray-400">Gratuit Â· Validation sous 24h</p>
              </div>
            </div>
          </div>
        </form>

        {/* â”€â”€ Barre flottante mobile â”€â”€ */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl px-4 py-3">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 truncate">
                {selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : 'Aucune catÃ©gorie sÃ©lectionnÃ©e'}
              </p>
              <p className="font-extrabold text-orange-500 text-base leading-tight">
                {form.price ? `${parseInt(form.price).toLocaleString('fr')} FCFA` : 'Prix non dÃ©fini'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {form.city || 'â€”'}{form.quartier ? `, ${form.quartier}` : ''}
              </p>
            </div>
            <button
              type="submit"
              form="publier-form"
              disabled={loading}
              className="flex-shrink-0 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-orange-200">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <span>ðŸš€</span>}
              <span>Publier</span>
            </button>
          </div>
          {lastSaved && (
            <p className="text-[10px] text-gray-400 text-center mt-1 flex items-center justify-center gap-1">
              <Save size={9} /> SauvegardÃ© Ã  {lastSaved}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}






