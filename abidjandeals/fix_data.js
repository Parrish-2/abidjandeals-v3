const fs = require('fs');

const content = `export const CATEGORIES = [
  {
    id: 'cat_tech',
    name: 'High-Tech',
    icon: '\u{1F4F1}',
    color: '#6366f1',
    subcats: [
      'T\u00e9l\u00e9phones & Accessoires',
      'Ordinateurs & Tablettes',
      'TV & Audio',
      'Jeux Vid\u00e9o',
      'Photo & Vid\u00e9o',
      'Objets Connect\u00e9s',
      'Cameras',
      'Pi\u00e8ces & P\u00e9riph\u00e9riques',
    ],
  },
  {
    id: 'cat_auto',
    name: 'Automobile',
    icon: '\u{1F697}',
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
    icon: '\u{1F3E0}',
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
    icon: '\u{1F6E0}\uFE0F',
    color: '#8b5cf6',
    subcats: [
      'Freelance IT & Design',
      'Cours & Formations',
      'BTP & Services b\u00e2timent',
      "Offres d'emploi",
      'Services divers',
    ],
  },
  {
    id: 'cat_maison',
    name: 'Maison & \u00c9quipement',
    icon: '\u{1F3E1}',
    color: '#06b6d4',
    subcats: [
      '\u00c9lectrom\u00e9nager',
      'Meubles',
      'D\u00e9coration',
      'Jardin & Bricolage',
      'Autres \u00e9quipements de maison',
    ],
  },
  {
    id: 'cat_mode',
    name: 'Mode & Accessoires',
    icon: '\u{1F455}',
    color: '#f97316',
    subcats: [
      'V\u00eatements femme',
      'V\u00eatements homme',
      'Lingerie & Sous-v\u00eatements',
      'Chaussures',
      'Sacs & Accessoires',
      'Montres & Bijoux',
    ],
  },
  {
    id: 'cat_beaute',
    name: 'Beaut\u00e9 & Bien-\u00eatre',
    icon: '\u{1F484}',
    color: '#ec4899',
    subcats: [
      'Cosm\u00e9tiques (cr\u00e8mes, maquillage, soins visage...)',
      'Parfums (eaux de parfum, d\u00e9odorants parfum\u00e9s...)',
      'Soins du corps (laits, huiles, gommages...)',
      'Coiffure & Cheveux',
    ],
  },
  {
    id: 'cat_adulte',
    name: 'Bien-\u00eatre & Intimit\u00e9',
    icon: '\u2764\uFE0F',
    color: '#f43f5e',
    isAdult: true,
    subcats: [
      'Bien-\u00eatre du couple',
      'Lubrifiants & Gels intimes',
      'Hygi\u00e8ne intime',
      'Accessoires de massage',
      'Accessoires pour adultes',
    ],
  },
  {
    id: 'cat_bebe',
    name: 'B\u00e9b\u00e9 & Maman',
    icon: '\u{1F476}',
    color: '#f59e0b',
    subcats: [
      'V\u00eatements b\u00e9b\u00e9',
      'Chaussures b\u00e9b\u00e9',
      'Jouets & \u00c9veil',
      'Accessoires b\u00e9b\u00e9',
      'Articles pour maman',
    ],
  },
  {
    id: 'cat_epicerie',
    name: '\u00c9picerie & Produits locaux',
    icon: '\u{1F6D2}',
    color: '#84cc16',
    subcats: [
      'Produits alimentaires',
      'Boissons (eau, jus, sodas...)',
      'Produits locaux (atti\u00e9k\u00e9, huile rouge, soumbara...)',
    ],
  },
  {
    id: 'cat_sport',
    name: 'Sport & Loisirs',
    icon: '\u26BD',
    color: '#14b8a6',
    subcats: [
      '\u00c9quipements sportifs',
      'Fitness & Musculation',
      'Jeux & Loisirs',
    ],
  },
]

export const CITIES = [
  '\u{1F30D} Toute la CI',
  '\u{1F3D9}\uFE0F Abidjan',
  '\u{1F307} Bouak\u00e9',
  '\u{1F3DB}\uFE0F Yamoussoukro',
  '\u{2693} San-P\u00e9dro',
  '\u{1F333} Daloa',
  '\u{1F334} Korhogo',
  '\u{26F0}\uFE0F Man',
  '\u{1F30A} Gagnoa',
]

export const MOCK_ADS = [
  { id: 1, title: 'iPhone 15 Pro Max 256Go', price: 750000, category: 'cat_tech', subcategory: 'T\u00e9l\u00e9phones & Accessoires', city: 'Abidjan', quartier: 'Cocody', etat: 'Neuf', seller: 'Kofi Tech', certified: true, views: 342, badge: 'boost', img: 'https://images.unsplash.com/photo-1696446701796-da61339ab2e4?w=400&h=300&fit=crop', emoji: '\u{1F4F1}' },
  { id: 2, title: 'MacBook Pro M3 14"', price: 1200000, category: 'cat_tech', subcategory: 'Ordinateurs & Tablettes', city: 'Abidjan', quartier: 'Plateau', etat: 'Bon \u00e9tat', seller: 'DigiStore CI', certified: true, views: 215, badge: 'pro', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', emoji: '\u{1F4BB}' },
  { id: 3, title: 'Toyota RAV4 2021 Full Options', price: 18500000, category: 'cat_auto', subcategory: "Voitures d'occasion", city: 'Abidjan', quartier: 'Marcory', etat: 'Bon \u00e9tat', seller: 'AutoDeal CI', certified: true, views: 892, badge: 'boost', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop', emoji: '\u{1F697}' },
  { id: 4, title: 'Villa F5 Cocody Riviera 3', price: 95000000, category: 'cat_immo', subcategory: 'Maisons', city: 'Abidjan', quartier: 'Riviera', etat: 'Neuf', seller: 'ImmoCI Premium', certified: true, views: 654, badge: 'new', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop', emoji: '\u{1F3E0}' },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CI').format(price) + ' FCFA'
}

export function getCategoryById(id: string) {
  return CATEGORIES.find(c => c.id === id)
}
`;

fs.writeFileSync('src/lib/data.ts', content, { encoding: 'utf8' });
console.log('\u2705 data.ts mis \u00e0 jour avec succ\u00e8s !');
