'use client'

import { AgeGate } from '@/components/AgeGate'
import { useI18n } from '@/contexts/i18nContext'
import { ArrowRight, ChevronRight, Sparkles, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

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

const STORAGE_KEY = 'abidjandeals_age_verified'
function isAgeVerified(): boolean {
  try { return sessionStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
}

export const MEGA_CATS: MegaCat[] = [
  {
    id: 'hightech', labelKey: 'cat.hightech', icon: '📱',
    color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    slug: 'hightech',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.hightech_desc',
    subs: [
      { id: 'smartphones', nameKey: 'sub.phones', badge: 'TOP' },
      { id: 'ordinateurs', nameKey: 'sub.computers' },
      { id: 'tv-son', nameKey: 'sub.tv', badge: 'NEW' },
      { id: 'consoles-jeux', nameKey: 'sub.gaming' },
      { id: 'photo-video', nameKey: 'sub.photo' },
      { id: 'objets-connectes', nameKey: 'sub.iot' },
    ],
  },
  {
    id: 'auto', labelKey: 'cat.auto', icon: '🚗',
    color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f97316)',
    slug: 'auto',
    imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.auto_desc',
    subs: [
      { id: 'voitures-occasion', nameKey: 'sub.cars', badge: 'TOP' },
      { id: 'camions-utilitaires', nameKey: 'sub.trucks' },
      { id: 'pieces-pneus', nameKey: 'sub.parts', badge: 'PROMO' },
      { id: 'motos-scooters', nameKey: 'sub.motos' },
      { id: 'engins-chantier', nameKey: 'sub.boats' },
      { id: 'outillage-industriel', nameKey: 'sub.industry' },
    ],
  },
  {
    id: 'immobilier', labelKey: 'cat.realestate', icon: '🏠',
    color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)',
    slug: 'immobilier',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.realestate_desc',
    subs: [
      { id: 'vente-appartement', nameKey: 'sub.apartments' },
      { id: 'vente-maison-villa', nameKey: 'sub.houses', badge: 'TOP' },
      { id: 'terrains', nameKey: 'sub.land' },
      { id: 'bureaux-boutiques', nameKey: 'sub.offices' },
      { id: 'location-meublee', nameKey: 'sub.rentals' },
    ],
  },
  {
    id: 'location', labelKey: 'cat.rental', icon: '🔑',
    color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
    slug: 'location',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.rental_desc',
    subs: [
      { id: 'location-auto', nameKey: 'sub.car_rental' },
      { id: 'camions-utilitaires', nameKey: 'sub.bus_rental' },
      { id: 'residences-meublees', nameKey: 'sub.halls', badge: 'PROMO' },
      { id: 'location-vide', nameKey: 'sub.tents' },
      { id: 'colocation', nameKey: 'sub.sound' },
      { id: 'bureaux-boutiques', nameKey: 'sub.event_eq' },
    ],
  },
  {
    id: 'services', labelKey: 'cat.services', icon: '🔧',
    color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
    slug: 'services',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.services_desc',
    subs: [
      { id: 'freelance-it', nameKey: 'sub.it', badge: 'TOP' },
      { id: 'cosmetiques', nameKey: 'sub.beauty' },
      { id: 'cours-formation', nameKey: 'sub.training', badge: 'NEW' },
      { id: 'batiment', nameKey: 'sub.btp' },
      { id: 'offres-emploi', nameKey: 'sub.delivery' },
      { id: 'equipements-sport', nameKey: 'sub.health' },
    ],
  },
  {
    id: 'electromenager', labelKey: 'cat.appliances', icon: '📺',
    color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#0284c7)',
    slug: 'electromenager',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.appliances_desc',
    subs: [
      { id: 'electromenager', nameKey: 'sub.fridge' },
      { id: 'decoration', nameKey: 'sub.ac', badge: 'TOP' },
      { id: 'meubles', nameKey: 'sub.washer' },
      { id: 'jardin-bricolage', nameKey: 'sub.stove' },
    ],
  },
  {
    id: 'bebe', labelKey: 'cat.baby', icon: '👶',
    color: '#ec4899', gradient: 'linear-gradient(135deg,#ec4899,#db2777)',
    slug: 'bebe',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.baby_desc',
    subs: [
      { id: 'vetements', nameKey: 'sub.baby_clothes' },
      { id: 'chaussures', nameKey: 'sub.strollers' },
      { id: 'jouets', nameKey: 'sub.toys' },
      { id: 'inclassables', nameKey: 'sub.baby_food' },
    ],
  },
  {
    id: 'pharma', labelKey: 'cat.pharma', icon: '💊',
    color: '#14b8a6', gradient: 'linear-gradient(135deg,#14b8a6,#0d9488)',
    slug: 'pharma',
    imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.pharma_desc',
    subs: [
      { id: 'cosmetiques', nameKey: 'sub.face_care' },
      { id: 'sacs-accessoires', nameKey: 'sub.body_care' },
      { id: 'montres', nameKey: 'sub.supplements' },
      { id: 'collection', nameKey: 'sub.hygiene' },
    ],
  },
  {
    id: 'epicerie', labelKey: 'cat.grocery', icon: '🛒',
    color: '#f97316', gradient: 'linear-gradient(135deg,#f97316,#ef4444)',
    slug: 'epicerie',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.grocery_desc',
    subs: [
      { id: 'inclassables', nameKey: 'sub.dry_food' },
      { id: 'collection', nameKey: 'sub.drinks' },
      { id: 'voyages', nameKey: 'sub.local_ci', badge: 'NEW' },
    ],
  },
  {
    id: 'lingerie', labelKey: 'cat.lingerie', icon: '👙',
    color: '#f43f5e', gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)',
    slug: 'lingerie',
    imageUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&q=80&auto=format&fit=crop',
    descKey: 'cat.lingerie_desc',
    isAdult: true,
    subs: [
      { id: 'lingerie-sous-vetements', nameKey: 'sub.lingerie', badge: 'NEW' },
      { id: 'maillots-de-bain', nameKey: 'sub.swimwear' },
      { id: 'cosmetiques-bien-etre', nameKey: 'sub.wellness' },
      { id: 'accessoires-mode', nameKey: 'sub.accessories' },
    ],
  },
]

