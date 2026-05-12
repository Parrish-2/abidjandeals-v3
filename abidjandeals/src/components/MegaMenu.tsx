'use client'

import { AgeGate } from '@/components/AgeGate'
import { useI18n } from '@/contexts/i18nContext'
import { CATEGORIES } from '@/lib/data'
import { ArrowRight, ChevronRight, Sparkles, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SubCat {
  id: string
  nameKey: string
  badge?: 'TOP' | 'NEW' | 'PROMO' | 'URGENT'
}

export interface MegaCat {
  id: string
  labelKey: string
  icon: string
  color: string
  gradient: string
  slug: string
  subs: SubCat[]
  imageUrl: string
  descKey: string
  isAdult?: boolean
}

// â”€â”€ Age gate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STORAGE_KEY = 'abidjandeals_age_verified'
function isAgeVerified(): boolean {
  try { return sessionStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
}

// â”€â”€ Config visuelle par catÃ©gorie â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Les donnÃ©es mÃ©tier viennent de CATEGORIES (data.ts).
// Ce bloc centralise uniquement ce qui ne peut pas en venir :
// gradient, image Unsplash, clÃ© de description et badges par sous-cat.

const CAT_VISUAL: Record<string, {
  gradient: string
  imageUrl: string
  descKey: string
  subBadges?: Record<string, 'TOP' | 'NEW' | 'PROMO' | 'URGENT'>
}> = {
  cat_tech: {
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.hightech_desc',
    subBadges: { 'TÃ©lÃ©phones & Accessoires': 'TOP', 'TV & Home CinÃ©ma': 'NEW' },
  },
  cat_auto: {
    gradient: 'linear-gradient(135deg,#ef4444,#f97316)',
    imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.auto_desc',
    subBadges: { 'Motos & Scooters': 'PROMO' },
  },
  cat_immo: {
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.realestate_desc',
    subBadges: { 'Vente Maisons & Villas': 'TOP' },
  },
  cat_serv: {
    gradient: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.services_desc',
    subBadges: { 'Freelance IT & Design': 'TOP', 'Cours & Formations': 'NEW' },
  },
  cat_maison: {
    gradient: 'linear-gradient(135deg,#06b6d4,#0284c7)',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.appliances_desc',
  },
  cat_mode: {
    gradient: 'linear-gradient(135deg,#f97316,#ef4444)',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.mode_desc',
    subBadges: { 'VÃªtements & Chaussures': 'NEW' },
  },
  cat_beaute: {
    gradient: 'linear-gradient(135deg,#ec4899,#db2777)',
    imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.pharma_desc',
  },
  cat_adulte: {
    gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)',
    imageUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.lingerie_desc',
    subBadges: { 'Lingerie & Sous-vÃªtements': 'NEW' },
  },
  cat_bebe: {
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.baby_desc',
  },
  cat_epicerie: {
    gradient: 'linear-gradient(135deg,#84cc16,#65a30d)',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.grocery_desc',
    subBadges: { 'Produits locaux CI': 'NEW' },
  },
  cat_sport: {
    gradient: 'linear-gradient(135deg,#14b8a6,#0d9488)',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.sport_desc',
    subBadges: { 'Ã‰quipements de Sport': 'TOP' },
  },
}

// â”€â”€ DÃ©rivation de MEGA_CATS depuis CATEGORIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toSubCat(
  sub: string | { name: string; slug?: string },
  badges: Record<string, 'TOP' | 'NEW' | 'PROMO' | 'URGENT'> = {}
): SubCat {
  // âœ… FIX CRITIQUE : on utilise sub.slug (slug DB exact) au lieu de slugify(sub.name)
  // slugify("Voitures d'occasion") â†’ "voitures-d-occasion" (FAUX)
  // sub.slug                       â†’ "voitures-d-occasion" (VRAI, calÃ© sur la DB)
  const name = typeof sub === 'string' ? sub : sub.name
  const id = typeof sub === 'string'
    ? slugify(sub)
    : (sub.slug ?? slugify(sub.name))
  return { id, nameKey: name, badge: badges[name] }
}

