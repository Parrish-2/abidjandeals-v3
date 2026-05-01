'use client'

import { supabase } from '@/lib/supabase'
import { AlertTriangle, CheckCircle2, Eye, LogOut, PlusCircle, RefreshCw, Search, Shield, Trash2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id?: string
  prenom: string
  nom: string
  email?: string
  phone?: string
}

interface Ad {
  id: string
  title: string
  description: string
  price: number
  city: string
  category: string
  images: string[]
  status: string
  created_at: string
  user_id: string
  profiles: Profile | Profile[] | null
}

function getProfile(ad: Ad): Profile | null {
  if (!ad.profiles) return null
  if (Array.isArray(ad.profiles)) return ad.profiles[0] ?? null
  return ad.profiles
}

function fmtPrice(n: number) {
  return new Intl.NumberFormat('fr-CI').format(n) + ' FCFA'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── Champs dynamiques par catégorie ─────────────────────────────────────────

type FieldType = 'text' | 'number' | 'select' | 'radio'

interface CategoryField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: string[]
  required?: boolean
}

const CATEGORY_FIELDS: Record<string, CategoryField[]> = {
  auto: [
    { key: 'marque', label: 'Marque', type: 'select', options: ['Toyota', 'Hyundai', 'Kia', 'Mercedes', 'BMW', 'Audi', 'Peugeot', 'Renault', 'Ford', 'Mitsubishi', 'Nissan', 'Honda', 'Suzuki', 'Land Rover', 'Isuzu', 'Autre'], required: true },
    { key: 'modele', label: 'Modèle', type: 'text', placeholder: 'Ex: Corolla, RAV4...', required: true },
    { key: 'annee', label: 'Année', type: 'number', placeholder: 'Ex: 2020', required: true },
    { key: 'kilometrage', label: 'Kilométrage (km)', type: 'number', placeholder: 'Ex: 45000' },
    { key: 'carburant', label: 'Carburant', type: 'select', options: ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'] },
    { key: 'transmission', label: 'Transmission', type: 'radio', options: ['Automatique', 'Manuelle'] },
    { key: 'couleur', label: 'Couleur', type: 'text', placeholder: 'Ex: Blanc, Noir...' },
    { key: 'nb_portes', label: 'Nombre de portes', type: 'select', options: ['2', '3', '4', '5'] },
    { key: 'etat', label: 'État', type: 'radio', options: ['Neuf', 'Très bon état', 'Bon état', 'État correct'], required: true },
  ],
  immobilier: [
    { key: 'type_bien', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison/Villa', 'Terrain', 'Bureau/Commerce', 'Studio', 'Duplex'], required: true },
    { key: 'transaction', label: 'Transaction', type: 'radio', options: ['Vente', 'Location'], required: true },
    { key: 'surface', label: 'Surface (m²)', type: 'number', placeholder: 'Ex: 120', required: true },
    { key: 'nb_pieces', label: 'Nombre de pièces', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7+'] },
    { key: 'nb_chambres', label: 'Chambres', type: 'select', options: ['1', '2', '3', '4', '5+'] },
    { key: 'nb_sdb', label: 'Salles de bain', type: 'select', options: ['1', '2', '3+'] },
    { key: 'etage', label: 'Étage', type: 'text', placeholder: 'Ex: RDC, 2ème...' },
    { key: 'meuble', label: 'Meublé', type: 'radio', options: ['Oui', 'Non', 'Partiellement'] },
    { key: 'parking', label: 'Parking', type: 'radio', options: ['Oui', 'Non'] },
    { key: 'gardien', label: 'Gardien', type: 'radio', options: ['Oui', 'Non'] },
  ],
  location: [
    { key: 'type_location', label: 'Type', type: 'select', options: ['Voiture', '4x4/SUV', 'Bus/Minibus', 'Camion', 'Salle de fête', 'Chapiteau', 'Sono & lumières', 'Matériel événementiel'], required: true },
    { key: 'duree_min', label: 'Durée minimum', type: 'select', options: ['1 jour', '1 semaine', '1 mois', 'Flexible'] },
    { key: 'caution', label: 'Caution requise', type: 'radio', options: ['Oui', 'Non'] },
    { key: 'chauffeur', label: 'Avec chauffeur', type: 'radio', options: ['Oui', 'Non', 'Optionnel'] },
    { key: 'capacite', label: 'Capacité', type: 'text', placeholder: 'Ex: 300 personnes, 5 places...' },
    { key: 'disponibilite', label: 'Disponibilité', type: 'text', placeholder: 'Ex: Du lundi au samedi...' },
  ],
  hightech: [
    { key: 'marque', label: 'Marque', type: 'select', options: ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Oppo', 'Tecno', 'Infinix', 'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Sony', 'LG', 'Autre'], required: true },
    { key: 'modele', label: 'Modèle', type: 'text', placeholder: 'Ex: iPhone 15, Galaxy S24...', required: true },
    { key: 'etat', label: 'État', type: 'radio', options: ['Neuf', 'Très bon état', 'Bon état', 'État correct'], required: true },
    { key: 'stockage', label: 'Stockage', type: 'select', options: ['16Go', '32Go', '64Go', '128Go', '256Go', '512Go', '1To', '2To'] },
    { key: 'ram', label: 'RAM', type: 'select', options: ['2Go', '4Go', '6Go', '8Go', '12Go', '16Go', '32Go', '64Go'] },
    { key: 'couleur', label: 'Couleur', type: 'text', placeholder: 'Ex: Blanc, Noir, Titanium...' },
    { key: 'batterie', label: 'Autonomie batterie', type: 'text', placeholder: 'Ex: 80%, toute la journée...' },
    { key: 'accessoires', label: 'Accessoires inclus', type: 'text', placeholder: 'Ex: Chargeur, coque, écouteurs...' },
  ],
  electromenager: [
    { key: 'type_appareil', label: "Type d'appareil", type: 'select', options: ['Réfrigérateur', 'Congélateur', 'Climatiseur', 'Machine à laver', 'Cuisinière', 'Micro-ondes', 'Téléviseur', 'Lave-vaisselle', 'Fer à repasser', 'Autre'], required: true },
    { key: 'marque', label: 'Marque', type: 'select', options: ['Samsung', 'LG', 'Bosch', 'Midea', 'Hisense', 'Haier', 'Whirlpool', 'Electrolux', 'Siemens', 'Panasonic', 'Autre'] },
    { key: 'capacite', label: 'Capacité / Taille', type: 'text', placeholder: 'Ex: 350L, 55 pouces, 1.5CV...' },
    { key: 'energie', label: 'Classe énergie', type: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'Non précisé'] },
    { key: 'etat', label: 'État', type: 'radio', options: ['Neuf', 'Très bon état', 'Bon état', 'État correct'], required: true },
    { key: 'garantie', label: 'Garantie', type: 'text', placeholder: 'Ex: 1 an constructeur, 6 mois...' },
  ],
  services: [
    { key: 'type_service', label: 'Type de service', type: 'select', options: ['Informatique & Tech', 'Beauté & Bien-être', 'Cours & Formation', 'BTP & Artisanat', 'Transport & Livraison', 'Santé', 'Juridique', 'Événementiel', 'Autre'], required: true },
    { key: 'experience', label: 'Expérience', type: 'select', options: ['Moins de 1 an', '1-3 ans', '3-5 ans', '5-10 ans', 'Plus de 10 ans'] },
    { key: 'deplacement', label: 'Déplacement', type: 'radio', options: ['À domicile', 'Sur place', 'Les deux'] },
    { key: 'disponibilite', label: 'Disponibilité', type: 'text', placeholder: 'Ex: Lun-Sam 8h-18h, Sur RDV...' },
    { key: 'zone', label: 'Zone couverte', type: 'text', placeholder: 'Ex: Toute Abidjan...' },
  ],
  bebe: [
    { key: 'type_article', label: "Type d'article", type: 'select', options: ['Vêtements', 'Chaussures', 'Poussette', 'Siège auto', 'Lit/Berceau', 'Jouets', 'Alimentation', 'Chambre bébé', 'Autre'], required: true },
    { key: 'age_cible', label: 'Âge cible', type: 'select', options: ['0-3 mois', '3-6 mois', '6-12 mois', '1-2 ans', '2-3 ans', '3-5 ans', '5-8 ans', '8+ ans'] },
    { key: 'taille', label: 'Taille / Pointure', type: 'text', placeholder: 'Ex: 6 mois, T68...' },
    { key: 'etat', label: 'État', type: 'radio', options: ['Neuf', 'Très bon état', 'Bon état'], required: true },
    { key: 'marque', label: 'Marque', type: 'text', placeholder: 'Ex: Chicco, Graco...' },
  ],
  pharma: [
    { key: 'type_produit', label: 'Type de produit', type: 'select', options: ['Soins visage', 'Soins corps', 'Soins cheveux', 'Compléments alimentaires', 'Hygiène', 'Parfum', 'Maquillage', 'Autre'], required: true },
    { key: 'marque', label: 'Marque', type: 'text', placeholder: "Ex: L'Oréal, Nivea..." },
    { key: 'contenance', label: 'Contenance', type: 'text', placeholder: 'Ex: 200ml, 50g...' },
    { key: 'etat', label: 'État', type: 'radio', options: ['Neuf', 'Ouvert/Entamé'] },
    { key: 'date_exp', label: "Date d'expiration", type: 'text', placeholder: 'Ex: 12/2026...' },
  ],
  epicerie: [
    { key: 'type_produit', label: 'Type de produit', type: 'select', options: ['Riz & Céréales', 'Huiles & Condiments', 'Conserves', 'Boissons', 'Produits locaux CI', 'Bio & Naturel', 'Épices', 'Autre'], required: true },
    { key: 'poids_volume', label: 'Poids / Volume', type: 'text', placeholder: 'Ex: 25kg, 1L...' },
    { key: 'origine', label: 'Origine', type: 'text', placeholder: "Ex: Côte d'Ivoire, France..." },
    { key: 'date_exp', label: "Date d'expiration", type: 'text', placeholder: 'Ex: 06/2026...' },
    { key: 'cond', label: 'Conditionnement', type: 'text', placeholder: 'Ex: Vrac, Emballé, Palette...' },
  ],
  lingerie: [
    { key: 'type_article', label: "Type d'article", type: 'select', options: ['Lingerie', 'Sous-vêtements', 'Maillot de bain', 'Pyjama', 'Cosmétiques bien-être', 'Accessoires'], required: true },
    { key: 'taille', label: 'Taille', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Autre'] },
    { key: 'couleur', label: 'Couleur', type: 'text', placeholder: 'Ex: Noir, Rouge...' },
    { key: 'marque', label: 'Marque', type: 'text', placeholder: "Ex: Victoria's Secret..." },
    { key: 'etat', label: 'État', type: 'radio', options: ['Neuf avec étiquette', 'Neuf sans étiquette', 'Très bon état'] },
  ],
}

const CATEGORY_ICONS: Record<string, string> = {
  auto: '🚗', immobilier: '🏠', location: '🔑', hightech: '📱',
  electromenager: '📺', services: '🔧', bebe: '👶', pharma: '💊',
  epicerie: '🛒', lingerie: '👙',
}

// ─── Photo Analysis ───────────────────────────────────────────────────────────

interface PhotoAnalysis { suspicious: boolean; reasons: string[]; score: number }

function analyzePhotoUrl(url: string): PhotoAnalysis {
  const reasons: string[] = []; let score = 0; const lower = url.toLowerCase()
  const domains = ['shutterstock', 'gettyimages', 'istockphoto', 'dreamstime', 'depositphotos', 'alamy', 'unsplash', 'pexels', 'pixabay', 'amazon', 'aliexpress', 'jumia', 'cdiscount', 'fnac', 'catalogue', 'catalog', 'studio', 'product-image', 'product_image']
  for (const d of domains) { if (lower.includes(d)) { reasons.push(`URL contient "${d}"`); score += 40; break } }
  if (lower.includes('white-background') || lower.includes('fond-blanc')) { reasons.push("Fond blanc dans l'URL"); score += 30 }
  if (lower.includes('stock') || lower.includes('royalty')) { reasons.push('Photo stock'); score += 35 }
  if (url.includes('?') && (lower.includes('w=') || lower.includes('width='))) { reasons.push('Image redimensionnée'); score += 15 }
  return { suspicious: score >= 30, reasons, score: Math.min(score, 100) }
}

async function analyzeImageDimensions(url: string): Promise<PhotoAnalysis> {
  return new Promise((resolve) => {
    const img = new Image(); const reasons: string[] = []; let score = 0
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img
      if (w > 2500 || h > 2500) { reasons.push(`Résolution très haute (${w}×${h}px)`); score += 25 }
      if (w === h) { reasons.push('Format carré (catalogue)'); score += 20 }
      if (w % 100 === 0 && h % 100 === 0) { reasons.push(`Dimensions rondes (${w}×${h})`); score += 10 }
      resolve({ suspicious: score >= 20, reasons, score: Math.min(score, 100) })
    }
    img.onerror = () => resolve({ suspicious: false, reasons: [], score: 0 })
    img.crossOrigin = 'anonymous'; img.src = url
  })
}

async function analyzePhoto(url: string): Promise<PhotoAnalysis> {
  const u = analyzePhotoUrl(url); const d = await analyzeImageDimensions(url)
  return { suspicious: u.score + d.score >= 25, reasons: [...u.reasons, ...d.reasons], score: Math.min(u.score + d.score, 100) }
}

// ─── UI Components ────────────────────────────────────────────────────────────

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" style={{ width: size, height: size, flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; style: React.CSSProperties }> = {
    pending: { label: 'En attente', style: { background: 'rgba(251,191,36,0.15)', color: '#d97706', border: '1px solid rgba(251,191,36,0.3)' } },
    active: { label: 'Active', style: { background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)' } },
    rejected: { label: 'Rejetée', style: { background: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' } },
  }
  const c = cfg[status] ?? cfg.pending
  return <span style={{ ...c.style, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap' as const, display: 'inline-block' }}>{c.label}</span>
}

function SuspicionBadge({ analysis }: { analysis: PhotoAnalysis | null }) {
  if (!analysis) return <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s infinite' }} />
  if (!analysis.suspicious) return <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', padding: '2px 8px', borderRadius: 20 }}>✓ OK</span>
  return <span title={analysis.reasons.join('\n')} style={{ fontSize: 10, fontWeight: 700, background: analysis.score >= 60 ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)', color: analysis.score >= 60 ? '#f87171' : '#fbbf24', border: `1px solid ${analysis.score >= 60 ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'}`, padding: '2px 8px', borderRadius: 20, cursor: 'help' }}>{analysis.score >= 60 ? '⚠ Suspect' : '~ Douteux'}</span>
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

const REJECTION_REASONS = [
  { id: 'fake_photos', label: 'Photos non-réelles / Catalogue', message: 'Votre annonce a été refusée car nous privilégions les photos réelles. Merci de republier avec de vraies photos de votre produit.' },
  { id: 'bad_quality', label: 'Photos de mauvaise qualité', message: 'Votre annonce a été refusée en raison de la mauvaise qualité des photos. Merci de prendre des photos nettes et bien éclairées.' },
  { id: 'wrong_category', label: 'Mauvaise catégorie', message: 'Votre annonce a été refusée car elle est dans la mauvaise catégorie. Merci de la republier dans la bonne catégorie.' },
  { id: 'incomplete', label: 'Annonce incomplète', message: "Votre annonce manque d'informations importantes. Merci de la compléter avant de la republier." },
  { id: 'prohibited', label: 'Contenu interdit', message: 'Votre annonce contient du contenu non autorisé sur notre plateforme.' },
  { id: 'other', label: 'Autre motif', message: '' },
]

function RejectModal({ ad, onClose, onConfirm }: { ad: Ad; onClose: () => void; onConfirm: (r: string, m: string) => void }) {
  const [selected, setSelected] = useState(REJECTION_REASONS[0])
  const [custom, setCustom] = useState('')
  const finalMessage = selected.id === 'other' ? custom : selected.message
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Motif de refus</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.title}</p>
        </div>
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REJECTION_REASONS.map(r => (
            <label key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="radio" name="reason" checked={selected.id === r.id} onChange={() => setSelected(r)} style={{ marginTop: 2, accentColor: '#f97316' }} />
              <span style={{ fontSize: 13, color: selected.id === r.id ? '#fb923c' : '#94a3b8', fontWeight: selected.id === r.id ? 600 : 400 }}>{r.label}</span>
            </label>
          ))}
          {selected.id === 'other' && <textarea value={custom} onChange={e => setCustom(e.target.value)} placeholder="Précisez le motif..." rows={3} style={{ width: '100%', padding: '10px 14px', background: '#0f1219', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, color: '#e2e8f0', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />}
          {finalMessage && selected.id !== 'other' && (
            <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', margin: '0 0 4px' }}>Message au vendeur :</p>
              <p style={{ fontSize: 11, color: '#93c5fd', margin: 0, fontStyle: 'italic' }}>{finalMessage}</p>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
          <button onClick={() => onConfirm(selected.label, finalMessage)} disabled={selected.id === 'other' && !custom.trim()} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: selected.id === 'other' && !custom.trim() ? 0.5 : 1 }}>Confirmer le refus</button>
        </div>
      </div>
    </div>
  )
}

function ApproveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <>
      <style>{`.btn-approve:not(:disabled){animation:glow-approve 2s ease-in-out infinite}.btn-approve:not(:disabled):hover{filter:brightness(1.1);transform:scale(1.02)}.btn-approve:not(:disabled):active{transform:scale(0.97)}.btn-approve{transition:filter .15s,transform .15s}@keyframes glow-approve{0%,100%{box-shadow:0 0 8px rgba(34,197,94,0.4),0 0 20px rgba(34,197,94,0.2)}50%{box-shadow:0 0 16px rgba(34,197,94,0.7),0 0 36px rgba(34,197,94,0.4)}}`}</style>
      <button onClick={onClick} disabled={loading} className="btn-approve" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontSize: 12, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit' }}>
        {loading ? <Spinner size={13} /> : <CheckCircle2 size={13} />} APPROUVER
      </button>
    </>
  )
}

// ─── Publication Assistée ─────────────────────────────────────────────────────

const CATEGORIES_LIST = [
  { id: 'hightech', label: 'High-Tech' }, { id: 'auto', label: 'Automobile & Industrie' },
  { id: 'immobilier', label: 'Immobilier' }, { id: 'location', label: 'Location & Mobilité' },
  { id: 'services', label: 'Services & Autres' }, { id: 'electromenager', label: 'Électroménager' },
  { id: 'bebe', label: 'Bébé & Mamans' }, { id: 'pharma', label: 'Parapharmacie' },
  { id: 'epicerie', label: 'Épicerie & Boissons' }, { id: 'lingerie', label: 'Lingerie & Accessoires' },
]

const CITIES_LIST = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Daloa', 'Korhogo', 'Man', 'Gagnoa']

interface AssistedAdForm {
  title: string; description: string; price: string
  category_id: string; city: string; phone: string; images: string
}

function DynamicField({ field, value, onChange, inputStyle, BORDER, TEXT_PRI, TEXT_SEC, ORANGE }: {
  field: CategoryField; value: string; onChange: (v: string) => void
  inputStyle: React.CSSProperties; BORDER: string; TEXT_PRI: string; TEXT_SEC: string; ORANGE: string
}) {
  if (field.type === 'radio') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
        {field.options?.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${value === opt ? ORANGE : BORDER}`, background: value === opt ? `rgba(249,115,22,0.15)` : 'rgba(255,255,255,0.04)', color: value === opt ? ORANGE : TEXT_SEC, transition: 'all 0.15s' }}>
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer', color: value ? TEXT_PRI : TEXT_SEC }}>
        <option value="">Choisir...</option>
        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    )
  }

  return (
    <input type={field.type === 'number' ? 'number' : 'text'}
      placeholder={field.placeholder || ''}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
    />
  )
}

function AssistedPublish({ BG_CARD, BG_CARD2, BORDER, TEXT_PRI, TEXT_SEC, TEXT_MUT, ORANGE }: {
  BG_CARD: string; BG_CARD2: string; BORDER: string
  TEXT_PRI: string; TEXT_SEC: string; TEXT_MUT: string; ORANGE: string
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<AssistedAdForm>({ title: '', description: '', price: '', category_id: '', city: '', phone: '', images: '' })
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({})

  // Reset dynamic fields when category changes
  const handleCategoryChange = (catId: string) => {
    setForm(f => ({ ...f, category_id: catId }))
    setDynamicFields({})
  }

  const currentFields = CATEGORY_FIELDS[form.category_id] || []

  async function searchUsers() {
    if (!searchQuery.trim()) return
    setSearching(true)
    const { data } = await supabase.from('profiles').select('id, prenom, nom, email, phone')
      .or(`email.ilike.%${searchQuery}%,prenom.ilike.%${searchQuery}%,nom.ilike.%${searchQuery}%`).limit(8)
    setSearchResults(data || [])
    setSearching(false)
  }

  function selectUser(user: Profile) {
    setSelectedUser(user); setSearchResults([]); setSearchQuery('')
    setForm(f => ({ ...f, phone: user.phone || '' }))
  }

  // Génère la description structurée depuis les champs dynamiques
  function buildDescription(): string {
    const lines: string[] = []
    for (const field of currentFields) {
      const val = dynamicFields[field.key]
      if (val) lines.push(`${field.label} : ${val}`)
    }
    const structured = lines.join('\n')
    const libre = form.description.trim()
    if (structured && libre) return `${structured}\n\n${libre}`
    return structured || libre
  }

  async function handleSubmit() {
    if (!selectedUser?.id) return toast.error('Sélectionnez un vendeur')
    if (!form.title.trim()) return toast.error('Titre requis')
    if (!form.price || isNaN(Number(form.price))) return toast.error('Prix invalide')
    if (!form.category_id) return toast.error('Catégorie requise')
    if (!form.city) return toast.error('Ville requise')

    const finalDesc = buildDescription()
    if (!finalDesc.trim()) return toast.error('Description ou caractéristiques requises')

    setSubmitting(true)
    const images = form.images.split('\n').map(s => s.trim()).filter(Boolean)

    const { error } = await supabase.from('ads').insert({
      user_id: selectedUser.id,
      title: form.title.trim(),
      description: finalDesc,
      price: Number(form.price),
      category_id: form.category_id,
      city: form.city,
      phone: form.phone.trim(),
      images,
      status: 'pending',
      assisted_by_admin: true,
    })

    if (error) {
      toast.error('Erreur : ' + error.message)
    } else {
      toast.success(`Annonce publiée pour ${selectedUser.prenom} ${selectedUser.nom} — en attente de validation`)
      setSelectedUser(null)
      setForm({ title: '', description: '', price: '', category_id: '', city: '', phone: '', images: '' })
      setDynamicFields({})
    }
    setSubmitting(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: BG_CARD2, border: `1px solid ${BORDER}`,
    borderRadius: 10, fontSize: 13, color: TEXT_PRI,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: TEXT_SEC,
    textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6, display: 'block',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Banner */}
      <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <PlusCircle size={16} color={ORANGE} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: ORANGE, margin: 0 }}>Publication assistée</p>
          <p style={{ fontSize: 12, color: TEXT_SEC, margin: '4px 0 0', lineHeight: 1.5 }}>
            Publiez une annonce au nom d'un vendeur. Les champs s'adaptent automatiquement selon la catégorie choisie. L'annonce passera en <strong style={{ color: '#fbbf24' }}>attente de validation</strong>.
          </p>
        </div>
      </div>

      {/* Étape 1 — Vendeur */}
      <div style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>1</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRI }}>Sélectionner le vendeur</span>
        </div>

        {selectedUser ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: ORANGE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {selectedUser.prenom?.[0]?.toUpperCase() || 'V'}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRI, margin: 0 }}>{selectedUser.prenom} {selectedUser.nom}</p>
                <p style={{ fontSize: 11, color: TEXT_SEC, margin: 0 }}>{selectedUser.email}</p>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} style={{ fontSize: 11, color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Changer</button>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" placeholder="Rechercher par nom, email..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUsers()}
                style={{ ...inputStyle, flex: 1 }} />
              <button onClick={searchUsers} disabled={searching || !searchQuery.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: ORANGE, border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, opacity: !searchQuery.trim() ? 0.5 : 1 }}>
                {searching ? <Spinner size={14} /> : <Search size={14} />} Chercher
              </button>
            </div>
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1a2035', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                {searchResults.map(u => (
                  <button key={u.id} onClick={() => selectUser(u)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontFamily: 'inherit' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.08)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: ORANGE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{u.prenom?.[0]?.toUpperCase() || 'V'}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRI, margin: 0 }}>{u.prenom} {u.nom}</p>
                      <p style={{ fontSize: 11, color: TEXT_SEC, margin: 0 }}>{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Étape 2 — Annonce */}
      <div style={{ background: BG_CARD, border: `1px solid ${selectedUser ? BORDER : 'rgba(255,255,255,0.03)'}`, borderRadius: 16, padding: 20, opacity: selectedUser ? 1 : 0.4, pointerEvents: selectedUser ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: selectedUser ? ORANGE : TEXT_MUT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>2</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRI }}>Détails de l'annonce</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Titre */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Titre de l'annonce *</label>
            <input type="text" placeholder="Ex: Toyota RAV4 2021 Full Options" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
          </div>

          {/* Catégorie */}
          <div>
            <label style={labelStyle}>Catégorie *</label>
            <select value={form.category_id} onChange={e => handleCategoryChange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Choisir une catégorie</option>
              {CATEGORIES_LIST.map(c => (
                <option key={c.id} value={c.id}>{CATEGORY_ICONS[c.id] || ''} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Ville */}
          <div>
            <label style={labelStyle}>Ville *</label>
            <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Choisir une ville</option>
              {CITIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label style={labelStyle}>Prix (FCFA) *</label>
            <input type="number" placeholder="Ex: 18500000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} />
          </div>

          {/* Téléphone */}
          <div>
            <label style={labelStyle}>Téléphone du vendeur *</label>
            <input type="tel" placeholder="Ex: +225 07 00 00 00 00" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
          </div>
        </div>

        {/* ── Champs dynamiques par catégorie ── */}
        {currentFields.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[form.category_id]}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRI }}>
                Fiche technique — {CATEGORIES_LIST.find(c => c.id === form.category_id)?.label}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: ORANGE, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', padding: '2px 8px', borderRadius: 20 }}>
                {currentFields.filter(f => dynamicFields[f.key]).length}/{currentFields.length} remplis
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {currentFields.map(field => (
                <div key={field.key} style={{ gridColumn: field.type === 'radio' ? '1 / -1' : 'auto' }}>
                  <label style={{ ...labelStyle, color: field.required && !dynamicFields[field.key] ? 'rgba(249,115,22,0.7)' : TEXT_SEC }}>
                    {field.label} {field.required && <span style={{ color: ORANGE }}>*</span>}
                  </label>
                  <DynamicField
                    field={field}
                    value={dynamicFields[field.key] || ''}
                    onChange={v => setDynamicFields(prev => ({ ...prev, [field.key]: v }))}
                    inputStyle={inputStyle}
                    BORDER={BORDER} TEXT_PRI={TEXT_PRI} TEXT_SEC={TEXT_SEC} ORANGE={ORANGE}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Description libre ── */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
          <label style={labelStyle}>
            Description libre {!currentFields.length && <span style={{ color: ORANGE }}>*</span>}
          </label>
          <textarea
            rows={4}
            placeholder={currentFields.length
              ? "Ajoutez des informations complémentaires (optionnel) — état, historique, raison de la vente..."
              : "Décrivez le produit ou service en détail..."}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
          {currentFields.length > 0 && (
            <p style={{ fontSize: 11, color: TEXT_MUT, margin: '6px 0 0' }}>
              La fiche technique sera automatiquement ajoutée au début de la description.
            </p>
          )}
        </div>

        {/* Images */}
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>URLs des photos (une par ligne)</label>
          <textarea
            rows={3}
            placeholder={'https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg'}
            value={form.images}
            onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
          />
          <p style={{ fontSize: 11, color: TEXT_MUT, margin: '6px 0 0' }}>Collez les liens des photos envoyées par le vendeur, une URL par ligne.</p>
        </div>

        {/* Aperçu description générée */}
        {currentFields.length > 0 && (Object.keys(dynamicFields).length > 0 || form.description) && (
          <div style={{ marginTop: 16, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', margin: '0 0 8px' }}>👁 Aperçu de la description finale :</p>
            <pre style={{ fontSize: 11, color: '#93c5fd', margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{buildDescription() || '—'}</pre>
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontSize: 12, color: TEXT_MUT, margin: 0 }}>
            Annonce au nom de <strong style={{ color: TEXT_SEC }}>{selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : '...'}</strong> — passera en attente de validation.
          </p>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, border: 'none', background: submitting ? TEXT_MUT : `linear-gradient(135deg, ${ORANGE}, #ef4444)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0, boxShadow: submitting ? 'none' : `0 4px 14px rgba(249,115,22,0.35)`, transition: 'all 0.2s' }}>
            {submitting ? <><Spinner size={14} /> Publication...</> : <><PlusCircle size={14} /> Publier l'annonce</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabType = 'pending' | 'active' | 'rejected' | 'assisted'

export default function ModerationPage() {
  const router = useRouter()
  const [authUserId, setAuthUserId] = useState<string | null | undefined>(undefined)
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [filter, setFilter] = useState<'pending' | 'active' | 'rejected'>('pending')
  const [photoAnalyses, setPhotoAnalyses] = useState<Record<string, PhotoAnalysis>>({})
  const [rejectingAd, setRejectingAd] = useState<Ad | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)
  const [massMode, setMassMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const BG_PAGE = '#0f1219'; const BG_CARD = '#161b27'; const BG_CARD2 = '#1a2035'
  const BORDER = 'rgba(255,255,255,0.07)'; const TEXT_PRI = '#f1f5f9'
  const TEXT_SEC = '#64748b'; const TEXT_MUT = '#475569'; const ORANGE = '#f97316'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/')
      else setAuthUserId(data.session.user.id)
    })
  }, [router])

  const fetchAds = useCallback(async () => {
    setLoading(true); setDbError(null); setSelected(new Set())
    const { data, error } = await supabase.from('ads')
      .select(`id, title, description, price, city, category_id, images, status, created_at, user_id, profiles(prenom, nom, email)`)
      .eq('status', filter).order('created_at', { ascending: false }).limit(100)
    if (error) { setDbError(`Erreur [${error.code}]: ${error.message}`); toast.error('Erreur de chargement') }
    else {
      const mapped = (data || []).map((a: Record<string, unknown>) => ({ ...a, category: a.category_id ?? '—', images: (a.images as string[]) || [] })) as Ad[]
      setAds(mapped)
      for (const ad of mapped) {
        if (ad.images?.[0]) analyzePhoto(ad.images[0]).then(analysis => setPhotoAnalyses(prev => ({ ...prev, [ad.id]: analysis })))
      }
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (authUserId && activeTab !== 'assisted') fetchAds()
  }, [filter, authUserId, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTabChange(tab: TabType) {
    setActiveTab(tab); setMassMode(false); setSelected(new Set())
    if (tab !== 'assisted') setFilter(tab as 'pending' | 'active' | 'rejected')
  }

  async function approveAd(id: string) {
    setProcessingId(id)
    try {
      const res = await fetch('/api/admin/ads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'active' }) })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || "Erreur lors de l'approbation")
      else { toast.success('Annonce approuvée !'); setAds(p => p.filter(a => a.id !== id)) }
    } catch { toast.error('Erreur réseau') }
    setProcessingId(null)
  }

  async function handleRejectConfirm(reason: string, message: string) {
    if (!rejectingAd) return
    const { id, user_id } = rejectingAd; setRejectingAd(null); setProcessingId(id)
    try {
      const res = await fetch('/api/admin/ads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'rejected' }) })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || 'Erreur lors du refus'); setProcessingId(null); return }
    } catch { toast.error('Erreur réseau'); setProcessingId(null); return }
    if (message && user_id) {
      await supabase.from('notifications').insert({ user_id, type: 'ad_rejected', title: 'Annonce refusée', message, ad_id: id, read: false })
        .then(({ error }) => { if (error) console.warn('Notif échouée:', error.message) })
    }
    toast.success('Annonce refusée'); setAds(p => p.filter(a => a.id !== id)); setProcessingId(null)
  }

  async function deleteAd(id: string) {
    if (!confirm('Supprimer définitivement cette annonce ?')) return
    setProcessingId(id)
    const ad = ads.find(a => a.id === id)
    try {
      const res = await fetch('/api/admin/ads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, images: ad?.images || [] }) })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Erreur lors de la suppression')
      else { toast.success('Annonce supprimée'); setAds(p => p.filter(a => a.id !== id)) }
    } catch { toast.error('Erreur réseau') }
    setProcessingId(null)
  }

  async function massApprove() {
    const ids = Array.from(selected); if (!ids.length) return
    toast.loading(`Approbation de ${ids.length} annonces...`, { id: 'mass' })
    await Promise.all(ids.map(id => approveAd(id)))
    toast.success(`${ids.length} annonces approuvées !`, { id: 'mass' })
    setSelected(new Set()); setMassMode(false)
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  if (authUserId === undefined) return null

  const suspiciousCount = Object.values(photoAnalyses).filter(a => a.suspicious).length

  const TABS: { id: TabType; label: string }[] = [
    { id: 'pending', label: '⏳ En attente' },
    { id: 'active', label: '✅ Actives' },
    { id: 'rejected', label: '❌ Rejetées' },
    { id: 'assisted', label: '✍️ Pub. assistée' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: BG_PAGE, color: TEXT_PRI, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Toaster position="top-center" toastOptions={{ style: { background: BG_CARD2, color: TEXT_PRI, border: `1px solid ${BORDER}` } }} />
      {rejectingAd && <RejectModal ad={rejectingAd} onClose={() => setRejectingAd(null)} onConfirm={handleRejectConfirm} />}

      <header style={{ background: BG_CARD, borderBottom: `1px solid ${BORDER}`, padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: 17, fontWeight: 800, color: TEXT_PRI, letterSpacing: '-0.4px' }}>Abidjan<span style={{ color: ORANGE }}>Deals</span></Link>
          <div style={{ width: 1, height: 18, background: BORDER }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={13} color={ORANGE} />
            <span style={{ fontSize: 10, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Administration</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRI }}>Modération</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {suspiciousCount > 0 && <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 12px', borderRadius: 20 }}>⚠ {suspiciousCount} photo{suspiciousCount > 1 ? 's' : ''} suspecte{suspiciousCount > 1 ? 's' : ''}</span>}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600, color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px', borderRadius: 8 }}><LogOut size={13} /> Quitter</Link>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/' }} style={{ fontSize: 12, color: TEXT_SEC, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Déconnexion</button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

        {dbError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
            <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: 0 }}>Erreur de chargement</p>
              <p style={{ fontSize: 11, color: '#fca5a5', margin: '4px 0 0', fontFamily: 'monospace', wordBreak: 'break-all' }}>{dbError}</p>
            </div>
            <button onClick={() => setDbError(null)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* Onglets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: tab.id === 'assisted' ? `1px solid ${activeTab === 'assisted' ? ORANGE : 'rgba(249,115,22,0.3)'}` : 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', background: activeTab === tab.id ? (tab.id === 'assisted' ? 'rgba(249,115,22,0.15)' : ORANGE) : BG_CARD2, color: activeTab === tab.id ? (tab.id === 'assisted' ? ORANGE : '#fff') : TEXT_SEC, boxShadow: activeTab === tab.id && tab.id !== 'assisted' ? `0 4px 14px rgba(249,115,22,0.3)` : 'none' }}>
              {tab.label}
            </button>
          ))}
          {activeTab !== 'assisted' && (
            <>
              <button onClick={fetchAds} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: BG_CARD2, border: `1px solid ${BORDER}`, color: TEXT_SEC, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.5 : 1 }}>
                <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> Actualiser
              </button>
              {activeTab === 'pending' && (
                <button onClick={() => setMassMode(m => !m)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: massMode ? 'rgba(249,115,22,0.15)' : BG_CARD2, border: `1px solid ${massMode ? 'rgba(249,115,22,0.3)' : BORDER}`, color: massMode ? ORANGE : TEXT_SEC, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {massMode ? '✕ Annuler' : 'Sélection multiple'}
                </button>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 12, color: TEXT_MUT, background: BG_CARD2, border: `1px solid ${BORDER}`, padding: '6px 14px', borderRadius: 10 }}>
                {loading ? '...' : `${ads.length} annonce${ads.length > 1 ? 's' : ''}`}
              </span>
            </>
          )}
        </div>

        {activeTab === 'assisted' ? (
          <AssistedPublish BG_CARD={BG_CARD} BG_CARD2={BG_CARD2} BORDER={BORDER} TEXT_PRI={TEXT_PRI} TEXT_SEC={TEXT_SEC} TEXT_MUT={TEXT_MUT} ORANGE={ORANGE} />
        ) : (
          <>
            {massMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 12, padding: '12px 18px', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#fb923c', flex: 1 }}>{selected.size} annonce{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}</span>
                <button onClick={massApprove} disabled={!selected.size} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', opacity: selected.size ? 1 : 0.5 }}>
                  <CheckCircle2 size={13} /> Approuver la sélection
                </button>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
                <div style={{ width: 36, height: 36, border: `3px solid ${ORANGE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontSize: 13, color: TEXT_SEC, margin: 0 }}>Chargement des annonces...</p>
              </div>
            ) : ads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 32px', background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 20 }}>
                <p style={{ fontSize: 48, margin: '0 0 16px' }}>🔭</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRI, margin: '0 0 6px' }}>Aucune annonce {activeTab === 'pending' ? 'en attente' : activeTab === 'active' ? 'active' : 'rejetée'}</p>
                <p style={{ fontSize: 13, color: TEXT_SEC, margin: '0 0 20px' }}>Tout est à jour !</p>
                <button onClick={fetchAds} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: ORANGE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}><RefreshCw size={14} /> Réessayer</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ads.map(ad => {
                  const analysis = photoAnalyses[ad.id] ?? null
                  const profile = getProfile(ad)
                  const isProcessing = processingId === ad.id
                  return (
                    <div key={ad.id} style={{ background: BG_CARD, border: `1px solid ${massMode && selected.has(ad.id) ? 'rgba(249,115,22,0.4)' : analysis?.suspicious ? 'rgba(251,191,36,0.2)' : BORDER}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.15s', opacity: isProcessing ? 0.6 : 1 }}>
                      {analysis?.suspicious && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.15)', padding: '8px 16px' }}>
                          <AlertTriangle size={13} color="#fbbf24" />
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', margin: 0 }}>Photo suspecte (score: {analysis.score}/100) — {analysis.reasons.join(' · ')}</p>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 16, padding: '16px' }}>
                        {massMode && <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 4 }}><input type="checkbox" checked={selected.has(ad.id)} onChange={() => toggleSelect(ad.id)} style={{ width: 16, height: 16, accentColor: ORANGE, cursor: 'pointer' }} /></div>}
                        <div style={{ flexShrink: 0 }}>
                          <div style={{ width: 110, height: 80, borderRadius: 12, overflow: 'hidden', background: BG_CARD2 }}>
                            {ad.images?.[0] ? <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <SuspicionBadge analysis={analysis} />
                            <span style={{ fontSize: 10, color: TEXT_MUT }}>{ad.images?.length || 0} photo{(ad.images?.length || 0) > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ minWidth: 0 }}>
                              <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRI, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.title}</h3>
                              <p style={{ fontSize: 12, color: TEXT_SEC, margin: '4px 0 0' }}>{profile ? `${profile.prenom} ${profile.nom}` : 'Vendeur inconnu'}{' · '}{ad.city}{' · '}<span style={{ color: TEXT_MUT }}>{ad.category}</span></p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                <StatusBadge status={ad.status} />
                                <span style={{ fontSize: 11, color: TEXT_MUT }}>{fmtDate(ad.created_at)}</span>
                              </div>
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 800, color: ORANGE, whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtPrice(ad.price)}</span>
                          </div>
                          <p style={{ fontSize: 12, color: TEXT_SEC, margin: '8px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ad.description}</p>
                        </div>
                      </div>
                      <div style={{ borderTop: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <a href={`/ad/${ad.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}><Eye size={13} /> Prévisualiser</a>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {activeTab === 'pending' && (
                            <>
                              <button onClick={() => setRejectingAd(ad)} disabled={isProcessing} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isProcessing ? 0.5 : 1 }}>
                                {isProcessing ? <Spinner size={13} /> : <XCircle size={13} />} Refuser
                              </button>
                              <ApproveButton loading={isProcessing} onClick={() => approveAd(ad.id)} />
                            </>
                          )}
                          <button onClick={() => deleteAd(ad.id)} disabled={isProcessing} title="Supprimer définitivement" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, cursor: isProcessing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isProcessing ? 0.5 : 1 }}>
                            {isProcessing ? <Spinner size={13} /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}