// ── Labels ───────────────────────────────────────────────────────────────────

const CAT_LABELS: Record<string, { en: string; fr: string }> = {
  'cat.hightech': { en: 'High-Tech', fr: 'High-Tech' },
  'cat.auto': { en: 'Auto & Industry', fr: 'Automobile & Industrie' },
  'cat.realestate': { en: 'Real Estate', fr: 'Immobilier' },
  'cat.rental': { en: 'Rental & Mobility', fr: 'Location & Mobilité' },
  'cat.services': { en: 'Services & Other', fr: 'Services & Autres' },
  'cat.appliances': { en: 'Appliances', fr: 'Électroménager' },
  'cat.baby': { en: 'Baby & Mom', fr: 'Bébé & Mamans' },
  'cat.pharma': { en: 'Parapharmacy', fr: 'Parapharmacie' },
  'cat.grocery': { en: 'Grocery & Drinks', fr: 'Épicerie & Boissons' },
  'cat.lingerie': { en: 'Lingerie & Accessories', fr: 'Lingerie & Accessoires' },
  'cat.hightech_desc': { en: 'Smartphones, PCs, tablets & accessories', fr: 'Smartphones, PC, tablettes & accessoires' },
  'cat.auto_desc': { en: 'Cars, motorbikes, parts & equipment', fr: 'Voitures, motos, pièces & équipements' },
  'cat.realestate_desc': { en: 'Apartments, houses, land & offices', fr: 'Appartements, maisons, terrains & bureaux' },
  'cat.rental_desc': { en: 'Car hire, halls & event equipment', fr: 'Location voitures, salles & matériel' },
  'cat.services_desc': { en: 'IT, beauty, training & construction', fr: 'Informatique, beauté, formation & BTP' },
  'cat.appliances_desc': { en: 'Fridges, ACs, washing machines & more', fr: 'Frigos, climatiseurs, machines à laver & plus' },
  'cat.baby_desc': { en: 'Clothes, toys, strollers & nutrition', fr: 'Vêtements, jouets, poussettes & alimentation' },
  'cat.pharma_desc': { en: 'Face care, body care & supplements', fr: 'Soins visage, corps & compléments' },
  'cat.grocery_desc': { en: 'Food, drinks & local CI products', fr: 'Alimentation, boissons & produits locaux CI' },
  'cat.lingerie_desc': { en: 'Lingerie, swimwear & wellness — 18+', fr: 'Lingerie, maillots & bien-être — 18+' },
}

