'use client'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { CATEGORIES, CITIES } from '@/lib/data'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'
import { CheckCircle, ChevronRight, Loader2, Lock, MapPin, Phone, Save, Shield, Upload, Video, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const LOCK_CONFIG: Record<string, { exemptSubcats: string[] }> = {
  cat_tech: {
    exemptSubcats: ['Jeux Vidéo', 'Objets Connectés', 'Pièces & Périphériques'],
  },
  cat_auto: { exemptSubcats: [] },
  cat_immo: { exemptSubcats: [] },
}

const EXCLUSIVE_CAT_IDS = Object.keys(LOCK_CONFIG)
const VIDEO_MAX_MB = 30
const VIDEO_MAX_BYTES = VIDEO_MAX_MB * 1024 * 1024

function isLocked(catId: string, subcatName: string, level: 'basic' | 'confirmed' | 'certified'): boolean {
  if (level === 'confirmed' || level === 'certified') return false
  const config = LOCK_CONFIG[catId]
  if (!config) return false
  if (!subcatName) return true
  if (config.exemptSubcats.includes(subcatName)) return false
  return true
}

const QUARTIERS: Record<string, string[]> = {
  'Abidjan': ['Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët', 'Treichville', 'Yopougon', 'Bingerville', 'Riviera', 'Angré', 'Deux-Plateaux', 'Bassam', 'Songon', 'Zone 4', 'Zone industrielle', 'Vridi', 'Williamsville', 'Carrefour Bandji', "N'dotré", "M'Pouto", 'Anoumabo'],
  'Bouaké': ['Centre', 'Air France', 'Belleville', 'Commerce', 'Koko', "N'Gattakro", 'Sokoura'],
  'Yamoussoukro': ['Habitat', 'Centre', 'Dioulakro', "N'Zuessy", 'Morofé'],
  'San-Pédro': ['Centre', 'Bardot', 'Cité', 'Zone industrielle'],
  'Korhogo': ['Centre', 'Commerce', 'Résidentiel'],
  'Daloa': ['Centre', 'Lobia', 'Tazibouo'],
  'Man': ['Centre', 'Libreville', 'Domoraud'],
  'Gagnoa': ['Centre', 'Dioulabougou', 'Résidentiel'],
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
  cat_location: {
    etats: ['Disponible', 'Sous réserve'],
    extraFields: [
      { name: 'capacite', label: 'Capacité / Places', placeholder: '30 personnes...' },
      { name: 'duree_min', label: 'Durée minimale', placeholder: '1 jour, 1 semaine...' },
      { name: 'caution', label: 'Caution (FCFA)', type: 'number', placeholder: '50000' },
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
  cat_bebe: {
    etats: ['Neuf', 'Très bon état', 'Bon état'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'Chicco, Graco...' },
      { name: 'age_cible', label: 'Âge cible', type: 'select', options: ['0-3 mois', '3-6 mois', '6-12 mois', '1-2 ans', '2-3 ans', '3-5 ans', '5+ ans'] },
    ],
  },
  cat_epicerie: {
    etats: ['Disponible', 'Stock limité'],
    extraFields: [
      { name: 'poids', label: 'Poids / Quantité', placeholder: '1kg, 500g, 1L...' },
      { name: 'origine', label: 'Origine', placeholder: "Côte d'Ivoire, Importé..." },
      { name: 'date_expiration', label: "Date d'expiration", placeholder: 'MM/AAAA' },
    ],
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

const STORAGE_KEY = 'abidjandeals_draft'
const EMPTY_FORM: Record<string, string> = {
  title: '', description: '', price: '',
  category: '', subcategory: '', etat: '',
  city: '', quartier: '', tel: '', whatsapp: '',
}

type MediaFile = { file: File; url: string; type: 'image' | 'video' }
type Location = { id: string; name: string; parent_id: string | null }

// ─── Carte de verrou ──────────────────────────────────────────────────────────
function CategoryLockCard({ categoryName, categoryIcon, subcatName, exemptSubcats, onGoBack, onUpgrade }: {
  categoryName: string; categoryIcon: string; subcatName: string
  exemptSubcats: string[]; onGoBack: () => void; onUpgrade: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 flex items-center gap-2">
        <Shield size={14} className="text-white/90" />
        <span className="text-white text-xs font-bold tracking-wide uppercase">Réservé aux membres certifiés</span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-xl flex-shrink-0">{categoryIcon}</div>
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">{categoryName}{subcatName ? ` › ${subcatName}` : ''}</p>
            <h3 className="text-gray-900 font-extrabold text-base leading-tight">Passez au statut CONFIRMÉ pour publier ici</h3>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4 flex gap-2.5">
          <Lock size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-xs leading-relaxed">Pour garantir la sécurité et lutter contre le recel, les catégories <strong>High-Tech</strong>, <strong>Véhicules</strong> et <strong>Immobilier</strong> sont réservées à nos membres certifiés.</p>
        </div>
        {exemptSubcats.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Accessibles sans vérification :</p>
            <div className="flex flex-wrap gap-1.5">
              {exemptSubcats.map(s => <span key={s} className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-lg px-2.5 py-1 font-medium">✓ {s}</span>)}
            </div>
          </div>
        )}
        <div className="space-y-2 mb-5">
          {['Badge vendeur CONFIRMÉ visible sur toutes vos annonces', 'Annonces illimitées + vidéos HD', 'Accès High-Tech, Véhicules & Immobilier complets', 'Vérification CNI en moins de 5 minutes'].map(b => (
            <div key={b} className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
              <span className="text-gray-600 text-xs">{b}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={onUpgrade} className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 text-sm mb-2.5">
          <Shield size={14} /> Devenir Confirmé — Vérifier mon CNI
        </button>
        <button type="button" onClick={onGoBack} className="w-full py-2 text-gray-500 hover:text-gray-700 text-xs font-medium rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
          ← Choisir une autre catégorie ou sous-catégorie
        </button>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function PublierPage() {
  const router = useRouter()
  const { user: storeUser } = useStore()
  const userLevel = storeUser?.level ?? 'basic'

  // ✅ AbortController ref — annule tous les uploads en cours
  const abortRef = useRef<AbortController | null>(null)

  const [lockState, setLockState] = useState<{
    catId: string; catName: string; catIcon: string
    subcatName: string; exemptSubcats: string[]
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null) // ✅ progress sans toast
  const [compressing, setCompressing] = useState(false)
  const [villes, setVilles] = useState<Location[]>([])
  const [communes, setCommunes] = useState<Location[]>([])
  const [sousQuartiers, setSousQuartiers] = useState<Location[]>([])
  const [selectedVilleId, setSelectedVilleId] = useState<string>('')
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [media, setMedia] = useState<MediaFile[]>([])
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM })

  const selectedCat = CATEGORIES.find(c => c.id === form.category)
  const catConfig: CatConfig = form.category ? (CATEGORY_FIELDS[form.category] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG
  const quartiersForCity = form.city ? (QUARTIERS[form.city] ?? []) : []
  const showLock = lockState !== null

  // ✅ Reset complet — stoppe aussi les uploads en cours
  function resetAll(currentMedia?: MediaFile[]) {
    // Annule tous les uploads en cours
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    const m = currentMedia ?? media
    m.forEach(item => URL.revokeObjectURL(item.url))
    setForm({ ...EMPTY_FORM })
    setMedia([])
    setHasDraft(false)
    setLastSaved(null)
    setLockState(null)
    setCompressing(false)
    setLoading(false)
    setUploadProgress(null)
    setSelectedVilleId('')
    setSelectedCommuneId('')
    localStorage.removeItem(STORAGE_KEY)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  useEffect(() => {
    async function loadVilles() {
      const { data } = await supabase.from('locations').select('id, name, parent_id').is('parent_id', null).eq('is_active', true).order('name')
      if (data) setVilles(data)
    }
    loadVilles()
    // Nettoyage au démontage
    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [])

  useEffect(() => {
    if (!selectedVilleId) { setCommunes([]); setSousQuartiers([]); return }
    supabase.from('locations').select('id, name, parent_id').eq('parent_id', selectedVilleId).eq('is_active', true).order('name')
      .then(({ data }) => { if (data) setCommunes(data); setSousQuartiers([]); setSelectedCommuneId('') })
  }, [selectedVilleId])

  useEffect(() => {
    if (!selectedCommuneId) { setSousQuartiers([]); return }
    supabase.from('locations').select('id, name, parent_id').eq('parent_id', selectedCommuneId).eq('is_active', true).order('name')
      .then(({ data }) => { if (data) setSousQuartiers(data) })
  }, [selectedCommuneId])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) { const draft = JSON.parse(saved); setForm(draft.form || {}); setHasDraft(true); setLastSaved(draft.savedAt || null) }
    } catch { }
  }, [])

  useEffect(() => {
    const hasContent = form.title || form.description || form.price || form.category
    if (!hasContent) return
    const timer = setTimeout(() => {
      try {
        const draft = { form, savedAt: new Date().toLocaleTimeString('fr-FR') }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
        setLastSaved(draft.savedAt); setHasDraft(true)
      } catch { }
    }, 3000)
    return () => clearTimeout(timer)
  }, [form])

  function clearDraft() { resetAll(); toast.success('Brouillon effacé') }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(f => { const u = { ...f, [name]: value }; if (name === 'city') u.quartier = ''; return u })
  }

  function handleCategoryChange(catId: string) {
    const cat = CATEGORIES.find(c => c.id === catId)
    if (!cat) return
    if (!EXCLUSIVE_CAT_IDS.includes(catId)) { setLockState(null); setForm(f => ({ ...f, category: catId, subcategory: '', etat: '' })); return }
    if (isLocked(catId, '', userLevel)) { setLockState({ catId, catName: cat.name, catIcon: cat.icon, subcatName: '', exemptSubcats: LOCK_CONFIG[catId]?.exemptSubcats ?? [] }); return }
    setLockState(null); setForm(f => ({ ...f, category: catId, subcategory: '', etat: '' }))
  }

  function handleSubcatChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const subcatName = e.target.value
    if (!subcatName) { setForm(f => ({ ...f, subcategory: '' })); return }
    if (isLocked(form.category, subcatName, userLevel)) {
      const cat = CATEGORIES.find(c => c.id === form.category)
      setLockState({ catId: form.category, catName: cat?.name ?? '', catIcon: cat?.icon ?? '', subcatName, exemptSubcats: LOCK_CONFIG[form.category]?.exemptSubcats ?? [] })
      setForm(f => ({ ...f, subcategory: '' })); return
    }
    setLockState(null); setForm(f => ({ ...f, subcategory: subcatName }))
  }

  function handleLockGoBack() { setLockState(null); setForm(f => ({ ...f, category: '', subcategory: '', etat: '' })) }
  function handleUpgrade() { router.push('/vendeur') }

  // ✅ Compression images + limite vidéo 30MB
  async function addMedia(files: FileList | null, type: 'image' | 'video') {
    if (!files) return
    if (type === 'video') {
      const file = files[0]; if (!file) return
      if (file.size > VIDEO_MAX_BYTES) { toast.error(`Vidéo trop lourde — max ${VIDEO_MAX_MB}MB`, { duration: 4000 }); return }
      setMedia(prev => [...prev, { file, url: URL.createObjectURL(file), type: 'video' as const }].slice(0, 6)); return
    }
    const limit = 5 - media.filter(m => m.type === 'image').length
    const selectedFiles = Array.from(files).slice(0, limit)
    if (!selectedFiles.length) return
    setCompressing(true)
    const compressed: MediaFile[] = []
    for (const file of selectedFiles) {
      try {
        const cf = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true })
        compressed.push({ file: cf, url: URL.createObjectURL(cf), type: 'image' })
      } catch { compressed.push({ file, url: URL.createObjectURL(file), type: 'image' }) }
    }
    setCompressing(false)
    toast.success(`${compressed.length} photo(s) optimisée(s) ✓`, { duration: 2000 })
    setMedia(prev => [...prev, ...compressed].slice(0, 6))
  }

  function removeMedia(i: number) {
    setMedia(prev => { URL.revokeObjectURL(prev[i].url); return prev.filter((_, idx) => idx !== i) })
  }

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
    if (!form.city) { toast.error('Choisissez une ville'); return }

    if (EXCLUSIVE_CAT_IDS.includes(form.category)) {
      const exempts = LOCK_CONFIG[form.category]?.exemptSubcats ?? []
      const subcatIsExempt = form.subcategory !== '' && exempts.includes(form.subcategory)
      if (!subcatIsExempt) {
        const { data: profile } = await supabase.from('profiles').select('level').eq('id', storeUser?.id ?? '').single()
        if (!profile || (profile.level !== 'confirmed' && profile.level !== 'certified')) {
          toast.error('Cette catégorie est réservée aux membres CONFIRMÉ'); return
        }
      }
    }

    // ✅ Crée un nouvel AbortController pour cette session d'upload
    const controller = new AbortController()
    abortRef.current = controller
    const cancelled = { value: false }

    setLoading(true)
    setUploadProgress(null)

    // ✅ Timeout global 90s — annule tout et affiche erreur propre
    const globalTimeout = setTimeout(() => {
      cancelled.value = true
      controller.abort()
      abortRef.current = null
      setLoading(false)
      setUploadProgress(null)
      toast.error('Connexion trop lente. Réessayez avec des photos plus légères.')
    }, 90000)

    try {
      let userId = storeUser?.id ?? null
      if (!userId) {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<null>(r => setTimeout(() => r(null), 5000))
        ])
        userId = (result as any)?.data?.session?.user?.id ?? null
      }
      if (!userId) { toast.error('Connectez-vous pour publier'); clearTimeout(globalTimeout); setLoading(false); return }

      const uploadedImages: string[] = []
      let videoUrl = ''

      if (media.length > 0) {
        for (let i = 0; i < media.length; i++) {
          // ✅ Vérifie si annulé avant chaque upload
          if (cancelled.value || controller.signal.aborted) break

          const m = media[i]
          // ✅ Affichage inline dans le bouton, pas de toast
          setUploadProgress(`${i + 1}/${media.length}`)

          try {
            const ext = m.file.name.split('.').pop()
            const bucket = m.type === 'image' ? 'ad-photos' : 'ad-videos'
            const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
            // ✅ Timeout dynamique par fichier (min 30s, +1s par 500KB)
            const timeoutMs = Math.max(30000, m.file.size / 500)
            const result = await Promise.race([
              supabase.storage.from(bucket).upload(path, m.file, { cacheControl: '3600', upsert: false }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
            ]) as any
            if (!cancelled.value && !result.error) {
              const { data } = supabase.storage.from(bucket).getPublicUrl(path)
              if (m.type === 'image') uploadedImages.push(data.publicUrl)
              else videoUrl = data.publicUrl
            }
          } catch {
            // Upload individuel échoué → on continue avec les suivants
          }
        }
      }

      // ✅ Si annulé pendant l'upload → stop propre
      if (cancelled.value || controller.signal.aborted) {
        clearTimeout(globalTimeout); return
      }

      setUploadProgress(null)

      let subCategoryUuid: string | null = null
      if (form.subcategory && form.category) {
        const { data: subCat } = await supabase.from('sub_categories').select('id').eq('category_id', form.category).ilike('name', form.subcategory).maybeSingle()
        subCategoryUuid = subCat?.id ?? null
      }

      const { error } = await Promise.race([
        supabase.from('ads').insert({
          user_id: userId, title: form.title, description: form.description,
          price: parseInt(form.price), category_id: form.category,
          subcategory: form.subcategory || null, sub_category_id: subCategoryUuid,
          etat: form.etat || null, marque: form.marque || null,
          city: form.city, quartier: form.quartier || null,
          tel: form.tel, whatsapp: form.whatsapp || form.tel,
          images: uploadedImages, video_url: videoUrl || null,
          status: 'active', views: 0,
        }),
        new Promise<{ error: { message: string } }>(r => setTimeout(() => r({ error: { message: 'Délai dépassé' } }), 30000))
      ])

      clearTimeout(globalTimeout)
      abortRef.current = null

      if (error) { toast.error('Erreur: ' + error.message); setLoading(false); setUploadProgress(null); return }

      // ✅ Reset complet après succès
      resetAll()
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 3000)

    } catch (err) {
      if (!cancelled.value) toast.error('Une erreur est survenue. Réessayez.')
      clearTimeout(globalTimeout)
      abortRef.current = null
      setLoading(false)
      setUploadProgress(null)
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
        <p className="text-gray-500">Votre annonce est maintenant en ligne et visible par tous !</p>
        <div className="flex gap-3">
          <button onClick={() => setSuccess(false)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
            + Publier une autre annonce
          </button>
          <button onClick={() => router.push('/dashboard')} className="px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition">
            Voir mes annonces
          </button>
        </div>
        <p className="text-xs text-gray-400">Redirection automatique dans 3 secondes...</p>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ UN SEUL Toaster — durée 3s */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 pb-28 lg:pb-8">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Publier une annonce</h1>
            <p className="text-gray-400 mt-1">Le formulaire s'adapte automatiquement à votre article</p>
          </div>
          <div className="flex items-center gap-3">
            {userLevel === 'basic' && <span className="text-[10px] font-bold bg-gray-100 text-gray-500 rounded-full px-2.5 py-1 flex items-center gap-1"><Lock size={9} /> Plan BASIC</span>}
            {userLevel === 'confirmed' && <span className="text-[10px] font-bold bg-green-100 text-green-600 rounded-full px-2.5 py-1 flex items-center gap-1"><Shield size={9} /> CONFIRMÉ</span>}
            {userLevel === 'certified' && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full px-2.5 py-1 flex items-center gap-1"><Shield size={9} /> CERTIFIÉ</span>}
            {lastSaved && <span className="text-xs text-gray-400 flex items-center gap-1"><Save size={11} /> Sauvegardé à {lastSaved}</span>}
            {hasDraft && (
              <button type="button" onClick={clearDraft} className="text-xs text-red-400 hover:text-red-500 border border-red-100 rounded-lg px-3 py-1.5 transition">
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
                  {CATEGORIES.map(cat => {
                    const isSensitive = EXCLUSIVE_CAT_IDS.includes(cat.id)
                    const allLocked = isSensitive && (LOCK_CONFIG[cat.id]?.exemptSubcats.length === 0)
                    const partiallyFree = isSensitive && ((LOCK_CONFIG[cat.id]?.exemptSubcats.length ?? 0) > 0)
                    const isSelected = form.category === cat.id && !showLock
                    return (
                      <button key={cat.id} type="button" onClick={() => handleCategoryChange(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${isSelected ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' : isSensitive && userLevel === 'basic' ? 'border-gray-100 text-gray-400 hover:border-amber-200 hover:bg-amber-50/40' : 'border-gray-100 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'}`}>
                        <span className="text-base">{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                        {userLevel === 'basic' && allLocked && <Lock size={9} className="ml-auto flex-shrink-0 text-amber-500" />}
                        {userLevel === 'basic' && partiallyFree && <span className="ml-auto text-[8px] bg-amber-100 text-amber-600 rounded px-1 font-bold flex-shrink-0">PARTIEL</span>}
                      </button>
                    )
                  })}
                </div>
                {selectedCat && !showLock && (
                  <select name="subcategory" value={form.subcategory} onChange={handleSubcatChange}
                    className="mt-3 w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                    <option value="">Sous-catégorie (optionnel)</option>
                    {selectedCat.subcats.map(s => {
                      const subcatLocked = isLocked(form.category, s, userLevel)
                      return <option key={s} value={s}>{subcatLocked ? `🔒 ${s}` : s}</option>
                    })}
                  </select>
                )}
                {showLock && lockState && (
                  <div className="mt-4">
                    <CategoryLockCard categoryName={lockState.catName} categoryIcon={lockState.catIcon} subcatName={lockState.subcatName} exemptSubcats={lockState.exemptSubcats} onGoBack={handleLockGoBack} onUpgrade={handleUpgrade} />
                  </div>
                )}
              </div>

              {!showLock && (
                <>
                  {/* Étape 2 — Photos & Vidéo */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 pt-5 pb-3 border-b border-gray-50 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">2</div>
                      <h2 className="font-bold text-gray-800">Photos & Vidéo</h2>
                      <span className="ml-auto text-xs text-gray-400">{media.length}/6</span>
                    </div>
                    <div className="p-5">
                      <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer mb-4 group ${compressing ? 'border-orange-300 bg-orange-50/50 cursor-wait' : 'border-gray-200 hover:border-orange-400'}`}
                        onClick={() => !compressing && fileInputRef.current?.click()}>
                        {compressing ? (
                          <><Loader2 size={28} className="mx-auto text-orange-400 animate-spin mb-2" /><p className="font-semibold text-orange-500 text-sm">Optimisation en cours...</p><p className="text-xs text-gray-400 mt-1">Vos photos sont compressées pour un upload rapide</p></>
                        ) : (
                          <><Upload size={28} className="mx-auto text-gray-300 group-hover:text-orange-400 transition mb-2" /><p className="font-semibold text-gray-600 text-sm">Glissez vos photos ou cliquez</p><p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max 5 photos · Optimisées automatiquement ✓</p></>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addMedia(e.target.files, 'image')} />
                      </div>
                      {media.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {media.map((m, i) => (
                            <div key={i} className={`relative rounded-xl overflow-hidden border-2 aspect-square ${i === 0 ? 'border-orange-400' : 'border-gray-100'}`}>
                              {m.type === 'image' ? <img src={m.url} alt="" className="w-full h-full object-cover" /> : <video src={m.url} className="w-full h-full object-cover" muted />}
                              {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[9px] font-bold text-center py-0.5">PRINCIPALE</span>}
                              {m.type === 'video' && <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">📹</span>}
                              <button type="button" onClick={() => removeMedia(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition"><X size={10} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      {!media.find(m => m.type === 'video') && (
                        <div>
                          <button type="button" onClick={() => videoInputRef.current?.click()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 border border-dashed border-gray-200 hover:border-orange-300 rounded-xl px-4 py-2.5 w-full justify-center transition">
                            <Video size={15} /> Ajouter une vidéo (booste les contacts ×3)
                          </button>
                          <p className="text-[11px] text-gray-400 text-center mt-1.5">Max {VIDEO_MAX_MB}MB · environ 30 secondes</p>
                        </div>
                      )}
                      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => addMedia(e.target.files, 'video')} />
                    </div>
                  </div>

                  {/* Étape 3 — Détails */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">3</div>
                      <h2 className="font-bold text-gray-800">{form.category ? `Détails — ${selectedCat?.name}` : "Détails de l'annonce"}</h2>
                    </div>
                    <div className="space-y-3">
                      <input name="title" value={form.title} onChange={handleChange} required placeholder={selectedCat ? `Titre — ex: ${selectedCat.name} à vendre...` : "Titre de l'annonce *"} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition font-medium" />
                      <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                        placeholder={form.category === 'cat_auto' ? "Décrivez la voiture : options, historique d'entretien, raison de vente..." : form.category === 'cat_immo' ? 'Décrivez le bien : équipements, voisinage, accès, charges...' : form.category === 'cat_tech' ? "Décrivez l'état, les accessoires inclus, raison de vente..." : form.category === 'cat_serv' ? 'Décrivez votre service, vos compétences, vos références...' : 'Décrivez votre article en détail...'}
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition resize-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input name="price" value={form.price} onChange={handleChange} required type="number" min="0" placeholder={form.category === 'cat_location' ? 'Prix / jour *' : form.category === 'cat_serv' ? 'Tarif *' : 'Prix *'} className="w-full border border-gray-100 bg-gray-50 rounded-xl pl-4 pr-16 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition font-bold" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">FCFA</span>
                        </div>
                        <select name="etat" value={form.etat} onChange={handleChange} className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                          <option value="">État</option>
                          {catConfig.etats.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                      {catConfig.extraFields.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                          {catConfig.extraFields.map(field => (
                            <div key={field.name}>
                              {field.type === 'select' ? (
                                <select name={field.name} value={form[field.name] || ''} onChange={handleChange} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                                  <option value="">{field.label}</option>
                                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                              ) : (
                                <input name={field.name} value={form[field.name] || ''} onChange={handleChange} type={field.type || 'text'} placeholder={field.label} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
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
                      <select name="city" value={form.city} onChange={handleChange} required className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                        <option value="">Ville *</option>
                        {CITIES.map(c => { const name = c.replace(/^[^\s]+\s/, ''); return <option key={name} value={name}>{name}</option> })}
                      </select>
                      {quartiersForCity.length > 0 ? (
                        <select name="quartier" value={form.quartier} onChange={handleChange} className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                          <option value="">Quartier (optionnel)</option>
                          {quartiersForCity.map(q => <option key={q} value={q}>{q}</option>)}
                          <option value="Autre">Autre quartier</option>
                        </select>
                      ) : (
                        <input name="quartier" value={form.quartier} onChange={handleChange} placeholder="Quartier (optionnel)" className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                      )}
                    </div>
                    {form.quartier === 'Autre' && (
                      <input onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))} placeholder="Précisez votre quartier" className="mt-3 w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                    )}
                  </div>

                  {/* Étape 5 — Contact */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">5</div>
                      <Phone size={16} className="text-orange-500" />
                      <h2 className="font-bold text-gray-800">Contact</h2>
                    </div>
                    <div className="space-y-3">
                      <input name="tel" value={form.tel} onChange={handleChange} required placeholder="Téléphone * (+225 07 12 34 56 78)" className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                      <input name="whatsapp" value={form.whatsapp || ''} onChange={handleChange} placeholder="WhatsApp si différent du téléphone" className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Colonne droite sticky */}
            <div className="hidden lg:block">
              <div className="sticky top-4 space-y-4">
                {showLock ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3"><Lock size={18} className="text-amber-600" /></div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Accès restreint</p>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">Cette catégorie est réservée aux membres CONFIRMÉ avec vérification CNI.</p>
                    <button type="button" onClick={handleUpgrade} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"><Shield size={12} /> Devenir Confirmé</button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="font-bold text-gray-800 mb-4">Résumé</h3>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Catégorie', value: selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : '—' },
                          { label: 'Sous-catégorie', value: form.subcategory || '—' },
                          { label: 'Photos', value: `${media.filter(m => m.type === 'image').length}/5` },
                          { label: 'Vidéo', value: media.find(m => m.type === 'video') ? '✅' : '—' },
                          { label: 'Prix', value: form.price ? `${parseInt(form.price).toLocaleString('fr')} FCFA` : '—' },
                          { label: 'Ville', value: form.city || '—' },
                          { label: 'Quartier', value: form.quartier || '—' },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{item.label}</span>
                            <span className="font-semibold text-gray-700 text-right max-w-[60%] truncate">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                      <p className="text-xs font-bold text-orange-600 mb-2">💡 {form.category === 'cat_auto' ? 'Conseils vente voiture' : form.category === 'cat_immo' ? 'Conseils immobilier' : 'Conseils pour vendre vite'}</p>
                      <ul className="text-xs text-orange-600/80 space-y-1.5">
                        {form.category === 'cat_auto' ? <>
                          <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Photographiez l'extérieur, l'intérieur et le moteur</li>
                          <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Mentionnez si la vignette est à jour</li>
                        </> : form.category === 'cat_immo' ? <>
                          <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Montrez toutes les pièces en photos</li>
                          <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Précisez l'accès eau et électricité</li>
                        </> : <>
                          <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Ajoutez au moins 3 photos de qualité</li>
                          <li className="flex gap-1.5"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" />Une vidéo augmente les contacts de ×3</li>
                        </>}
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                      <Save size={14} className="text-blue-500 flex-shrink-0" />
                      <p className="text-xs text-blue-600">Sauvegarde automatique activée</p>
                    </div>

                    {/* ✅ Bouton avec progress inline — zéro toast */}
                    <button type="submit" disabled={loading || compressing}
                      className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-200 text-base">
                      {compressing ? <><Loader2 size={18} className="animate-spin" /> Optimisation...</>
                        : loading && uploadProgress ? <><Loader2 size={18} className="animate-spin" /> Photo {uploadProgress}...</>
                          : loading ? <><Loader2 size={18} className="animate-spin" /> Publication...</>
                            : '🚀 Publier mon annonce'}
                    </button>
                    <p className="text-center text-xs text-gray-400">Gratuit · Visible immédiatement</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Barre mobile flottante */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl px-4 py-3">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            {showLock ? (
              <div className="flex-1 flex items-center gap-3">
                <Lock size={16} className="text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-700 font-semibold truncate">Catégorie réservée CONFIRMÉ</p>
                  <p className="text-[10px] text-gray-400">Vérifiez votre CNI pour accéder</p>
                </div>
                <button type="button" onClick={handleUpgrade} className="flex-shrink-0 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-orange-200">
                  <Shield size={12} /> Devenir Confirmé
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 truncate">{selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : 'Aucune catégorie'}{form.subcategory ? ` › ${form.subcategory}` : ''}</p>
                  <p className="font-extrabold text-orange-500 text-base leading-tight">{form.price ? `${parseInt(form.price).toLocaleString('fr')} FCFA` : 'Prix non défini'}</p>
                  <p className="text-xs text-gray-400 truncate">{form.city || '—'}{form.quartier ? `, ${form.quartier}` : ''}</p>
                </div>
                <button type="submit" form="publier-form" disabled={loading || compressing}
                  className="flex-shrink-0 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-200">
                  {loading || compressing ? <Loader2 size={16} className="animate-spin" /> : <span>🚀</span>}
                  <span>{compressing ? 'Optim...' : loading && uploadProgress ? `${uploadProgress}` : loading ? 'Pub...' : 'Publier'}</span>
                </button>
              </>
            )}
          </div>
          {lastSaved && !showLock && (
            <p className="text-[10px] text-gray-400 text-center mt-1 flex items-center justify-center gap-1"><Save size={9} /> Sauvegardé à {lastSaved}</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
