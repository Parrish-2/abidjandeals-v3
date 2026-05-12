// SOURCE DE VÉRITÉ — AbidjanDeals
// Les subcats sont des strings = slug exact en DB (utilisé dans URL et filtre ads.subcategory)
// Le label affiché est géré par SUB_LABELS dans MegaMenu.tsx

export const CATEGORIES = [
  {
    id: 'cat_tech',
    name: 'High-Tech',
    icon: '📱',
    color: '#6366f1',
    subcats: [
      'telephones-accessoires',
      'ordinateurs',
      'tablettes',
      'tv-son',
      'photo-video',       // Fusion : photo-video + cameras
      'consoles-jeux',
      'objets-connectes',
      'composants',
    ],
  },
  {
    id: 'cat_auto',
    name: 'Automobile',
    icon: '🚗',
    color: '#ef4444',
    subcats: [
      'voitures-d-occasion',
      'voitures-neuves',
      'motos-scooters',
      'pieces-detachees-pneus',   // Fusion : pièces détachées & pneus
      'location-auto',
      'camions-utilitaires',
      'groupes-electrogenes',
      'outillage-industriel',
      'engins-chantier',
    ],
    requiresCertified: true,
  },
  {
    id: 'cat_immo',
    name: 'Immobilier',
    icon: '🏠',
    color: '#10b981',
    subcats: [
      'vente-appartement',
      'vente-maison-villa',
      'location-meublee',
      'maison-a-louer',
      'colocation',
      'terrains-acd',             // Corrigé : terrains avec ACD
      'bureaux-boutiques',
    ],
    requiresCertified: true,
  },
  {
    id: 'cat_serv',
    name: 'Services',
    icon: '🛠️',
    color: '#8b5cf6',
    subcats: [
      'freelance-it',
      'batiment',
      'cours-formation',
      'offres-emploi',
      'transport',
      'menage',
      'evenementiel',
    ],
  },
  {
    id: 'cat_maison',
    name: 'Maison & Équipement',
    icon: '🏡',
    color: '#06b6d4',
    subcats: ['meubles', 'electromenager', 'decoration', 'jardin-bricolage'],
  },
  {
    id: 'cat_mode',
    name: 'Mode & Accessoires',
    icon: '👕',
    color: '#f97316',
    subcats: ['vetements', 'chaussures', 'sacs-accessoires', 'montres', 'cosmetiques'],
  },
  {
    id: 'cat_beaute',
    name: 'Beauté & Bien-être',
    icon: '💄',
    color: '#ec4899',
    subcats: [
      'soins-visage',
      'soins-corps',
      'parfums',
      'complements-alimentaires',
      'materiel-coiffure',
    ],
  },
  {
    id: 'cat_sport',
    name: 'Sport & Loisirs',
    icon: '⚽',
    color: '#14b8a6',
    subcats: ['equipements-sport', 'instruments-musique', 'jouets', 'voyages', 'velos'],
  },
  {
    id: 'cat_autres',
    name: 'Autres & Divers',
    icon: '📦',
    color: '#64748b',
    subcats: ['animaux', 'collection', 'inclassables'],
  },
  {
    id: 'cat_adulte',
    name: 'Bien-être & Intimité',
    icon: '❤️',
    color: '#f43f5e',
    isAdult: true,
    subcats: [
      'lingerie-sous-vetements',
      'maillots-de-bain',
      'cosmetiques-bien-etre',
      'accessoires-mode',
    ],
  },
]

export const CITIES = [
  '🌍 Toute la CI',
  '🏙️ Abidjan',
  '🌇 Bouaké',
  '🏛️ Yamoussoukro',
  '⚓ San-Pédro',
  '🌳 Daloa',
  '🌴 Korhogo',
  '⛰️ Man',
  '🌊 Gagnoa',
]