export const MEGA_CATS: MegaCat[] = CATEGORIES.map(cat => {
  const visual = CAT_VISUAL[cat.id] ?? {
    gradient: `linear-gradient(135deg,${cat.color},${cat.color}cc)`,
    imageUrl: '',
    descKey: '',
  }
  return {
    id: cat.id,
    labelKey: cat.name,
    icon: cat.icon,
    color: cat.color,
    gradient: visual.gradient,
    slug: slugify(cat.name),
    imageUrl: visual.imageUrl,
    descKey: visual.descKey,
    isAdult: (cat as any).isAdult,
    subs: (cat.subcats as Array<string | { name: string; slug?: string }>).map(s => toSubCat(s, visual.subBadges)),
  }
})

// â”€â”€ Labels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CAT_LABELS: Record<string, { en: string; fr: string }> = {
  'High-Tech': { en: 'High-Tech', fr: 'High-Tech' },
  'Automobile': { en: 'Auto & Vehicles', fr: 'Automobile' },
  'Immobilier': { en: 'Real Estate', fr: 'Immobilier' },
  'Services': { en: 'Services', fr: 'Services' },
  'Maison & Ã‰quipement': { en: 'Home & Appliances', fr: 'Maison & Ã‰quipement' },
  'Mode & Accessoires': { en: 'Fashion', fr: 'Mode & Accessoires' },
  'BeautÃ© & Bien-Ãªtre': { en: 'Beauty & Wellness', fr: 'BeautÃ© & Bien-Ãªtre' },
  'Bien-Ãªtre & IntimitÃ©': { en: 'Intimacy & Wellness', fr: 'Bien-Ãªtre & IntimitÃ©' },
  'BÃ©bÃ© & Maman': { en: 'Baby & Mom', fr: 'BÃ©bÃ© & Maman' },
  'Ã‰picerie & Produits locaux': { en: 'Grocery & Local', fr: 'Ã‰picerie & Produits locaux' },
  'Sport & Loisirs': { en: 'Sport & Leisure', fr: 'Sport & Loisirs' },
  // descriptions
  'cat.hightech_desc': { en: 'Smartphones, PCs, tablets & accessories', fr: 'Smartphones, PC, tablettes & accessoires' },
  'cat.auto_desc': { en: 'Cars, motorbikes, parts & equipment', fr: 'Voitures, motos, piÃ¨ces & Ã©quipements' },
  'cat.realestate_desc': { en: 'Apartments, houses, land & offices', fr: 'Appartements, maisons, terrains & bureaux' },
  'cat.services_desc': { en: 'IT, beauty, training & construction', fr: 'Informatique, beautÃ©, formation & BTP' },
  'cat.appliances_desc': { en: 'Fridges, ACs, washing machines & more', fr: 'Ã‰lectromÃ©nager, meubles & dÃ©coration' },
  'cat.mode_desc': { en: 'Clothes, shoes, bags & jewellery', fr: 'VÃªtements, chaussures, sacs & bijoux' },
  'cat.pharma_desc': { en: 'Face care, body care & supplements', fr: 'Soins visage, corps & complÃ©ments' },
  'cat.lingerie_desc': { en: 'Intimacy & wellness â€” 18+', fr: 'Bien-Ãªtre & intimitÃ© â€” 18+' },
  'cat.baby_desc': { en: 'Clothes, toys, strollers & nutrition', fr: 'VÃªtements, jouets, poussettes & alimentation' },
  'cat.grocery_desc': { en: 'Food, drinks & local CI products', fr: 'Alimentation, boissons & produits locaux CI' },
  'cat.sport_desc': { en: 'Equipment, fitness & leisure', fr: 'Ã‰quipements, fitness & loisirs' },
}

