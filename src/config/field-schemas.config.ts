// src/config/field-schemas.config.ts
// ─── Schémas de champs dynamiques par catégorie ────────────────────────────
// Chaque champ est sauvegardé dans la colonne `metadata` (jsonb) de Supabase.
// Pas besoin de migration BDD pour ajouter des champs : on édit ce fichier.

export type FieldType =
  | 'select'
  | 'number'
  | 'text'
  | 'toggle'
  | 'range'

export interface FieldOption {
  value: string
  label: string
}

export interface CategoryField {
  key: string
  label: string
  type: FieldType
  icon: string
  options?: FieldOption[]
  unit?: string
  min?: number
  max?: number
  step?: number
  required?: boolean
  noFilter?: boolean
}

export const FIELD_SCHEMAS: Record<string, CategoryField[]> = {

  // ── AUTO ────────────────────────────────────────────────────────────────────
  auto: [
    {
      key: 'year', label: 'Année', type: 'select', icon: '📅', required: true,
      options: Array.from({ length: 35 }, (_, i) => {
        const y = 2024 - i
        return { value: String(y), label: String(y) }
      }),
    },
    {
      key: 'mileage', label: 'Kilométrage', type: 'select', icon: '🛣️',
      options: [
        { value: '0-10000', label: '< 10 000 km' },
        { value: '10000-50000', label: '10 000 – 50 000 km' },
        { value: '50000-100000', label: '50 000 – 100 000 km' },
        { value: '100000-200000', label: '100 000 – 200 000 km' },
        { value: '200000+', label: '+ 200 000 km' },
      ],
    },
    {
      key: 'fuel', label: 'Carburant', type: 'select', icon: '⛽',
      options: [
        { value: 'essence', label: 'Essence' },
        { value: 'diesel', label: 'Diesel' },
        { value: 'hybride', label: 'Hybride' },
        { value: 'electrique', label: 'Électrique' },
        { value: 'gpl', label: 'GPL' },
      ],
    },
    {
      key: 'transmission', label: 'Boîte de vitesse', type: 'select', icon: '⚙️',
      options: [
        { value: 'automatique', label: 'Automatique' },
        { value: 'manuelle', label: 'Manuelle' },
      ],
    },
    {
      key: 'color', label: 'Couleur', type: 'select', icon: '🎨', noFilter: true,
      options: [
        { value: 'blanc', label: 'Blanc' },
        { value: 'noir', label: 'Noir' },
        { value: 'gris', label: 'Gris' },
        { value: 'rouge', label: 'Rouge' },
        { value: 'bleu', label: 'Bleu' },
        { value: 'argent', label: 'Argent' },
        { value: 'autre', label: 'Autre' },
      ],
    },
    {
      key: 'doors', label: 'Nombre de portes', type: 'select', icon: '🚪', noFilter: true,
      options: [
        { value: '2', label: '2 portes' },
        { value: '3', label: '3 portes' },
        { value: '4', label: '4 portes' },
        { value: '5', label: '5 portes' },
      ],
    },
  ],

  // ── HIGHTECH — SMARTPHONES ──────────────────────────────────────────────────
  hightech: [
    {
      key: 'storage', label: 'Stockage', type: 'select', icon: '💾',
      options: [
        { value: '16gb', label: '16 Go' },
        { value: '32gb', label: '32 Go' },
        { value: '64gb', label: '64 Go' },
        { value: '128gb', label: '128 Go' },
        { value: '256gb', label: '256 Go' },
        { value: '512gb', label: '512 Go' },
        { value: '1tb', label: '1 To' },
      ],
    },
    {
      key: 'ram', label: 'RAM', type: 'select', icon: '🧠', noFilter: true,
      options: [
        { value: '2gb', label: '2 Go' },
        { value: '4gb', label: '4 Go' },
        { value: '6gb', label: '6 Go' },
        { value: '8gb', label: '8 Go' },
        { value: '12gb', label: '12 Go' },
        { value: '16gb', label: '16 Go' },
        { value: '32gb', label: '32 Go' },
      ],
    },
    {
      key: 'screen_size', label: 'Taille écran', type: 'select', icon: '📱',
      options: [
        { value: '5', label: '5"' },
        { value: '5.5', label: '5.5"' },
        { value: '6', label: '6"' },
        { value: '6.5', label: '6.5"' },
        { value: '7plus', label: '7" et +' },
      ],
    },
    {
      key: 'os', label: 'Système', type: 'select', icon: '🖥️',
      options: [
        { value: 'android', label: 'Android' },
        { value: 'ios', label: 'iOS' },
        { value: 'windows', label: 'Windows' },
        { value: 'macos', label: 'macOS' },
        { value: 'linux', label: 'Linux' },
        { value: 'autre', label: 'Autre' },
      ],
    },
    {
      key: 'accessories_included', label: 'Accessoires inclus',
      type: 'toggle', icon: '🔌', noFilter: true,
    },
  ],

  // ── IMMOBILIER ──────────────────────────────────────────────────────────────
  immobilier: [
    {
      key: 'rooms', label: 'Nombre de pièces', type: 'select', icon: '🛏️', required: true,
      options: [
        { value: 'studio', label: 'Studio' },
        { value: '2', label: '2 pièces' },
        { value: '3', label: '3 pièces' },
        { value: '4', label: '4 pièces' },
        { value: '5', label: '5 pièces' },
        { value: '6plus', label: '6 pièces et +' },
      ],
    },
    {
      key: 'surface', label: 'Superficie', type: 'number',
      icon: '📐', unit: 'm²', min: 10, max: 5000,
    },
    {
      key: 'floor', label: 'Étage', type: 'select', icon: '🏢', noFilter: true,
      options: [
        { value: 'rdc', label: 'Rez-de-chaussée' },
        { value: '1', label: '1er étage' },
        { value: '2', label: '2ème étage' },
        { value: '3', label: '3ème étage' },
        { value: '4plus', label: '4ème étage et +' },
      ],
    },
    { key: 'furnished', label: 'Meublé', type: 'toggle', icon: '🛋️' },
    { key: 'parking', label: 'Parking', type: 'toggle', icon: '🅿️' },
    { key: 'secured', label: 'Résidence sécurisée', type: 'toggle', icon: '🔒', noFilter: true },
  ],

  // ── LOCATION ────────────────────────────────────────────────────────────────
  location: [
    {
      key: 'capacity', label: 'Capacité', type: 'select', icon: '👥',
      options: [
        { value: '10-50', label: '10 – 50 personnes' },
        { value: '50-100', label: '50 – 100 personnes' },
        { value: '100-200', label: '100 – 200 personnes' },
        { value: '200-500', label: '200 – 500 personnes' },
        { value: '500plus', label: '500+ personnes' },
      ],
    },
    {
      key: 'duration', label: 'Durée minimum', type: 'select', icon: '⏱️', noFilter: true,
      options: [
        { value: 'heure', label: "À l'heure" },
        { value: 'demijour', label: 'Demi-journée' },
        { value: 'jour', label: 'La journée' },
        { value: 'semaine', label: 'La semaine' },
      ],
    },
    { key: 'delivery', label: 'Livraison incluse', type: 'toggle', icon: '🚚', noFilter: true },
    { key: 'driver', label: 'Chauffeur inclus', type: 'toggle', icon: '👨‍✈️', noFilter: true },
  ],

  // ── ELECTROMENAGER ──────────────────────────────────────────────────────────
  electromenager: [
    {
      key: 'energy_class', label: 'Classe énergie', type: 'select', icon: '⚡',
      options: [
        { value: 'A+++', label: 'A+++' },
        { value: 'A++', label: 'A++' },
        { value: 'A+', label: 'A+' },
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
      ],
    },
    {
      key: 'capacity_liters', label: 'Capacité', type: 'number',
      icon: '📦', unit: 'L', min: 1, max: 1000, noFilter: true,
    },
    {
      key: 'warranty', label: 'Garantie restante', type: 'select', icon: '🛡️', noFilter: true,
      options: [
        { value: 'aucune', label: 'Aucune garantie' },
        { value: '3mois', label: '3 mois' },
        { value: '6mois', label: '6 mois' },
        { value: '1an', label: '1 an' },
        { value: '2ans', label: '2 ans et +' },
      ],
    },
  ],

  // ── MODE & BEAUTE ───────────────────────────────────────────────────────────
  mode: [
    {
      key: 'clothing_size', label: 'Taille vêtement', type: 'select', icon: '📏',
      options: [
        { value: 'XS', label: 'XS' },
        { value: 'S', label: 'S' },
        { value: 'M', label: 'M' },
        { value: 'L', label: 'L' },
        { value: 'XL', label: 'XL' },
        { value: 'XXL', label: 'XXL' },
        { value: 'XXXL', label: 'XXXL' },
      ],
    },
    {
      key: 'shoe_size', label: 'Pointure', type: 'select', icon: '👟',
      options: Array.from({ length: 20 }, (_, i) => {
        const size = 36 + i
        return { value: String(size), label: String(size) }
      }),
    },
    {
      key: 'gender', label: 'Genre', type: 'select', icon: '🧑',
      options: [
        { value: 'homme', label: 'Homme' },
        { value: 'femme', label: 'Femme' },
        { value: 'enfant', label: 'Enfant' },
        { value: 'unisex', label: 'Unisexe' },
      ],
    },
    {
      key: 'color', label: 'Couleur principale', type: 'select', icon: '🎨', noFilter: true,
      options: [
        { value: 'blanc', label: 'Blanc' },
        { value: 'noir', label: 'Noir' },
        { value: 'rouge', label: 'Rouge' },
        { value: 'bleu', label: 'Bleu' },
        { value: 'vert', label: 'Vert' },
        { value: 'jaune', label: 'Jaune' },
        { value: 'orange', label: 'Orange' },
        { value: 'rose', label: 'Rose' },
        { value: 'marron', label: 'Marron' },
        { value: 'gris', label: 'Gris' },
        { value: 'multicolore', label: 'Multicolore' },
      ],
    },
    { key: 'authentic', label: 'Article authentique', type: 'toggle', icon: '✅', noFilter: true },
  ],

  // ── BEBE & MAMANS ───────────────────────────────────────────────────────────
  bebe: [
    {
      key: 'age_range', label: 'Âge cible', type: 'select', icon: '👶',
      options: [
        { value: '0-3mois', label: '0 – 3 mois' },
        { value: '3-6mois', label: '3 – 6 mois' },
        { value: '6-12mois', label: '6 – 12 mois' },
        { value: '1-2ans', label: '1 – 2 ans' },
        { value: '2-3ans', label: '2 – 3 ans' },
        { value: '3-5ans', label: '3 – 5 ans' },
        { value: '5ans+', label: '5 ans et +' },
      ],
    },
    {
      key: 'gender', label: 'Genre', type: 'select', icon: '🎀',
      options: [
        { value: 'fille', label: 'Fille' },
        { value: 'garcon', label: 'Garçon' },
        { value: 'mixte', label: 'Mixte' },
      ],
    },
  ],

  // ── SERVICES ────────────────────────────────────────────────────────────────
  services: [
    {
      key: 'service_type', label: 'Type de prestation', type: 'select', icon: '🔧', required: true,
      options: [
        { value: 'devis', label: 'Sur devis' },
        { value: 'forfait', label: 'Forfait fixe' },
        { value: 'heure', label: "À l'heure" },
        { value: 'journee', label: 'À la journée' },
      ],
    },
    { key: 'remote', label: 'Prestation à distance', type: 'toggle', icon: '💻', noFilter: true },
    {
      key: 'experience_years', label: "Années d'expérience", type: 'select', icon: '⭐', noFilter: true,
      options: [
        { value: '0-1', label: '< 1 an' },
        { value: '1-3', label: '1 – 3 ans' },
        { value: '3-5', label: '3 – 5 ans' },
        { value: '5-10', label: '5 – 10 ans' },
        { value: '10plus', label: '+ 10 ans' },
      ],
    },
    {
      key: 'availability', label: 'Disponibilité', type: 'select', icon: '📅', noFilter: true,
      options: [
        { value: 'immediate', label: 'Immédiate' },
        { value: 'semaine', label: 'Cette semaine' },
        { value: 'mois', label: 'Ce mois-ci' },
        { value: 'sur_rdv', label: 'Sur rendez-vous' },
      ],
    },
  ],

  // ── EPICERIE ────────────────────────────────────────────────────────────────
  epicerie: [
    {
      key: 'quantity', label: 'Quantité disponible', type: 'select', icon: '📦', noFilter: true,
      options: [
        { value: 'detail', label: 'Vente au détail' },
        { value: 'gros', label: 'Vente en gros' },
        { value: 'demi', label: 'Demi-gros' },
      ],
    },
    { key: 'expiry', label: 'Date limite', type: 'text', icon: '🗓️', noFilter: true },
    { key: 'organic', label: 'Produit bio / naturel', type: 'toggle', icon: '🌿' },
  ],

  // ── PHARMA ──────────────────────────────────────────────────────────────────
  pharma: [
    {
      key: 'skin_type', label: 'Type de peau', type: 'select', icon: '🧴',
      options: [
        { value: 'normale', label: 'Peau normale' },
        { value: 'seche', label: 'Peau sèche' },
        { value: 'grasse', label: 'Peau grasse' },
        { value: 'mixte', label: 'Peau mixte' },
        { value: 'sensible', label: 'Peau sensible' },
        { value: 'tous', label: 'Tous types' },
      ],
    },
    {
      key: 'volume', label: 'Volume / Contenance', type: 'number',
      icon: '⚗️', unit: 'ml', min: 1, max: 5000, noFilter: true,
    },
  ],

  // ── LINGERIE & ACCESSOIRES (18+) ────────────────────────────────────────────
  lingerie: [
    {
      key: 'genre', label: 'Genre', type: 'select', icon: '👤', required: true,
      options: [
        { value: 'femme', label: 'Femme' },
        { value: 'homme', label: 'Homme' },
        { value: 'unisex', label: 'Unisexe' },
      ],
    },
    {
      key: 'taille', label: 'Taille', type: 'select', icon: '📏', required: true,
      options: [
        { value: 'XS', label: 'XS' },
        { value: 'S', label: 'S' },
        { value: 'M', label: 'M' },
        { value: 'L', label: 'L' },
        { value: 'XL', label: 'XL' },
        { value: 'XXL', label: 'XXL' },
        { value: 'XXXL', label: 'XXXL' },
        { value: 'unique', label: 'Taille unique' },
      ],
    },
    {
      // Bonnet uniquement pertinent pour lingerie féminine
      key: 'bonnet', label: 'Bonnet (soutien-gorge)', type: 'select', icon: '🔡', noFilter: true,
      options: [
        { value: 'A', label: 'Bonnet A' },
        { value: 'B', label: 'Bonnet B' },
        { value: 'C', label: 'Bonnet C' },
        { value: 'D', label: 'Bonnet D' },
        { value: 'E', label: 'Bonnet E' },
        { value: 'F', label: 'Bonnet F et +' },
        { value: 'autre', label: 'Autre / Non applicable' },
      ],
    },
    {
      key: 'type_article', label: "Type d'article", type: 'select', icon: '🏷️', required: true,
      options: [
        { value: 'soutien_gorge', label: 'Soutien-gorge' },
        { value: 'culotte', label: 'Culotte / Slip' },
        { value: 'ensemble', label: 'Ensemble (haut + bas)' },
        { value: 'nuisette', label: 'Nuisette / Babydoll' },
        { value: 'body', label: 'Body' },
        { value: 'corset', label: 'Corset / Guêpière' },
        { value: 'maillot', label: 'Maillot de bain' },
        { value: 'pyjama', label: 'Pyjama / Nuisette longue' },
        { value: 'boxer', label: 'Boxer / Caleçon' },
        { value: 'accessoire', label: 'Accessoire de mode' },
        { value: 'autre', label: 'Autre' },
      ],
    },
    {
      key: 'matiere', label: 'Matière', type: 'select', icon: '🧵', noFilter: true,
      options: [
        { value: 'coton', label: 'Coton' },
        { value: 'dentelle', label: 'Dentelle' },
        { value: 'satin', label: 'Satin' },
        { value: 'soie', label: 'Soie' },
        { value: 'microfibre', label: 'Microfibre' },
        { value: 'modal', label: 'Modal / Bambou' },
        { value: 'synthétique', label: 'Synthétique' },
      ],
    },
    {
      key: 'couleur', label: 'Couleur', type: 'select', icon: '🎨', noFilter: true,
      options: [
        { value: 'noir', label: 'Noir' },
        { value: 'blanc', label: 'Blanc' },
        { value: 'rouge', label: 'Rouge' },
        { value: 'rose', label: 'Rose' },
        { value: 'beige', label: 'Beige / Nude' },
        { value: 'bordeaux', label: 'Bordeaux' },
        { value: 'bleu', label: 'Bleu' },
        { value: 'vert', label: 'Vert' },
        { value: 'multicolore', label: 'Multicolore / Imprimé' },
        { value: 'autre', label: 'Autre' },
      ],
    },
    {
      key: 'lot', label: 'Vendu en lot / pack',
      type: 'toggle', icon: '📦', noFilter: true,
    },
    {
      key: 'neuf_etiquette', label: 'Neuf avec étiquette',
      type: 'toggle', icon: '🏷️', noFilter: true,
    },
  ],

}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const CATEGORIES_WITHOUT_CONDITION: string[] = [
  'services',
  'epicerie',
  'location',
  'immobilier',
]

export const CATEGORIES_WITHOUT_BRAND: string[] = [
  'services',
  'epicerie',
  'bebe',
  'pharma',
  'immobilier',
  'location',
  'lingerie',
]

export function getFieldSchema(categoryId: string): CategoryField[] {
  return FIELD_SCHEMAS[categoryId] ?? []
}

export function getFilterableFields(categoryId: string): CategoryField[] {
  return getFieldSchema(categoryId).filter(f => !f.noFilter)
}