const SUB_LABELS: Record<string, { en: string; fr: string }> = {
  'sub.phones': { en: 'Phones & Accessories', fr: 'Téléphones & Accessoires' },
  'sub.computers': { en: 'Computers & Tablets', fr: 'Ordinateurs & Tablettes' },
  'sub.tv': { en: 'TV & Audio', fr: 'TV & Audio' },
  'sub.gaming': { en: 'Video Games', fr: 'Jeux vidéo' },
  'sub.photo': { en: 'Photo & Video', fr: 'Photo & Vidéo' },
  'sub.iot': { en: 'Connected Devices', fr: 'Objets connectés' },
  'sub.cars': { en: 'Cars', fr: 'Voitures' },
  'sub.trucks': { en: 'Trucks & Vans', fr: 'Camions & Utilitaires' },
  'sub.parts': { en: 'Parts & Accessories', fr: 'Pièces & Accessoires' },
  'sub.motos': { en: 'Motorbikes', fr: 'Motos' },
  'sub.boats': { en: 'Construction Equipment', fr: 'Engins de Chantier' },
  'sub.industry': { en: 'Industrial Equipment', fr: 'Équipement industriel' },
  'sub.apartments': { en: 'Apartments for Sale', fr: 'Appartements à vendre' },
  'sub.houses': { en: 'Houses for Sale', fr: 'Maisons à vendre' },
  'sub.land': { en: 'Land & Plots', fr: 'Terrains' },
  'sub.offices': { en: 'Offices & Shops', fr: 'Bureaux commerciaux' },
  'sub.rentals': { en: 'Furnished Rentals', fr: 'Locations meublées' },
  'sub.car_rental': { en: 'Car Hire', fr: 'Location voitures' },
  'sub.bus_rental': { en: 'Trucks & Vans', fr: 'Camions & Utilitaires' },
  'sub.halls': { en: 'Furnished Residences', fr: 'Résidences meublées' },
  'sub.tents': { en: 'Unfurnished Rentals', fr: 'Location vide' },
  'sub.sound': { en: 'Colocation', fr: 'Colocation' },
  'sub.event_eq': { en: 'Offices & Shops', fr: 'Bureaux & Boutiques' },
  'sub.it': { en: 'IT & Tech', fr: 'Freelance IT/Design' },
  'sub.beauty': { en: 'Beauty & Wellness', fr: 'Cosmétiques & Parfums' },
  'sub.training': { en: 'Courses & Training', fr: 'Cours & Formation' },
  'sub.btp': { en: 'Construction & Trades', fr: 'Bâtiment & BTP' },
  'sub.delivery': { en: 'Job Offers', fr: "Offres d'emploi" },
  'sub.health': { en: 'Sport Equipment', fr: 'Équipements sport' },
  'sub.fridge': { en: 'Appliances', fr: 'Électroménager' },
  'sub.ac': { en: 'Decoration', fr: 'Décoration' },
  'sub.washer': { en: 'Furniture', fr: 'Meubles' },
  'sub.stove': { en: 'Garden & DIY', fr: 'Jardin & Bricolage' },
  'sub.baby_clothes': { en: 'Clothing', fr: 'Vêtements' },
  'sub.strollers': { en: 'Shoes', fr: 'Chaussures' },
  'sub.toys': { en: 'Toys', fr: 'Jouets' },
  'sub.baby_food': { en: 'Various', fr: 'Inclassables' },
  'sub.face_care': { en: 'Cosmetics', fr: 'Cosmétiques & Parfums' },
  'sub.body_care': { en: 'Bags & Accessories', fr: 'Sacs & Accessoires' },
  'sub.supplements': { en: 'Watches', fr: 'Montres' },
  'sub.hygiene': { en: 'Collectibles', fr: 'Objets de collection' },
  'sub.dry_food': { en: 'Various', fr: 'Inclassables' },
  'sub.drinks': { en: 'Collectibles', fr: 'Objets de collection' },
  'sub.local_ci': { en: 'Travel', fr: 'Voyages' },
  'sub.lingerie': { en: 'Lingerie & Underwear', fr: 'Lingerie & Sous-vêtements' },
  'sub.swimwear': { en: 'Swimwear', fr: 'Maillots de bain' },
  'sub.wellness': { en: 'Cosmetics & Wellness', fr: 'Cosmétiques & Bien-être' },
  'sub.accessories': { en: 'Fashion Accessories', fr: 'Accessoires de mode' },
}

