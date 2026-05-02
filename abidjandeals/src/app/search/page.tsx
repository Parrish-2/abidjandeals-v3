"use client";

import { AgeGate } from '@/components/AgeGate';
import { formatFCFA } from '@/lib/format';
import { createBrowserClient } from "@supabase/ssr";
import {
  ChevronRight, Clock, Eye, GridIcon, LayoutList,
  MapPin, Search, SlidersHorizontal, Star, Tag, TrendingUp, X, Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

const ADULT_CATEGORIES = ['lingerie', 'cat_lingerie']
const STORAGE_KEY = 'abidjandeals_age_verified'

function isAgeVerified(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
}

const SLUG_TO_DB_CATEGORY: Record<string, string> = {
  'auto': 'cat_auto', 'automobile': 'cat_auto', 'vehicules-equipements': 'cat_auto', 'vehicules': 'cat_auto',
  'hightech': 'cat_tech', 'high-tech': 'cat_tech', 'hightech-informatique': 'cat_tech', 'tech': 'cat_tech',
  'immobilier': 'cat_immo', 'immo': 'cat_immo',
  'location': 'cat_location', 'mode': 'cat_mode', 'maison': 'cat_maison',
  'electromenager': 'cat_elec', 'bebe': 'cat_bebe',
  'services': 'cat_serv', 'emploi': 'cat_serv',
  'sport': 'cat_loisir', 'sport-loisirs': 'cat_loisir', 'loisirs': 'cat_loisir',
  'pharma': 'cat_pharma', 'epicerie': 'cat_epicerie',
  'autres': 'cat_autres', 'agri': 'cat_agri', 'agriculture': 'cat_agri', 'agriculture-industrie': 'cat_agri',
  'lingerie': 'cat_lingerie', 'cat_lingerie': 'cat_lingerie',
  'cat_auto': 'cat_auto', 'cat_tech': 'cat_tech', 'cat_immo': 'cat_immo',
  'cat_mode': 'cat_mode', 'cat_maison': 'cat_maison', 'cat_serv': 'cat_serv',
  'cat_loisir': 'cat_loisir', 'cat_autres': 'cat_autres', 'cat_agri': 'cat_agri',
}

// ✅ DEPRECATED - No longer needed, will fetch from DB
const SUBCAT_SLUG_TO_DB_NAME: Record<string, string> = {}

function resolveDbCategoryId(slug: string | null): string | null {
  if (!slug) return null
  return SLUG_TO_DB_CATEGORY[slug] ?? slug
}

const LABELS: Record<string, string> = {
  "auto": "Automobile & Industrie", "hightech": "High-Tech & Informatique",
  "hightech-informatique": "High-Tech & Informatique", "vehicules-equipements": "Véhicules & Équipements",
  "location": "Location & Mobilité", "immobilier": "Immobilier", "mode": "Mode & Beauté",
  "maison": "Maison & Décoration", "services": "Services & Emploi", "sport": "Sport & Loisirs",
  "sport-loisirs": "Sport & Loisirs", "autres": "Autres & Divers", "lingerie": "Lingerie & Adulte",
  "cat_lingerie": "Lingerie & Adulte", "cat_auto": "Automobile & Industrie",
  "cat_tech": "High-Tech & Informatique", "cat_immo": "Immobilier", "cat_mode": "Mode & Beauté",
  "cat_maison": "Maison & Décoration", "cat_serv": "Services & Emploi", "cat_loisir": "Sport & Loisirs",
  "cat_autres": "Autres & Divers", "voitures-occasion": "Voitures d'occasion",
  "voitures-neuves": "Voitures Neuves", "motos-scooters": "Motos & Scooters",
  "pieces-pneus": "Pièces détachées & Pneus", "location-auto": "Location Auto",
  "camions-utilitaires": "Camions & Utilitaires", "groupes-electrogenes": "Groupes Électrogènes",
  "materiel-agricole": "Matériel Agricole", "outillage-industriel": "Outillage Industriel",
  "engins-chantier": "Équipements de Chantier", "smartphones": "Smartphones",
  "tablettes": "Téléphones & Tablettes", "ordinateurs": "Ordinateurs & Laptops",
  "tv-son": "TV & Home Cinéma", "photo-video": "Photo & Vidéo",
  "consoles-jeux": "Consoles & Jeux Vidéo", "objets-connectes": "Objets Connectés",
  "composants": "Composants (RAM, SSD, Cartes Mères)", "imprimantes": "Imprimantes & Scanners",
  "cameras": "Cameras", "telephones-accessoires": "Téléphones & Accessoires",
  "vente-appartement": "Location Appartements",
  "vente-maison-villa": "Vente Maisons & Villas", "location-meublee": "Location Meublée",
  "location-vide": "Location Vide", "colocation": "Colocation", "terrains": "Terrains avec ACD",
  "bureaux-boutiques": "Bureaux & Commerces", "vetements": "Vêtements & Chaussures",
  "chaussures": "Chaussures", "sacs-accessoires": "Sacs & Accessoires", "montres": "Montres & Bijoux",
  "cosmetiques": "Cosmétiques & Parfums", "meubles": "Meubles", "decoration": "Décoration",
  "jardin-bricolage": "Jardin & Bricolage", "offres-emploi": "Offres d'Emploi",
  "freelance-it": "Freelance IT & Design", "batiment": "BTP & Artisanat",
  "cours-formation": "Cours & Formations", "transport": "Transport & Livraison",
  "menage": "Ménage & Nettoyage", "securite": "Sécurité & Gardiennage",
  "evenementiel": "Événementiel", "equipements-sport": "Équipements de Sport",
  "instruments-musique": "Instruments de Musique", "jouets": "Jouets & Jeux",
  "voyages": "Voyages & Tourisme", "velos": "Vélos & Trottinettes",
  "animaux": "Animaux & Accessoires", "collection": "Objets de Collection", "inclassables": "Inclassables",
}

const CAT_EMOJI: Record<string, string> = {
  "vehicules-equipements": "🚗", "cat_auto": "🚗", "auto": "🚗",
  "immobilier": "🏠", "cat_immo": "🏠", "hightech-informatique": "📱",
  "cat_tech": "📱", "hightech": "📱", "mode": "👗", "cat_mode": "👗",
  "maison": "🛋️", "cat_maison": "🛋️", "services": "🛠️", "cat_serv": "🛠️",
  "sport-loisirs": "⚽", "cat_loisir": "⚽", "sport": "⚽",
  "autres": "📦", "cat_autres": "📦", "cat_agri": "🌾", "agri": "🌾",
  "agriculture": "🌾", "lingerie": "🌸", "cat_lingerie": "🌸",
}

function getLabel(slug: string | null): string {
  if (!slug) return "Toutes les annonces"
  return LABELS[slug] ?? LABELS[resolveDbCategoryId(slug) ?? '']
    ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function getCatEmoji(cat: string | null): string {
  if (!cat) return "🏷️"
  return CAT_EMOJI[cat] ?? CAT_EMOJI[resolveDbCategoryId(cat) ?? ''] ?? "📦"
}

interface Ad {
  id: string; title: string; price: number; category_id: string;
  sub_category_id?: string; etat: string; marque: string; city: string;
  quartier: string; images: string[]; boost_level: 'STANDARD' | 'PREMIUM' | 'URGENT' | null;
  views: number; status: string; created_at: string;
}

function AdCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
        <div className="h-4 bg-gray-100 rounded-full w-full" />
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="h-5 bg-orange-100 rounded-full w-2/5 mt-1" />
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-gray-100 rounded-full w-1/4" />
          <div className="h-3 bg-gray-100 rounded-full w-1/5" />
        </div>
      </div>
    </div>
  )
}