const SUB_LABELS: Record<string, { en: string; fr: string }> = {
  'telephones-accessoires': { en: 'Phones & Accessories', fr: 'Telephones & Accessoires' },
  'ordinateurs': { en: 'Computers', fr: 'Ordinateurs' },
  'tablettes': { en: 'Tablets', fr: 'Tablettes' },
  'tv-son': { en: 'TV & Audio', fr: 'TV & Audio' },
  'photo-video-cameras': { en: 'Photo, Video & Cameras', fr: 'Photo, Video & Cameras' },
  'consoles-jeux': { en: 'Consoles & Games', fr: 'Jeux Video' },
  'objets-connectes': { en: 'Connected Devices', fr: 'Objets Connectes' },
  'composants': { en: 'Components', fr: 'Composants' },
  'voitures-d-occasion': { en: 'Used Cars', fr: "Voitures d'occasion" },
  'voitures-neuves': { en: 'New Cars', fr: 'Voitures Neuves' },
  'motos-scooters': { en: 'Motorbikes', fr: 'Motos & Scooters' },
  'pieces-pneus': { en: 'Parts & Tyres', fr: 'Pieces & Pneus' },
  'location-auto': { en: 'Car Rental', fr: 'Location Auto' },
  'camions-utilitaires': { en: 'Trucks', fr: 'Camions & Utilitaires' },
  'groupes-electrogenes': { en: 'Generators', fr: 'Groupes Electrogenes' },
  'materiel-agricole': { en: 'Agricultural Equipment', fr: 'Materiel Agricole' },
  'outillage-industriel': { en: 'Industrial Tools', fr: 'Outillage Industriel' },
  'engins-chantier': { en: 'Construction Equipment', fr: 'Engins de Chantier' },
  'vente-appartement': { en: 'Apartment Sales', fr: 'Vente Appartements' },
  'vente-maison-villa': { en: 'House Sales', fr: 'Vente Maisons & Villas' },
  'location-meublee': { en: 'Furnished Rental', fr: 'Location Meublee' },
  'location-vide': { en: 'Unfurnished Rental', fr: 'Location Vide' },
  'location-saisonniere': { en: 'Seasonal Rental', fr: 'Locations saisonnieres' },
  'colocation': { en: 'Flatsharing', fr: 'Colocation' },
  'terrains-acd': { en: 'Land with Title Deed', fr: 'Terrains avec ACD' },
  'bureaux-boutiques': { en: 'Offices & Retail', fr: 'Bureaux & Boutiques' },
  'freelance-it': { en: 'Freelance IT', fr: 'Freelance IT & Design' },
  'batiment': { en: 'Construction', fr: 'BTP & Artisanat' },
  'cours-formation': { en: 'Training', fr: 'Cours & Formations' },
  'offres-emploi': { en: 'Job Offers', fr: "Offres d'emploi" },
  'transport-livraison': { en: 'Transport & Delivery', fr: 'Transport & Livraison' },
  'menage': { en: 'Cleaning', fr: 'Menage & Nettoyage' },
  'securite': { en: 'Security', fr: 'Securite & Gardiennage' },
  'evenementiel': { en: 'Events', fr: 'Evenementiel' },
  'services-divers': { en: 'Other Services', fr: 'Services divers' },
  'meubles': { en: 'Furniture', fr: 'Meubles' },
  'electromenager': { en: 'Appliances', fr: 'Electromenager' },
  'decoration': { en: 'Decoration', fr: 'Decoration' },
  'jardin-bricolage': { en: 'Garden & DIY', fr: 'Jardin & Bricolage' },
  'autres-equipements': { en: 'Other Equipment', fr: 'Autres equipements' },
  'vetements-femme': { en: 'Women Clothing', fr: 'Vetements femme' },
  'vetements-homme': { en: 'Men Clothing', fr: 'Vetements homme' },
  'chaussures': { en: 'Shoes', fr: 'Chaussures' },
  'sacs-accessoires': { en: 'Bags & Accessories', fr: 'Sacs & Accessoires' },
  'montres-bijoux': { en: 'Watches & Jewellery', fr: 'Montres & Bijoux' },
  'cosmetiques': { en: 'Cosmetics', fr: 'Cosmetiques' },
  'parfums': { en: 'Perfumes', fr: 'Parfums' },
  'soins-corps': { en: 'Body Care', fr: 'Soins du corps' },
  'coiffure-cheveux': { en: 'Hair Care', fr: 'Coiffure & Cheveux' },
  'complements-alimentaires': { en: 'Food Supplements', fr: 'Complements alimentaires' },
  'vetements-bebe': { en: 'Baby Clothes', fr: 'Vetements bebe' },
  'chaussures-bebe': { en: 'Baby Shoes', fr: 'Chaussures bebe' },
  'jouets-eveil': { en: 'Toys & Development', fr: 'Jouets & Eveil' },
  'accessoires-bebe': { en: 'Baby Accessories', fr: 'Accessoires bebe' },
  'articles-maman': { en: 'Mom Items', fr: 'Articles pour maman' },
  'produits-alimentaires': { en: 'Food Products', fr: 'Produits alimentaires' },
  'boissons': { en: 'Drinks', fr: 'Boissons' },
  'produits-locaux': { en: 'Local Products', fr: 'Produits locaux' },
  'equipements-sportifs': { en: 'Sports Equipment', fr: 'Equipements sportifs' },
  'fitness-musculation': { en: 'Fitness', fr: 'Fitness & Musculation' },
  'jeux-loisirs': { en: 'Games & Leisure', fr: 'Jeux & Loisirs' },
  'bien-etre-couple': { en: 'Couple Wellness', fr: 'Bien-etre du couple' },
  'lubrifiants-gels': { en: 'Lubricants & Gels', fr: 'Lubrifiants & Gels intimes' },
  'hygiene-intime': { en: 'Intimate Hygiene', fr: 'Hygiene intime' },
  'accessoires-massage': { en: 'Massage Accessories', fr: 'Accessoires de massage' },
  'accessoires-adultes': { en: 'Adult Accessories', fr: 'Accessoires pour adultes' },
}

