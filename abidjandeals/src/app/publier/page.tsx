'use client'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { CATEGORIES } from '@/lib/data'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { CheckCircle, ChevronRight, GripVertical, Loader2, MapPin, Phone, Save, Sparkles, Upload, Video, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const SUBCAT_LABELS: Record<string, string> = {
  'telephones-accessoires': 'Téléphones & Accessoires',
  'ordinateurs': 'Ordinateurs',
  'tablettes': 'Tablettes',
  'tv-son': 'TV & Son',
  'photo-video': 'Photo & Vidéo',
  'consoles-jeux': 'Consoles & Jeux',
  'objets-connectes': 'Objets Connectés',
  'composants': 'Composants',
  'voitures-d-occasion': "Voitures d'Occasion",
  'motos-scooters': 'Motos & Scooters',
  'bateaux-nautisme': 'Bateaux & Nautisme',
  'pieces-detachees-pneus': 'Pièces & Pneus',
  'location-auto': 'Location Auto',
  'camions-utilitaires': 'Camions & Utilitaires',
  'groupes-electrogenes': 'Groupes Électrogènes',
  'outillage-industriel': 'Outillage Industriel',
  'engins-chantier': 'Engins de Chantier',
  'vente-appartement': 'Vente Appartement',
  'vente-maison-villa': 'Vente Maison & Villa',
  'location-meublee': 'Location Meublée',
  'maison-a-louer': 'Maison à Louer',
  'colocation': 'Colocation',
  'terrains-acd': 'Terrains & ACD',
  'bureaux-boutiques': 'Bureaux & Boutiques',
  'freelance-it': 'Freelance & IT',
  'batiment': 'Bâtiment & Travaux',
  'cours-formation': 'Cours & Formation',
  'offres-emploi': "Offres d'Emploi",
  'transport': 'Transport',
  'menage': 'Ménage & Nettoyage',
  'evenementiel': 'Événementiel',
  'meubles': 'Meubles',
  'electromenager': 'Électroménager',
  'decoration': 'Décoration',
  'jardin-bricolage': 'Jardin & Bricolage',
  'vetements': 'Vêtements',
  'chaussures': 'Chaussures',
  'sacs-accessoires': 'Sacs & Accessoires',
  'montres': 'Montres',
  'cosmetiques': 'Cosmétiques',
  'soins-visage': 'Soins Visage',
  'soins-corps': 'Soins Corps',
  'parfums': 'Parfums',
  'complements-alimentaires': 'Compléments Alimentaires',
  'materiel-coiffure': 'Matériel Coiffure',
  'equipements-sport': 'Équipements Sport',
  'instruments-musique': 'Instruments de Musique',
  'jouets': 'Jouets',
  'voyages': 'Voyages',
  'velos': 'Vélos',
  'animaux': 'Animaux',
  'fournitures-scolaires': 'Fournitures Scolaires',
  'collection': 'Collection',
  'inclassables': 'Inclassables',
  'lingerie-sous-vetements': 'Lingerie & Sous-vêtements',
  'maillots-de-bain': 'Maillots de Bain',
  'cosmetiques-bien-etre': 'Cosmétiques Bien-être',
  'accessoires-mode': 'Accessoires Mode',
}

type ExtraField = { name: string; label: string; type?: string; options?: string[]; placeholder?: string }
type CatConfig = { etats: string[]; extraFields: ExtraField[] }

const CATEGORY_FIELDS: Record<string, CatConfig> = {
  cat_tech: {
    etats: ['Neuf', 'Reconditionné', 'Très bon état', 'Bon état', 'À réparer'],
    extraFields: [
      { name: 'marque', label: 'Marque *', placeholder: 'Apple, Samsung, HP...' },
      { name: 'modele', label: 'Modèle', placeholder: 'iPhone 15, Galaxy S24...' },
      { name: 'stockage', label: 'Stockage', type: 'select', options: ['32 Go', '64 Go', '128 Go', '256 Go', '512 Go', '1 To', '2 To'] },
      { name: 'ram', label: 'RAM', type: 'select', options: ['2 Go', '4 Go', '6 Go', '8 Go', '12 Go', '16 Go', '32 Go'] },
      { name: 'couleur', label: 'Couleur', placeholder: 'Noir, Blanc, Or...' },
    ],
  },
  cat_auto: {
    etats: ['Neuf', 'Très bon état', 'Bon état', 'État correct', 'Pour pièces'],
    extraFields: [
      { name: 'marque', label: 'Marque *', placeholder: 'Toyota, Kia, Renault...' },
      { name: 'modele', label: 'Modèle', placeholder: 'Prado, Forte, Duster...' },
      { name: 'annee', label: 'Année', type: 'number', placeholder: '2020' },
      { name: 'kilometrage', label: 'Kilométrage (km)', type: 'number', placeholder: '45000' },
      { name: 'carburant', label: 'Carburant', type: 'select', options: ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'] },
      { name: 'boite', label: 'Boîte de vitesse', type: 'select', options: ['Automatique', 'Manuelle'] },
    ],
  },
  cat_immo: {
    etats: ['Neuf', 'Bon état', 'À rénover'],
    extraFields: [
      { name: 'type_bien', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison', 'Villa', 'Terrain', 'Bureau', 'Entrepôt', 'Chambre'] },
      { name: 'surface', label: 'Surface (m²)', type: 'number', placeholder: '120' },
      { name: 'pieces', label: 'Nombre de pièces', type: 'select', options: ['Studio', '2 pièces', '3 pièces', '4 pièces', '5 pièces', '6+'] },
      { name: 'meuble', label: 'Meublé ?', type: 'select', options: ['Oui', 'Non', 'Partiellement'] },
    ],
  },
  cat_serv: {
    etats: ['Disponible', 'Sur rendez-vous'],
    extraFields: [
      { name: 'experience', label: 'Expérience', type: 'select', options: ["Moins d'1 an", '1-3 ans', '3-5 ans', '5-10 ans', 'Plus de 10 ans'] },
      { name: 'deplacement', label: 'Déplacement', type: 'select', options: ['À domicile', 'En boutique', 'Les deux'] },
      { name: 'delai', label: "Délai d'intervention", placeholder: '24h, 1 semaine...' },
    ],
  },
  cat_maison: {
    etats: ['Neuf', 'Très bon état', 'Bon état', 'En panne'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'LG, Samsung, Ikea...' },
      { name: 'modele', label: 'Modèle / Référence', placeholder: 'Référence du produit' },
      { name: 'couleur', label: 'Couleur', placeholder: 'Blanc, Noir, Bois...' },
    ],
  },
  cat_mode: {
    etats: ['Neuf avec étiquette', 'Neuf sans étiquette', 'Très bon état', 'Bon état'],
    extraFields: [
      { name: 'taille', label: 'Taille', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46', 'Autre'] },
      { name: 'couleur', label: 'Couleur', placeholder: 'Noir, Rouge, Blanc...' },
      { name: 'marque', label: 'Marque', placeholder: 'Zara, H&M, Nike...' },
    ],
  },
  cat_beaute: {
    etats: ['Neuf', 'Ouvert', 'Entamé'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'MAC, Loréal, Nivea...' },
      { name: 'date_expiration', label: "Date d'expiration", placeholder: 'MM/AAAA' },
    ],
  },
  cat_adulte: {
    etats: ['Neuf', 'Ouvert', 'Très bon état'],
    extraFields: [{ name: 'marque', label: 'Marque (optionnel)', placeholder: 'Marque du produit' }],
  },
  cat_sport: {
    etats: ['Neuf', 'Très bon état', 'Bon état'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'Nike, Adidas, Decathlon...' },
      { name: 'taille', label: 'Taille / Pointure', placeholder: '42, L, XL...' },
    ],
  },
}

const DEFAULT_CONFIG: CatConfig = {
  etats: ['Neuf', 'Très bon état', 'Bon état', 'État correct'],
  extraFields: [{ name: 'marque', label: 'Marque (optionnel)', placeholder: "Marque de l'article" }],
}

const STORAGE_KEY = 'KIVOO_draft'
const EMPTY_FORM = {
  title: '', description: '', price: '',
  category: '', subcategory: '', etat: '',
  city: '', quartier: '', tel: '', whatsapp: '', guest_name: '',
}
const MAX_IMAGES = 8
type MediaFile = { file: File; url: string; type: 'image' | 'video' }

// ─── Listes de secours (fallback si Supabase lent) ───────────────────────────
const FALLBACK_COMMUNES = [
  'Abidjan', 'Abobo', 'Adjamé', 'Anyama', 'Attécoubé',
  'Bingerville', 'Cocody', 'Koumassi', 'Marcory', 'Plateau',
  'Port-Bouët', 'Treichville', 'Yopougon',
  'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Daloa', 'Korhogo',
  'Man', 'Gagnoa', 'Abengourou', 'Divo', 'Soubré',
  'Bondoukou', 'Odienné', 'Touba', 'Séguéla',
]

const FALLBACK_QUARTIERS: Record<string, string[]> = {
  'Cocody': ['Riviera 1', 'Riviera 2', 'Riviera 3', 'Riviera 4', 'Angré', 'Blockhauss', 'II Plateaux', 'Palmeraie', 'Bonoumin', 'Danga'],
  'Yopougon': ['Selmer', 'Niangon', 'Wassakara', 'Sideci', 'Kouté', 'Banco', 'Doukouré', 'Maroc', 'Williamsville'],
  'Abobo': ['Abobo-Gare', 'Abobo-Doumé', 'Sagbé', 'PK 18', 'Avocatier', 'Clouetcha', 'Sogefia', 'N\'Dotré'],
  'Adjamé': ['Adjamé-Liberté', 'Adjamé-220 Logements', 'Adjamé-Mosquée', 'Bracodi', 'Williamsville'],
  'Marcory': ['Zone 4', 'Anoumabo', 'Résidenxe', 'Biétry', 'Koumassi'],
  'Plateau': ['Centre', 'Abidjan Plateau', 'Zone commerciale'],
  'Treichville': ['Zone commerciale', 'Port'],
  'Port-Bouët': ['Vridi', 'Aéroport', 'Gonzagueville', 'Zone industrielle'],
  'Koumassi': ['Remblai', 'Grand Campement', 'Zone industrielle'],
  'Attécoubé': ['Sébroko', 'Santé', 'Agban'],
  'Bingerville': ['Centre', 'Résidentiel'],
  'Anyama': ['Centre', 'Liézoua'],
  'Bouaké': ['Koko', 'Air France', 'Commerce', 'Belleville', 'N\'Gattakro', 'Dar Es Salam'],
  'Yamoussoukro': ['Centre', 'Dioulakro', 'Morofé', 'N\'Zuéssé'],
  'San-Pédro': ['Cité', 'Port', 'Balmer'],
  'Daloa': ['Centre', 'Tazibouo', 'Orly'],
  'Korhogo': ['Centre', 'Koko', 'Soba'],
}

export default function PublierPage() {
  const router = useRouter()
  const { user: storeUser } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [media, setMedia] = useState<MediaFile[]>([])
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; label: string } | null>(null)

  // ── IA ─────────────────────────────────────────────────────────────────────
  const [improving, setImproving] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<{ title: string; description: string } | null>(null)

  // ── Drag & Drop réordonnancement ───────────────────────────────────────────
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  // ── Localisation depuis Supabase ────────────────────────────────────────────
  const [regions, setRegions] = useState<string[]>([])
  const [quartiersDB, setQuartiersDB] = useState<string[]>([])
  const [regionsLoaded, setRegionsLoaded] = useState(false)  // ← FIX bug communes

  const [form, setForm] = useState<Record<string, string>>(EMPTY_FORM)

  const selectedCat = CATEGORIES.find(c => c.id === form.category)
  const catConfig: CatConfig = form.category ? (CATEGORY_FIELDS[form.category] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG
  const imageCount = media.filter(m => m.type === 'image').length
  const hasVideo = !!media.find(m => m.type === 'video')

  // ── 1. Charger les régions avec fallback si Supabase lent ───────────────────
  useEffect(() => {
    // Afficher le fallback immédiatement
    setRegions(FALLBACK_COMMUNES)
    setRegionsLoaded(true)

    // Essayer Supabase en arrière-plan (3s timeout)
    const timeout = setTimeout(() => { }, 3000)
    supabase.from('locations').select('region').eq('is_active', true)
      .then(({ data }) => {
        clearTimeout(timeout)
        if (data && data.length > 0) {
          const unique = [...new Set(data.map((d: any) => d.region))].sort() as string[]
          setRegions(unique)
        }
      })
  }, [])

  // ── 2. Charger le brouillon APRÈS les régions (FIX bug communes) ───────────
  useEffect(() => {
    if (!regionsLoaded) return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const draft = JSON.parse(saved)
        setForm(draft.form || {})
        setHasDraft(true)
        setLastSaved(draft.savedAt || null)
      }
    } catch { }
  }, [regionsLoaded])

  // ── 3. Quartiers avec fallback si Supabase lent ────────────────────────────
  useEffect(() => {
    if (!form.city) { setQuartiersDB([]); return }

    // Afficher le fallback immédiatement si disponible
    const fallbackQ = FALLBACK_QUARTIERS[form.city] ?? []
    if (fallbackQ.length > 0) setQuartiersDB(fallbackQ)

    // Essayer Supabase en arrière-plan
    supabase.from('locations').select('name')
      .eq('region', form.city).eq('is_active', true).order('name')
      .then(({ data }) => {
        if (data && data.length > 0) setQuartiersDB(data.map((d: any) => d.name))
      })

  }, [form.city])

  // ── Sauvegarde automatique brouillon ───────────────────────────────────────
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
    setForm(EMPTY_FORM)
    setMedia([])
    toast.success('Brouillon effacé')
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

  // ── Drag & Drop réordonnancement photos ────────────────────────────────────
  function handleDragStart(i: number) { setDragIndex(i) }
  function handleDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOver(i) }
  function handleDragEnd() { setDragIndex(null); setDragOver(null) }
  function handleDropOnItem(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) { handleDragEnd(); return }
    const newMedia = [...media]
    const [moved] = newMedia.splice(dragIndex, 1)
    newMedia.splice(i, 0, moved)
    setMedia(newMedia)
    handleDragEnd()
  }

  // ── Assistant IA ────────────────────────────────────────────────────────────
  async function handleImprove() {
    if (!form.title && !form.description) {
      toast.error("Remplissez d'abord le titre ou la description")
      return
    }
    setImproving(true)
    setAiSuggestion(null)
    try {
      const res = await fetch('/api/seller/improve-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, description: form.description, category: form.category }),
      })
      if (!res.ok) throw new Error('api_error')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.title || data.description) {
        setAiSuggestion(data)
        toast.success('Suggestion IA prête ✨')
      } else {
        toast.error("L'IA n'a pas pu améliorer cette annonce")
      }
    } catch {
      toast.error('Erreur IA. Vérifiez les crédits Anthropic.')
    }
    setImproving(false)
  }

  function applyAiSuggestion() {
    if (!aiSuggestion) return
    setForm(f => ({
      ...f,
      title: aiSuggestion.title || f.title,
      description: aiSuggestion.description || f.description,
    }))
    setAiSuggestion(null)
    toast.success('Suggestion appliquée ✅')
  }

  async function addMedia(files: FileList | null, type: 'image' | 'video') {
    if (!files) return
    const limit = type === 'video' ? 1 : MAX_IMAGES - media.filter(m => m.type === 'image').length
    const fileArray = Array.from(files).slice(0, limit)
    if (type === 'image') {
      const items = fileArray.map(file => ({ file, url: URL.createObjectURL(file), type: 'image' as const }))
      setMedia(prev => [...prev, ...items].slice(0, MAX_IMAGES + 1))
    } else {
      const items: MediaFile[] = fileArray.map(file => ({ file, url: URL.createObjectURL(file), type }))
      setMedia(prev => [...prev, ...items].slice(0, MAX_IMAGES + 1))
    }
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
    if (!form.category) { toast.error('Choisissez une catégorie'); return }
    if (!form.city) { toast.error('Choisissez une commune'); return }
    setLoading(true)

    const globalTimeout = setTimeout(() => {
      setLoading(false)
      toast.error('Délai dépassé. Vérifiez votre connexion et réessayez.')
    }, 90 * 1000)

    try {
      let userId = storeUser?.id
      if (!userId) {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<null>(r => setTimeout(() => r(null), 5000))
        ])
        userId = (result as any)?.data?.session?.user?.id ?? null
      }
      if (!userId) {
        toast.error('Connectez-vous pour publier')
        clearTimeout(globalTimeout); setLoading(false); return
      }

      const uploadedImages: string[] = []
      let videoUrl = ''
      let uploadFailed = false

      if (media.length > 0) {
        const getTimeout = (type: string) => type === 'video' ? 60 * 1000 : 30 * 1000

        const uploadWithRetry = async (m: MediaFile, attempt = 1): Promise<string | null> => {
          const ext = m.file.name.split('.').pop()
          const bucket = m.type === 'image' ? 'ad-photos' : 'ad-videos'
          const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          try {
            const result = await Promise.race([
              supabase.storage.from(bucket).upload(path, m.file, { cacheControl: '3600', upsert: false }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), getTimeout(m.type)))
            ]) as any
            if (result.error) {
              if (attempt < 3) { await new Promise(r => setTimeout(r, 1500 * attempt)); return uploadWithRetry(m, attempt + 1) }
              return null
            }
            const { data } = supabase.storage.from(bucket).getPublicUrl(path)
            return data.publicUrl
          } catch {
            if (attempt < 3) { await new Promise(r => setTimeout(r, 1500 * attempt)); return uploadWithRetry(m, attempt + 1) }
            return null
          }
        }

        setUploadProgress({ current: 0, total: media.length, label: '⚡ Upload en cours...' })
        let completed = 0
        const results = await Promise.all(
          media.map(async (m) => {
            const url = await uploadWithRetry(m)
            completed++
            setUploadProgress({
              current: completed,
              total: media.length,
              label: `⚡ ${completed}/${media.length} fichier${completed > 1 ? 's' : ''} uploadé${completed > 1 ? 's' : ''}`,
            })
            return { url, type: m.type }
          })
        )
        setUploadProgress(null)
        for (const r of results) {
          if (r.url) { if (r.type === 'image') uploadedImages.push(r.url); else videoUrl = r.url }
          else uploadFailed = true
        }
        if (uploadFailed && uploadedImages.length === 0 && !videoUrl) {
          toast.error('Aucun média uploadé. Vérifiez votre connexion.', { duration: 5000 })
        }
      }

      const { data: insertedAd, error } = await Promise.race([
        supabase.from('ads').insert({
          user_id: userId,
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
          guest_name: form.guest_name.trim() || null,
          images: uploadedImages,
          video_url: videoUrl || null,
          status: 'pending',
          views: 0,
        }).select('id').single(),
        new Promise<{ data: null; error: { message: string } }>(r =>
          setTimeout(() => r({ data: null, error: { message: 'Délai dépassé' } }), 20000)
        )
      ])

      if (error) { toast.error('Erreur: ' + error.message); clearTimeout(globalTimeout); return }

      // Déclenche l'auto-modération IA en tâche de fond (jamais bloquant, jamais d'échec visible)
      if (insertedAd?.id) {
        fetch('/api/ads/auto-moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adId: insertedAd.id }),
        }).catch(() => { })
      }

      clearTimeout(globalTimeout)
      localStorage.removeItem(STORAGE_KEY)
      setHasDraft(false); setLastSaved(null)
      setForm(EMPTY_FORM); setMedia([])
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    } catch {
      toast.error('Une erreur est survenue. Réessayez.')
      clearTimeout(globalTimeout)
      localStorage.removeItem(STORAGE_KEY)
      setHasDraft(false); setLastSaved(null)
      setForm(EMPTY_FORM); setMedia([])
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
        <h1 className="text-2xl font-extrabold text-gray-900">Annonce publiée ! 🎉</h1>
        <p className="text-gray-500">En cours de validation par notre équipe (24h max).</p>
        <p className="text-xs text-gray-400">Redirection vers votre tableau de bord...</p>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 pb-28 lg:pb-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Publier une annonce</h1>
            <p className="text-gray-400 mt-1">Le formulaire s'adapte automatiquement à votre article</p>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && <span className="text-xs text-gray-400 flex items-center gap-1"><Save size={11} /> Sauvegardé à {lastSaved}</span>}
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
            <p className="text-sm text-blue-700 font-medium">Brouillon récupéré — vos données ont été restaurées automatiquement.</p>
          </div>
        )}

        <form id="publier-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">

              {/* Étape 1 — Catégorie */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">1</div>
                  <h2 className="font-bold text-gray-800">Choisissez une catégorie</h2>
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
                    <option value="">Sous-catégorie (optionnel)</option>
                    {selectedCat.subcats.map(s => (
                      <option key={s} value={s}>
                        {SUBCAT_LABELS[s] ?? s.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Étape 2 — Photos & Vidéo (grille unifiée + drag & drop) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-3 border-b border-gray-50 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">2</div>
                  <h2 className="font-bold text-gray-800">Photos & Vidéo</h2>
                  <span className="ml-auto text-xs text-gray-400">{imageCount}/{MAX_IMAGES} photos{hasVideo ? ' · 1 vidéo' : ''}</span>
                </div>
                <div className="p-5">

                  {/* Zone drag & drop upload */}
                  <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-orange-400 transition-colors cursor-pointer mb-4 group"
                    onClick={() => fileInputRef.current?.click()}>
                    <Upload size={28} className="mx-auto text-gray-300 group-hover:text-orange-400 transition mb-2" />
                    <p className="font-semibold text-gray-600 text-sm">Glissez vos photos/vidéo ici ou cliquez</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max {MAX_IMAGES} photos + 1 vidéo</p>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={e => addMedia(e.target.files, 'image')} />
                  </div>

                  {/* Grille unifiée photos + vidéo avec drag & drop */}
                  {media.length > 0 && (
                    <>
                      <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <GripVertical size={11} /> Glissez pour réordonner · La 1ère photo est la principale
                      </p>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {media.map((m, i) => (
                          <div
                            key={i}
                            draggable={m.type === 'image'}
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={e => handleDragOver(e, i)}
                            onDrop={e => handleDropOnItem(e, i)}
                            onDragEnd={handleDragEnd}
                            className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all cursor-grab active:cursor-grabbing
                              ${i === 0 ? 'border-orange-400' : 'border-gray-100'}
                              ${dragOver === i && dragIndex !== i ? 'border-orange-300 scale-105 opacity-80' : ''}
                              ${dragIndex === i ? 'opacity-50' : ''}
                            `}>
                            {m.type === 'image'
                              ? <img src={m.url} alt="" className="w-full h-full object-cover" />
                              : <video src={m.url} className="w-full h-full object-cover" muted />}
                            {i === 0 && m.type === 'image' && (
                              <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[9px] font-bold text-center py-0.5">PRINCIPALE</span>
                            )}
                            {m.type === 'video' && (
                              <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">🎬 Vidéo</span>
                            )}
                            <button type="button" onClick={() => removeMedia(i)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition">
                              <X size={10} />
                            </button>
                          </div>
                        ))}

                        {/* Cellule ajouter vidéo dans la grille */}
                        {!hasVideo && (
                          <button type="button" onClick={() => videoInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 bg-gray-50 hover:bg-orange-50 flex flex-col items-center justify-center gap-1 transition text-gray-400 hover:text-orange-500">
                            <Video size={18} />
                            <span className="text-[9px] font-medium text-center leading-tight">Ajouter<br />vidéo</span>
                          </button>
                        )}

                        {/* Cellule ajouter plus de photos */}
                        {imageCount < MAX_IMAGES && (
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 bg-gray-50 hover:bg-orange-50 flex flex-col items-center justify-center gap-1 transition text-gray-400 hover:text-orange-500">
                            <Upload size={18} />
                            <span className="text-[9px] font-medium">+ Photo</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {uploadProgress && (
                    <div className="mb-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-600">{uploadProgress.label}</span>
                        <span className="text-xs text-gray-400">{uploadProgress.current}/{uploadProgress.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all duration-300"
                          style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                    onChange={e => addMedia(e.target.files, 'video')} />

                  {!hasVideo && media.length === 0 && (
                    <button type="button" onClick={() => videoInputRef.current?.click()}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 border border-dashed border-gray-200 hover:border-orange-300 rounded-xl px-4 py-2.5 w-full justify-center transition mt-2">
                      <Video size={15} /> Ajouter une vidéo (booste les contacts ×3)
                    </button>
                  )}
                </div>
              </div>

              {/* Étape 3 — Détails */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">3</div>
                  <h2 className="font-bold text-gray-800">
                    {form.category ? `Détails — ${selectedCat?.name}` : "Détails de l'annonce"}
                  </h2>
                </div>
                <div className="space-y-3">

                  {/* Titre + compteur */}
                  <div className="relative">
                    <input name="title" value={form.title} onChange={handleChange} required maxLength={100}
                      placeholder={selectedCat ? `Titre — ex: ${selectedCat.name} à vendre...` : "Titre de l'annonce *"}
                      className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 pr-16 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition font-medium" />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${form.title.length > 80 ? 'text-orange-500' : 'text-gray-300'}`}>
                      {form.title.length}/80
                    </span>
                  </div>

                  {/* Description + compteur */}
                  <div className="relative">
                    <textarea name="description" value={form.description} onChange={handleChange} rows={4} maxLength={2000}
                      placeholder={
                        form.category === 'cat_auto' ? "Décrivez la voiture : options, historique d'entretien, raison de vente..." :
                          form.category === 'cat_immo' ? 'Décrivez le bien : équipements, voisinage, accès, charges...' :
                            form.category === 'cat_tech' ? "Décrivez l'état, les accessoires inclus, raison de vente..." :
                              form.category === 'cat_serv' ? 'Décrivez votre service, vos compétences, vos références...' :
                                'Décrivez votre article en détail...'
                      }
                      className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition resize-none" />
                    <span className={`absolute right-3 bottom-3 text-xs ${form.description.length > 450 ? 'text-orange-500' : 'text-gray-300'}`}>
                      {form.description.length}/500
                    </span>
                  </div>

                  {/* Bouton IA */}
                  <div className="flex justify-end">
                    <button type="button" onClick={handleImprove}
                      disabled={improving || (!form.title && !form.description)}
                      className="flex items-center gap-2 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl px-4 py-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed">
                      {improving ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      {improving ? 'IA en cours...' : "Améliorer avec l'IA ✨"}
                    </button>
                  </div>

                  {/* Suggestion IA */}
                  {aiSuggestion && (
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-violet-600" />
                        <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Suggestion de l'IA</p>
                        <button type="button" onClick={() => setAiSuggestion(null)} className="ml-auto text-violet-400 hover:text-violet-600">
                          <X size={14} />
                        </button>
                      </div>
                      {aiSuggestion.title && (
                        <div>
                          <p className="text-xs text-violet-500 mb-1 font-medium">Titre suggéré</p>
                          <p className="text-sm font-semibold text-gray-800 bg-white rounded-lg px-3 py-2 border border-violet-100">{aiSuggestion.title}</p>
                        </div>
                      )}
                      {aiSuggestion.description && (
                        <div>
                          <p className="text-xs text-violet-500 mb-1 font-medium">Description suggérée</p>
                          <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-lg px-3 py-2 border border-violet-100">{aiSuggestion.description}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={applyAiSuggestion}
                          className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition">
                          ✅ Appliquer la suggestion
                        </button>
                        <button type="button" onClick={() => setAiSuggestion(null)}
                          className="px-4 py-2 border border-violet-200 text-violet-600 text-xs font-semibold rounded-xl hover:bg-white transition">
                          Ignorer
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input name="price" value={form.price} onChange={handleChange} required type="number" min="0"
                        placeholder={form.category === 'cat_serv' ? 'Tarif *' : 'Prix *'}
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl pl-4 pr-16 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition font-bold" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">FCFA</span>
                    </div>
                    <select name="etat" value={form.etat} onChange={handleChange}
                      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                      <option value="">État</option>
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

              {/* Étape 4 — Localisation */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">4</div>
                  <MapPin size={16} className="text-orange-500" />
                  <h2 className="font-bold text-gray-800">Localisation</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select name="city" value={form.city} onChange={handleChange} required
                    className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                    <option value="">Commune *</option>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {quartiersDB.length > 0 ? (
                    <select name="quartier" value={form.quartier} onChange={handleChange}
                      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                      <option value="">Quartier (optionnel)</option>
                      {quartiersDB.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  ) : (
                    <input name="quartier" value={form.quartier} onChange={handleChange}
                      placeholder={form.city ? "Précisez votre quartier" : "Choisissez d'abord une commune"}
                      disabled={!form.city}
                      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition disabled:opacity-50" />
                  )}
                </div>
              </div>

              {/* Étape 5 — Contact */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">5</div>
                  <Phone size={16} className="text-orange-500" />
                  <h2 className="font-bold text-gray-800">Contact</h2>
                </div>
                <div className="space-y-3">
                  <input name="tel" value={form.tel} onChange={handleChange} required
                    placeholder="Téléphone * (+225 07 12 34 56 78)"
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                  <input name="whatsapp" value={form.whatsapp || ''} onChange={handleChange}
                    placeholder="WhatsApp si différent du téléphone"
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                  <input name="guest_name" value={form.guest_name || ''} onChange={handleChange}
                    placeholder="Nom du vendeur (si vous publiez pour quelqu'un d'autre)"
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                </div>
              </div>
            </div>

            {/* ── Colonne droite sticky ── */}
            <div className="hidden lg:block">
              <div className="sticky top-4 space-y-4">

                {/* Preview temps réel */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Aperçu de l'annonce</p>
                  </div>
                  <div>
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      {media[0] ? (
                        media[0].type === 'image'
                          ? <img src={media[0].url} className="w-full h-full object-cover" alt="preview" />
                          : <video src={media[0].url} className="w-full h-full object-cover" muted />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50 to-amber-50">
                          <span className="text-4xl opacity-50">{selectedCat?.icon ?? '📦'}</span>
                          <span className="text-xs text-gray-400">Pas encore de photo</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      {selectedCat && (
                        <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wide mb-1">{selectedCat.name}</p>
                      )}
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem]">
                        {form.title || <span className="text-gray-300">Titre de l'annonce</span>}
                      </p>
                      <p className="text-base font-extrabold text-orange-500 mt-1">
                        {form.price ? `${parseInt(form.price).toLocaleString('fr')} FCFA` : <span className="text-gray-300 text-sm font-normal">Prix non défini</span>}
                      </p>
                      {form.city && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin size={9} /> {form.city}{form.quartier ? `, ${form.quartier}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Résumé */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-800 mb-4">Résumé</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Catégorie', value: selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : '—' },
                      { label: 'Photos', value: `${imageCount}/${MAX_IMAGES}` },
                      { label: 'Vidéo', value: hasVideo ? '✅' : '—' },
                      { label: 'Prix', value: form.price ? `${parseInt(form.price).toLocaleString('fr')} FCFA` : '—' },
                      { label: 'Commune', value: form.city || '—' },
                      { label: 'Quartier', value: form.quartier || '—' },
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
                    💡 {form.category === 'cat_auto' ? 'Conseils vente voiture' : form.category === 'cat_immo' ? 'Conseils immobilier' : 'Conseils pour vendre vite'}
                  </p>
                  <ul className="text-xs text-orange-600/80 space-y-1.5">
                    {form.category === 'cat_auto' ? (
                      <>
                        <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Photographiez l'extérieur, l'intérieur et le moteur</li>
                        <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Mentionnez si la vignette est à jour</li>
                      </>
                    ) : form.category === 'cat_immo' ? (
                      <>
                        <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Montrez toutes les pièces en photos</li>
                        <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Précisez l'accès eau et électricité</li>
                      </>
                    ) : (
                      <>
                        <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Ajoutez au moins 3 photos de qualité</li>
                        <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Une vidéo augmente les contacts de ×3</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Save size={14} className="text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-600">Sauvegarde automatique activée</p>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-orange-200 text-base">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Publication...</> : '🚀 Publier mon annonce'}
                </button>
                <p className="text-center text-xs text-gray-400">Gratuit · Validation sous 24h</p>
              </div>
            </div>
          </div>
        </form>

        {/* Barre flottante mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl px-4 py-3">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 truncate">
                {selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : 'Aucune catégorie'}
              </p>
              <p className="font-extrabold text-orange-500 text-base leading-tight">
                {form.price ? `${parseInt(form.price).toLocaleString('fr')} FCFA` : 'Prix non défini'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {form.city || '—'}{form.quartier ? `, ${form.quartier}` : ''}
              </p>
            </div>
            <button type="submit" form="publier-form" disabled={loading}
              className="flex-shrink-0 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-orange-200">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <span>🚀</span>}
              <span>Publier</span>
            </button>
          </div>
          {lastSaved && (
            <p className="text-[10px] text-gray-400 text-center mt-1 flex items-center justify-center gap-1">
              <Save size={9} /> Sauvegardé à {lastSaved}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}