function AdCard({ ad, view = "grid" }: { ad: Ad; view?: "grid" | "list" }) {
  const img = ad.images?.[0] ?? null
  const isBoosted = !!ad.boost_level
  const timeAgo = (() => {
    const diff = Date.now() - new Date(ad.created_at).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return "À l'instant"
    if (h < 24) return `Il y a ${h}h`
    const d = Math.floor(h / 24)
    if (d < 7) return `Il y a ${d}j`
    return new Date(ad.created_at).toLocaleDateString("fr-CI", { day: "numeric", month: "short" })
  })()

  if (view === "list") {
    return (
      <Link href={`/ad/${ad.id}`}>
        <article className="group flex gap-4 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="relative w-36 h-28 flex-shrink-0 bg-gray-50">
            {img ? <img src={img} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              : <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-orange-50 to-amber-50">{getCatEmoji(ad.category_id)}</div>}
            {isBoosted && <span className="absolute top-2 left-2 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1"><Zap size={8} fill="white" /></span>}
          </div>
          <div className="flex-1 py-3 pr-4 min-w-0">
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-1">{getLabel(ad.category_id)}</p>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">{ad.title}</h3>
            {ad.marque && <p className="text-xs text-gray-400 mt-0.5">{ad.marque}</p>}
            <p className="text-base font-bold text-orange-500 mt-1.5">{formatFCFA(ad.price)}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-[11px] text-gray-400"><MapPin size={10} /> {ad.city}{ad.quartier ? `, ${ad.quartier}` : ""}</span>
              {ad.etat && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{ad.etat}</span>}
              <span className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto"><Clock size={10} /> {timeAgo}</span>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={`/ad/${ad.id}`}>
      <article className="group relative rounded-2xl bg-white border border-gray-100 overflow-hidden hover:border-orange-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        {isBoosted && (
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1">
            <Zap size={10} className="text-white fill-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Annonce boostée</span>
          </div>
        )}
        <div className={`relative overflow-hidden bg-gray-50 ${isBoosted ? "pt-6" : ""}`} style={{ height: 188 }}>
          {img ? <img src={img} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            : <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
              <span className="text-5xl opacity-60">{getCatEmoji(ad.category_id)}</span>
              <span className="text-[10px] text-gray-400 font-medium">Pas de photo</span>
            </div>}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-3.5">
          <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-1 truncate">{getLabel(ad.category_id)}{ad.marque ? ` - ${ad.marque}` : ""}</p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors min-h-[2.5rem]">{ad.title}</h3>
          <p className="mt-2 text-[17px] font-extrabold text-orange-500 leading-none">{formatFCFA(ad.price)}</p>
          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
            <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate"><MapPin size={10} className="flex-shrink-0" />{ad.city}{ad.quartier ? `, ${ad.quartier}` : ""}</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-300 flex-shrink-0 ml-2"><Eye size={10} /> {ad.views ?? 0}</span>
          </div>
          {ad.etat && <span className="mt-2 inline-block text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{ad.etat}</span>}
        </div>
      </article>
    </Link>
  )
}

function EmptyState({ query, label }: { query: string; label: string }) {
  const suggestions = ["Voitures d'occasion", "iPhone 14", "Appartement Cocody", "MacBook Pro", "Groupe électrogène"]
  return (
    <div className="col-span-full">
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center mb-8">
          <Search size={48} className="text-orange-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {query ? `Aucun résultat pour "${query}"` : `Aucune annonce dans ${label}`}
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          {query ? "Essayez d'autres mots-clés ou explorez les catégories." : "Soyez le premier à publier dans cette catégorie !"}
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {suggestions.map((s) => <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full hover:border-orange-300 transition-colors">{s}</Link>)}
        </div>
        <div className="flex gap-3">
          <Link href="/" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Accueil</Link>
          <Link href="/publier" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors">Publier une annonce</Link>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-4"><span className="text-4xl">⚠️</span></div>
      <h2 className="text-lg font-bold text-red-500 mb-1">Erreur de chargement</h2>
      <p className="text-gray-400 text-sm max-w-xs">{message}</p>
    </div>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ✅ Lecture des params URL
  const categorySlug = searchParams.get("category") ?? searchParams.get("cat")
  const subcategorySlug = searchParams.get("sub") ?? searchParams.get("subcategory") ?? searchParams.get("subcat")
  const q = searchParams.get("q") ?? ""
  const sort = searchParams.get("sort") ?? "recent"

  // ✅ Résolution immédiate et stable des IDs
  const dbCategoryId = resolveDbCategoryId(categorySlug)
  const subCategoryId = useRef<string | null>(null)
  const [subCategoryIdResolved, setSubCategoryIdResolved] = useState<string | null>(null)

  // ✅ FIXED: Query Supabase to get subcategory ID from slug
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  // ✅ Resolve subcategory ID on mount or when subcategorySlug changes
  useEffect(() => {
    if (!subcategorySlug || !dbCategoryId) {
      setSubCategoryIdResolved(null)
      return
    }

    const resolveSubcategory = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', subcategorySlug)
          .eq('parent_id', dbCategoryId)
          .maybeSingle()

        if (error) throw error
        setSubCategoryIdResolved(data?.id ?? null)
        console.log('[resolveSubcategory] Resolved slug:', subcategorySlug, '→ ID:', data?.id)
      } catch (err) {
        console.error('[resolveSubcategory] Error:', err)
        setSubCategoryIdResolved(null)
      }
    }

    resolveSubcategory()
  }, [subcategorySlug, dbCategoryId, supabase])

  const isAdultCategory = ADULT_CATEGORIES.some((a) => a === categorySlug || a === dbCategoryId)
  const [ageCleared, setAgeCleared] = useState<boolean>(!isAdultCategory || isAgeVerified())
  const [showAgeGate, setShowAgeGate] = useState<boolean>(isAdultCategory && !isAgeVerified())

  const prevCatRef = useRef(categorySlug)
  useEffect(() => {
    if (prevCatRef.current === categorySlug) return
    prevCatRef.current = categorySlug
    const adult = ADULT_CATEGORIES.some((a) => a === categorySlug || a === resolveDbCategoryId(categorySlug))
    if (adult && !isAgeVerified()) { setAgeCleared(false); setShowAgeGate(true) }
    else { setAgeCleared(true); setShowAgeGate(false) }
  }, [categorySlug])

  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [selectedEtat, setSelectedEtat] = useState("")

  // ✅ FIXED: fetchAds now receives resolved subcategory ID
  const fetchAds = useMemo(() => async (params: {
    dbCategoryId: string | null
    subCategoryId: string | null
    q: string
    sort: string
    priceMin: string
    priceMax: string
    selectedEtat: string
  }) => {
    setLoading(true)
    setError(null)

    console.log('[fetchAds] Paramètres reçus:', params)

    try {
      let query = supabase
        .from("ads")
        .select(`id, title, price, category_id, sub_category_id, etat, marque, city, quartier, images, boost_level, views, status, created_at`, { count: "exact" })
        .in("status", ["active", "approved"])

      // ✅ CORRECTED FILTER:
      // If both category AND subcategory are provided, filter by BOTH
      if (params.subCategoryId && params.dbCategoryId) {
        console.log('[fetchAds] Filtre: catégorie=', params.dbCategoryId, '+ sous-catégorie=', params.subCategoryId)
        query = query
          .eq("category_id", params.dbCategoryId)
          .eq("sub_category_id", params.subCategoryId)
      }
      // If only category is provided, filter by category only
      else if (params.dbCategoryId) {
        console.log('[fetchAds] Filtre: catégorie seule=', params.dbCategoryId)
        query = query.eq("category_id", params.dbCategoryId)
      }

      if (params.q.trim()) query = query.or(`title.ilike.%${params.q.trim()}%,description.ilike.%${params.q.trim()}%`)
      if (params.priceMin) query = query.gte("price", parseInt(params.priceMin))
      if (params.priceMax) query = query.lte("price", parseInt(params.priceMax))
      if (params.selectedEtat) query = query.eq("etat", params.selectedEtat)

      switch (params.sort) {
        case "price_asc": query = query.order("price", { ascending: true }); break
        case "price_desc": query = query.order("price", { ascending: false }); break
        case "popular": query = query.order("views", { ascending: false }); break
        default: query = query.order("created_at", { ascending: false })
      }

      const { data, error: sbError, count } = await query.limit(48)

      console.log('[fetchAds] Résultat:', { count, data: (data as Ad[])?.map(a => ({ id: a.id, title: a.title, category_id: a.category_id, sub_category_id: a.sub_category_id })) })

      if (sbError) throw sbError
      setAds((data as Ad[]) ?? [])
      setTotal(count ?? 0)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // ✅ useEffect déclenche fetchAds avec les valeurs ACTUELLES à chaque changement
  useEffect(() => {
    if (!ageCleared) return
    fetchAds({ dbCategoryId, subCategoryId: subCategoryIdResolved, q, sort, priceMin, priceMax, selectedEtat })
  }, [ageCleared, dbCategoryId, subCategoryIdResolved, q, sort, priceMin, priceMax, selectedEtat, fetchAds])

  const handleApplyFilters = () => {
    if (!ageCleared) return
    fetchAds({ dbCategoryId, subCategoryId: subCategoryIdResolved, q, sort, priceMin, priceMax, selectedEtat })
    setShowFilters(false)
  }

  const pageLabel = subcategorySlug ? getLabel(subcategorySlug) : categorySlug ? getLabel(categorySlug) : q ? `Résultats pour "${q}"` : "Toutes les annonces"
  const pageEmoji = subcategorySlug ? getCatEmoji(subcategorySlug) : getCatEmoji(categorySlug)

  const sortOptions = [
    { value: "recent", label: "Plus récents", icon: Clock },
    { value: "price_asc", label: "Prix croissant", icon: Tag },
    { value: "price_desc", label: "Prix décroissant", icon: Tag },
    { value: "popular", label: "Populaires", icon: TrendingUp },
  ]
  const etats = ["Neuf", "Comme neuf", "Bon état", "État correct", "Disponible"]
  const hasActiveFilters = priceMin || priceMax || selectedEtat

  return (
    <main className="min-h-screen bg-gray-50">
      {showAgeGate && <AgeGate onConfirm={() => { setShowAgeGate(false); setAgeCleared(true) }} onRefuse={() => { setShowAgeGate(false); router.push('/search') }} />}

      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F1117 0%, #1a2035 60%, #1f1a0e 100%)" }}>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:px-8">
          <div className="flex items-center gap-2 text-xs text-white/30 mb-4 font-medium">
            <Link href="/" className="hover:text-orange-400 transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            {categorySlug && <Link href={`/search?category=${categorySlug}`} className="hover:text-orange-400 transition-colors text-white/50">{getLabel(categorySlug)}</Link>}
            {subcategorySlug && <><ChevronRight size={12} /><span className="text-white/70">{getLabel(subcategorySlug)}</span></>}
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xl">{pageEmoji}</div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {pageLabel}
                  {isAdultCategory && ageCleared && <span className="ml-2 align-middle text-[11px] font-bold bg-pink-600 text-white px-2 py-0.5 rounded-full">🔞 18+</span>}
                </h1>
              </div>
              {!loading && !error && ageCleared && (
                <p className="text-sm text-white/40 mt-1">
                  <span className="text-orange-400 font-bold">{total.toLocaleString("fr-CI")}</span>{" "}
                  annonce{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const val = (new FormData(e.currentTarget).get("q") as string); if (val?.trim()) { const p = new URLSearchParams(searchParams.toString()); p.set("q", val); router.push(`/search?${p.toString()}`); } }}>
              <div className="flex-1 flex items-center bg-white/10 border border-white/15 rounded-xl overflow-hidden backdrop-blur-sm">
                <Search size={16} className="ml-3 text-white/40 flex-shrink-0" />
                <input name="q" defaultValue={q} placeholder={`Rechercher dans ${pageLabel}...`} className="flex-1 px-3 py-2.5 bg-transparent text-white placeholder:text-white/30 text-sm outline-none" />
              </div>
              <button type="submit" className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0">OK</button>
            </form>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto">
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${hasActiveFilters ? 'bg-orange-50 border-orange-300 text-orange-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <SlidersHorizontal size={13} /> Filtres
            </button>
            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
            {sortOptions.map((s) => {
              const params = new URLSearchParams(searchParams.toString()); params.set("sort", s.value)
              const isActive = sort === s.value; const Icon = s.icon
              return <Link key={s.value} href={`/search?${params.toString()}`} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}><Icon size={13} /> {s.label}</Link>
            })}
            <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-orange-100 text-orange-500" : "text-gray-400 hover:text-gray-600"}`}><GridIcon size={16} /></button>
              <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-orange-100 text-orange-500" : "text-gray-400 hover:text-gray-600"}`}><LayoutList size={16} /></button>
            </div>
          </div>
        </div>
        {showFilters && (
          <div className="border-t border-gray-100 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Prix (FCFA)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100" />
                    <span className="text-gray-400 text-sm">—</span>
                    <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">État</label>
                  <div className="flex flex-wrap gap-1.5">
                    {etats.map((e) => <button key={e} onClick={() => setSelectedEtat(selectedEtat === e ? "" : e)} className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${selectedEtat === e ? 'bg-orange-100 border-orange-400 text-orange-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{e}</button>)}
                  </div>
                </div>
                <div className="flex gap-2 ml-auto">
                  {hasActiveFilters && <button onClick={() => { setPriceMin(""); setPriceMax(""); setSelectedEtat("") }} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl transition-colors">Réinitialiser</button>}
                  <button onClick={handleApplyFilters} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors">Appliquer</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        {!loading && !error && ads.length > 0 && ageCleared && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500"><span className="font-semibold text-gray-800">{ads.length}</span> annonce{ads.length > 1 ? "s" : ""} affichée{ads.length > 1 ? "s" : ""}{total > ads.length ? ` sur ${total.toLocaleString("fr-CI")}` : ""}</p>
            {(categorySlug || subcategorySlug || q) && <Link href="/search" className="text-xs text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1"><X size={11} /> Effacer les filtres</Link>}
          </div>
        )}

        {!ageCleared ? (
          <div className="flex flex-col items-center justify-center py-32 text-center"><span className="text-6xl mb-4">🔞</span><p className="text-gray-400 text-sm">Vérification de l'âge en cours...</p></div>
        ) : loading ? (
          <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-3"}>
            {Array.from({ length: 10 }).map((_, i) => view === "grid" ? <AdCardSkeleton key={i} /> : <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="grid"><ErrorState message={error} /></div>
        ) : ads.length === 0 ? (
          <div className="grid"><EmptyState query={q} label={pageLabel} /></div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ads.map((ad) => <AdCard key={ad.id} ad={ad} view="grid" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">{ads.map((ad) => <AdCard key={ad.id} ad={ad} view="list" />)}</div>
        )}

        {!loading && ageCleared && total > 48 && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-6 py-4">
              <Star size={16} className="text-orange-400" />
              <p className="text-sm text-gray-500">Affichage de <span className="font-bold text-gray-800">48</span> annonces sur <span className="font-bold text-gray-800">{total.toLocaleString("fr-CI")}</span></p>
              <Star size={16} className="text-orange-400" />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function PageSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, #0F1117 0%, #1a2035 100%)" }}>
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse" />
          <div className="h-8 w-64 bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <AdCardSkeleton key={i} />)}
        </div>
      </div>
    </main>
  )
}

export default function SearchPage() {
  return <Suspense fallback={<PageSkeleton />}><SearchContent /></Suspense>
}