function getLabel(key: string, locale: string): string {
  const map = { ...CAT_LABELS, ...SUB_LABELS }
  return map[key]?.[locale as 'en' | 'fr'] ?? key
}

// â”€â”€ Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BADGE_CFG = {
  TOP: { bg: 'rgba(249,115,22,0.10)', color: '#ea580c', border: 'rgba(249,115,22,0.25)' },
  NEW: { bg: 'rgba(16,185,129,0.10)', color: '#059669', border: 'rgba(16,185,129,0.25)' },
  PROMO: { bg: 'rgba(99,102,241,0.10)', color: '#6366f1', border: 'rgba(99,102,241,0.25)' },
  URGENT: { bg: 'rgba(239,68,68,0.10)', color: '#dc2626', border: 'rgba(239,68,68,0.25)' },
} as const

function Badge({ type }: { type: keyof typeof BADGE_CFG }) {
  const s = BADGE_CFG[type]
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 9, fontWeight: 700,
      padding: '2px 6px', borderRadius: 20,
      letterSpacing: '0.05em', lineHeight: 1, flexShrink: 0,
      textTransform: 'uppercase',
    }}>
      {type}
    </span>
  )
}

// â”€â”€ MegaPanelPortal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface MegaPanelPortalProps {
  cat: MegaCat
  locale: string
  navbarRef: React.RefObject<HTMLDivElement>
  onNavigate: (url: string, catId: string) => void
  onClose: () => void
}

