export const CATEGORIES = [
  {
    id: 'cat_tech',
    name: 'High-Tech',
    icon: '📱',
    color: '#6366f1',
    subcats: [
      'Téléphones & Accessoires',
      'Ordinateurs & Tablettes',
      'TV & Audio',
      'Jeux Vidéo',
      'Photo & Vidéo',
      'Objets Connectés',
      'Cameras',
      'Pièces & Périphériques',
    ],
  },
  {
    id: 'cat_auto',
    name: 'Automobile',
    icon: '🚗',
    color: '#ef4444',
    subcats: [
      "Voitures d'occasion",
      'Motos',
      'Camions & Utilitaires',
      'Location',
    ],
    requiresCertified: true,
  },
  {
    id: 'cat_immo',
    name: 'Immobilier',
    icon: '🏠',
    color: '#10b981',
    subcats: [
      'Vente de terrains',
      'Maisons',
      'Appartements',
      'Bureaux',
      'Colocation',
    ],
    requiresCertified: true,
  },
  {
    id: 'cat_serv',
    name: 'Services',
    icon: '🛠️',
    color: '#8b5cf6',
    subcats: [
      'Freelance IT & Design',
      'Cours & Formations',
      'BTP & Services bâtiment',
      "Offres d'emploi",
      'Services divers',
    ],
  },
  {
    id: 'cat_maison',
    name: 'Maison & Équipement',
    icon: '🏡',
    color: '#06b6d4',
    subcats: [
      'Électroménager',
      'Meubles',
      'Décoration',
      'Jardin & Bricolage',
      'Autres équipements de maison',
    ],
  },
  {
    id: 'cat_mode',
    name: 'Mode & Accessoires',
    icon: '👕',
    color: '#f97316',
    subcats: [
      'Vêtements femme',
      'Vêtements homme',
      'Lingerie & Sous-vêtements',
      'Chaussures',
      'Sacs & Accessoires',
      'Montres & Bijoux',
    ],
  },
  {
    id: 'cat_beaute',
    name: 'Beauté & Bien-être',
    icon: '💄',
    color: '#ec4899',
    subcats: [
      'Cosmétiques (crèmes, maquillage, soins visage...)',
      'Parfums (eaux de parfum, déodorants parfumés...)',
      'Soins du corps (laits, huiles, gommages...)',
      'Coiffure & Cheveux',
    ],
  },
  {
    id: 'cat_adulte',
    name: 'Bien-être & Intimité',
    icon: '❤️',
    color: '#f43f5e',
    isAdult: true,
    subcats: [
      'Bien-être du couple',
      'Lubrifiants & Gels intimes',
      'Hygiène intime',
      'Accessoires de massage',
      'Accessoires pour adultes',
    ],
  },
  {
    id: 'cat_bebe',
    name: 'Bébé & Maman',
    icon: '👶',
    color: '#f59e0b',
    subcats: [
      'Vêtements bébé',
      'Chaussures bébé',
      'Jouets & Éveil',
      'Accessoires bébé',
      'Articles pour maman',
    ],
  },
  {
    id: 'cat_epicerie',
    name: 'Épicerie & Produits locaux',
    icon: '🛒',
    color: '#84cc16',
    subcats: [
      'Produits alimentaires',
      'Boissons (eau, jus, sodas...)',
      'Produits locaux (attiéké, huile rouge, soumbara...)',
    ],
  },
  {
    id: 'cat_sport',
    name: 'Sport & Loisirs',
    icon: '⚽',
    color: '#14b8a6',
    subcats: [
      'Équipements sportifs',
      'Fitness & Musculation',
      'Jeux & Loisirs',
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

export const MOCK_ADS = [
  { id: 1, title: 'iPhone 15 Pro Max 256Go', price: 750000, category: 'cat_tech', subcategory: 'Téléphones & Accessoires', city: 'Abidjan', quartier: 'Cocody', etat: 'Neuf', seller: 'Kofi Tech', certified: true, views: 342, badge: 'boost', img: 'https://images.unsplash.com/photo-1696446701796-da61339ab2e4?w=400&h=300&fit=crop', emoji: '📱' },
  { id: 2, title: 'MacBook Pro M3 14"', price: 1200000, category: 'cat_tech', subcategory: 'Ordinateurs & Tablettes', city: 'Abidjan', quartier: 'Plateau', etat: 'Bon état', seller: 'DigiStore CI', certified: true, views: 215, badge: 'pro', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', emoji: '💻' },
  { id: 3, title: 'Toyota RAV4 2021 Full Options', price: 18500000, category: 'cat_auto', subcategory: "Voitures d'occasion", city: 'Abidjan', quartier: 'Marcory', etat: 'Bon état', seller: 'AutoDeal CI', certified: true, views: 892, badge: 'boost', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop', emoji: '🚗' },
  { id: 4, title: 'Villa F5 Cocody Riviera 3', price: 95000000, category: 'cat_immo', subcategory: 'Maisons', city: 'Abidjan', quartier: 'Riviera', etat: 'Neuf', seller: 'ImmoCI Premium', certified: true, views: 654, badge: 'new', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop', emoji: '🏠' },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CI').format(price) + ' FCFA'
}

export function getCategoryById(id: string) {
  return CATEGORIES.find(c => c.id === id)
}