function getLabel(key: string, locale: string): string {
  const map = { ...CAT_LABELS, ...SUB_LABELS }
  return map[key]?.[locale as 'en' | 'fr'] ?? key
}

// ── Badge ────────────────────────────────────────────────────────────────────

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

// ── MegaPanelPortal ──────────────────────────────────────────────────────────

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
  const subcatTitle = locale === 'en' ? 'Subcategories' : 'Sous-catégories'
  const trendLabel = locale === 'en' ? 'Trending' : 'Tendance'
  const catsLabel = locale === 'en'
    ? `${cat.subs.length} categories`
    : `${cat.subs.length} catégories`

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
        {/* Barre couleur catégorie */}
        <div style={{ height: 3, background: cat.gradient }} />

        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '16px 24px 20px',
          display: 'grid',
          gridTemplateColumns: '200px 1px 1fr',
          gap: 20,
          alignItems: 'start',
        }}>

          {/* Gauche : carte catégorie */}
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
                    🔞 18+
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
                <p style={{ fontSize: 16, margin: '0 0 2px' }}>🔥</p>
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

          {/* Séparateur vertical */}
          <div style={{ alignSelf: 'stretch', background: '#f1f5f9' }} />

          {/* Droite : sous-catégories */}
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

// ── MegaMenu ─────────────────────────────────────────────────────────────────

interface MegaMenuProps {
  activeCategoryId: string | null
  onCategoryClick: (catId: string) => void
}

export function MegaMenu({ activeCategoryId, onCategoryClick }: MegaMenuProps) {
  const router = useRouter()
  const { locale } = useI18n()

  // ✅ FIX : openId gère UNIQUEMENT l'état visuel du menu ouvert
  // activeCategoryId (store) n'influe plus sur is-active dans la barre
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

  // Fermeture au clic en dehors
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

  // Fermeture avec Échap
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null) }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])

  // Clic sur un onglet
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
      // Toggle : ouvert → fermer, fermé → ouvrir
      setOpenId(prev => prev === cat.id ? null : cat.id)
    }
  }

  // Navigation depuis le panel (sous-cat ou "voir tout")
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
        {/* Flèche gauche */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label="Défiler à gauche"
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

        {/* Carrousel scrollable */}
        <nav
          ref={scrollRef}
          aria-label="Catégories"
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
            // ✅ FIX PRINCIPAL : is-open seul détermine le style actif
            // is-active (lié au store) supprimé — évite que High-Tech reste
            // visuellement actif après navigation vers une autre catégorie
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

        {/* Flèche droite */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label="Défiler à droite"
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

      {/* Panel mega menu */}
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