function MegaPanelPortal({ cat, locale, navbarRef, onNavigate, onClose }: MegaPanelPortalProps) {
  const [top, setTop] = useState(0)
  const [imgError, setImgError] = useState(false)

  const label = getLabel(cat.labelKey, locale)
  const desc = getLabel(cat.descKey, locale)
  const seeAllBtn = locale === 'en' ? 'See all' : 'Voir tout'
  const seeAllLabel = locale === 'en' ? `See all in ${label}` : `Voir tout en ${label}`
  const subcatTitle = locale === 'en' ? 'Subcategories' : 'Sous-catÃ©gories'
  const trendLabel = locale === 'en' ? 'Trending' : 'Tendance'
  const catsLabel = locale === 'en'
    ? `${cat.subs.length} categories`
    : `${cat.subs.length} catÃ©gories`

  const calc = useCallback(() => {
    if (!navbarRef.current) return
    const r = navbarRef.current.getBoundingClientRect()
    setTop(r.bottom + window.scrollY)
  }, [navbarRef])

  useEffect(() => {
    calc()
    window.addEventListener('resize', calc, { passive: true })
    window.addEventListener('scroll', calc, { passive: true })
    return () => {
      window.removeEventListener('resize', calc)
      window.removeEventListener('scroll', calc)
    }
  }, [calc])

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      {/* Overlay */}
      <div
        data-megamenu-overlay
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(15,17,23,0.08)',
          animation: 'mmFadeIn 0.18s ease',
          cursor: 'default',
        }}
      />

      {/* Panel */}
      <div
        data-megamenu-panel
        style={{
          position: 'absolute',
          top,
          left: 0, right: 0,
          zIndex: 9999,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
          animation: 'mmSlideDown 0.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Barre couleur catÃ©gorie */}
        <div style={{ height: 3, background: cat.gradient }} />

        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '16px 24px 20px',
          display: 'grid',
          gridTemplateColumns: '200px 1px 1fr',
          gap: 20,
          alignItems: 'start',
        }}>

          {/* Gauche : carte catÃ©gorie */}
          <div>
            <button
              onClick={() => onNavigate(`/search?category=${cat.id}`, cat.id)}
              style={{
                display: 'flex', flexDirection: 'column',
                borderRadius: 12, overflow: 'hidden',
                border: `1px solid ${cat.color}25`,
                cursor: 'pointer', width: '100%',
                textAlign: 'left', background: 'none', padding: 0,
                boxShadow: `0 4px 16px ${cat.color}20`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = `0 10px 28px ${cat.color}35`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = `0 4px 16px ${cat.color}20`
              }}
            >
              {/* Image */}
              <div style={{ height: 100, overflow: 'hidden', position: 'relative', background: `${cat.color}12` }}>
                {!imgError ? (
                  <img
                    src={cat.imageUrl} alt={label}
                    onError={() => setImgError(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                    {cat.icon}
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                <span style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 22 }}>{cat.icon}</span>
                <span style={{ position: 'absolute', bottom: 10, left: 38, fontSize: 12, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {label}
                </span>
                {cat.isAdult && (
                  <span style={{ position: 'absolute', top: 6, right: 6, background: '#f43f5e', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20 }}>
                    ðŸ”ž 18+
                  </span>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: '10px 12px 12px', background: '#fafafa', borderTop: `2px solid ${cat.color}20` }}>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 8px', lineHeight: 1.4 }}>{desc}</p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, color: '#fff', fontWeight: 700,
                  background: cat.gradient,
                  padding: '5px 10px', borderRadius: 20,
                  boxShadow: `0 3px 10px ${cat.color}40`,
                }}>
                  {seeAllBtn} <ArrowRight size={10} />
                </span>
              </div>
            </button>

            {/* Stats row */}
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div style={{
                padding: '8px 10px', borderRadius: 10,
                background: '#f8fafc', border: '1px solid #f1f5f9',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 16, margin: '0 0 2px' }}>ðŸ”¥</p>
                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>{catsLabel}</p>
              </div>
              <div style={{
                padding: '8px 10px', borderRadius: 10,
                background: `${cat.color}0d`,
                border: `1px solid ${cat.color}25`,
                textAlign: 'center',
              }}>
                <TrendingUp size={14} style={{ color: cat.color, margin: '0 auto 2px', display: 'block' }} />
                <p style={{ fontSize: 10, color: cat.color, margin: 0, fontWeight: 700 }}>{trendLabel}</p>
              </div>
            </div>
          </div>

          {/* SÃ©parateur vertical */}
          <div style={{ alignSelf: 'stretch', background: '#f1f5f9' }} />

          {/* Droite : sous-catÃ©gories */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: cat.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={12} color="#fff" />
              </div>
              <p style={{
                fontSize: 10, fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.10em', margin: 0,
              }}>
                {subcatTitle}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '2px 4px' }}>
              {cat.subs.map(sub => {
                const subLabel = getLabel(sub.nameKey, locale)
                return (
                  <button
                    key={sub.id}
                    onClick={() => onNavigate(`/search?category=${cat.id}&sub=${sub.id}`, cat.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 8, padding: '9px 10px', borderRadius: 9,
                      background: 'transparent', border: '1px solid transparent',
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = '#f8fafc'
                      el.style.borderColor = '#e2e8f0'
                      el.style.transform = 'translateX(3px)'
                      const lbl = el.querySelector<HTMLElement>('.sub-lbl')
                      if (lbl) { lbl.style.color = '#1e293b'; lbl.style.fontWeight = '500' }
                      const chev = el.querySelector<HTMLElement>('.sub-chev')
                      if (chev) { chev.style.color = cat.color }
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'transparent'
                      el.style.borderColor = 'transparent'
                      el.style.transform = 'translateX(0)'
                      const lbl = el.querySelector<HTMLElement>('.sub-lbl')
                      if (lbl) { lbl.style.color = '#475569'; lbl.style.fontWeight = '400' }
                      const chev = el.querySelector<HTMLElement>('.sub-chev')
                      if (chev) { chev.style.color = '#d1d5db' }
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, flex: 1 }}>
                      <ChevronRight
                        size={10}
                        className="sub-chev"
                        style={{ color: '#d1d5db', flexShrink: 0, transition: 'color 0.12s' }}
                      />
                      <span className="sub-lbl" style={{
                        fontSize: 13, color: '#475569', fontWeight: 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        transition: 'color 0.12s, font-weight 0.12s',
                      }}>
                        {subLabel}
                      </span>
                    </span>
                    {sub.badge && <Badge type={sub.badge} />}
                  </button>
                )
              })}
            </div>

            {/* Bouton voir tout */}
            <div style={{
              marginTop: 14, paddingTop: 14,
              borderTop: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <button
                onClick={() => onNavigate(`/search?category=${cat.id}`, cat.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 9,
                  background: cat.gradient,
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  boxShadow: `0 4px 14px ${cat.color}40`,
                  transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-2px) scale(1.02)'
                  el.style.boxShadow = `0 8px 24px ${cat.color}55`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(0) scale(1)'
                  el.style.boxShadow = `0 4px 14px ${cat.color}40`
                }}
              >
                <ArrowRight size={13} />
                {seeAllLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mmFadeIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes mmSlideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </>,
    document.body
  )
}

// â”€â”€ MegaMenu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface MegaMenuProps {
  activeCategoryId: string | null
  onCategoryClick: (catId: string) => void
}

export function MegaMenu({ activeCategoryId, onCategoryClick }: MegaMenuProps) {
  const router = useRouter()
  const { locale } = useI18n()

  const [openId, setOpenId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const [showAgeGate, setShowAgeGate] = useState(false)
  const [pendingUrl, setPendingUrl] = useState('')
  const [pendingCatId, setPendingCatId] = useState('')

  const navbarRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll, { passive: true })
    return () => window.removeEventListener('resize', checkScroll)
  }, [checkScroll])

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
    setTimeout(checkScroll, 350)
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        !navbarRef.current?.contains(target) &&
        !target.closest('[data-megamenu-panel]') &&
        !target.closest('[data-megamenu-overlay]')
      ) {
        setOpenId(null)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null) }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])

  function handleTabClick(cat: MegaCat) {
    if (cat.isAdult && !isAgeVerified()) {
      setPendingUrl(`/search?category=${cat.id}`)
      setPendingCatId(cat.id)
      setOpenId(null)
      setShowAgeGate(true)
      return
    }

    if (!cat.subs.length) {
      setOpenId(null)
      onCategoryClick(cat.id)
      router.push(`/search?category=${cat.id}`)
    } else {
      setOpenId(prev => prev === cat.id ? null : cat.id)
    }
  }

  function handleNavigate(url: string, catId: string) {
    setOpenId(null)
    onCategoryClick(catId)
    router.push(url)
  }

  const openCat = MEGA_CATS.find(c => c.id === openId) ?? null

  return (
    <>
      {mounted && showAgeGate && (
        <AgeGate
          onConfirm={() => {
            setShowAgeGate(false)
            onCategoryClick(pendingCatId)
            router.push(pendingUrl)
          }}
          onRefuse={() => { setShowAgeGate(false); setPendingUrl(''); setPendingCatId('') }}
        />
      )}

      <style>{`
        .mm-tab {
          position: relative; display: flex; align-items: center; gap: 5px;
          padding: 0 11px; height: 40px;
          font-size: 12.5px; font-weight: 500;
          color: rgba(255,255,255,0.55);
          white-space: nowrap; background: transparent; border: none;
          border-bottom: 2.5px solid transparent;
          cursor: pointer; flex-shrink: 0;
          transition: color .15s, background .15s, border-color .15s;
          z-index: 1;
        }
        .mm-tab:hover     { color: #ffffff; background: rgba(255,255,255,0.07); }
        .mm-tab.is-open   { color: #F97316; background: rgba(249,115,22,0.08); border-bottom-color: #F97316; font-weight: 700; }
        .mm-chev          { width: 10px; height: 10px; color: rgba(255,255,255,0.25); margin-left: 1px; transition: transform .2s, color .15s; }
        .mm-tab.is-open .mm-chev { transform: rotate(180deg); color: #F97316; }
        .mm-dot           { position: absolute; top: 7px; right: 6px; width: 5px; height: 5px; border-radius: 50%; animation: mmPulse 2s ease-in-out infinite; }
        .mm-adult-badge   { font-size: 9px; font-weight: 800; background: #f43f5e; color: #fff; padding: 2px 5px; border-radius: 10px; margin-left: 3px; }
        @keyframes mmPulse { 0%, 100% { opacity:1; transform:scale(1) } 50% { opacity:.5; transform:scale(.7) } }
      `}</style>

      <div
        ref={navbarRef}
        style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}
      >
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label="DÃ©filer Ã  gauche"
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 10,
              width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(to right, #0F1117 60%, transparent)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <nav
          ref={scrollRef}
          aria-label="CatÃ©gories"
          onScroll={checkScroll}
          style={{
            display: 'flex', alignItems: 'stretch',
            overflowX: 'auto', scrollbarWidth: 'none',
            msOverflowStyle: 'none', flex: 1,
            scrollBehavior: 'smooth',
            paddingLeft: canScrollLeft ? 36 : 0,
            paddingRight: canScrollRight ? 36 : 0,
          }}
        >
          {MEGA_CATS.map(cat => {
            const isOpen = cat.id === openId
            const hasSubs = cat.subs.length > 0
            const label = getLabel(cat.labelKey, locale)
            const hasNew = cat.subs.some(s => s.badge === 'NEW')

            return (
              <button
                key={cat.id}
                className={`mm-tab${isOpen ? ' is-open' : ''}`}
                onClick={() => handleTabClick(cat)}
                aria-expanded={isOpen}
                aria-haspopup={hasSubs ? 'true' : undefined}
              >
                {hasNew && <span className="mm-dot" style={{ background: cat.color }} />}
                <span style={{
                  fontSize: 15, lineHeight: 1,
                  transition: 'transform 0.15s',
                  transform: isOpen ? 'scale(1.15)' : 'scale(1)',
                }}>
                  {cat.icon}
                </span>
                {label}
                {cat.isAdult && <span className="mm-adult-badge">18+</span>}
                {hasSubs && (
                  <svg className="mm-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>
            )
          })}
        </nav>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label="DÃ©filer Ã  droite"
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 10,
              width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(to left, #0F1117 60%, transparent)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {mounted && openId && openCat && (
        <MegaPanelPortal
          cat={openCat}
          locale={locale}
          navbarRef={navbarRef}
          onNavigate={handleNavigate}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  )
}


