const fs = require('fs');

const content = `export const CATEGORIES = [
  {
    id: 'cat_tech',
    name: 'High-Tech',
    icon: '\u{1F4F1}',
    color: '#6366f1',
    subcats: ['T\u00e9l\u00e9phones & Accessoires', 'Ordinateurs & Tablettes', 'TV & Audio', 'Jeux vid\u00e9o', 'Photo & Vid\u00e9o', 'Objets connect\u00e9s'],
  },
  {
    id: 'cat_auto',
    name: 'Automobile & Industrie',
    icon: '\u{1F697}',
    color: '#ef4444',
    subcats: ['Voitures', 'Camions & Utilitaires', 'Pi\u00e8ces & Accessoires', 'Motos', 'Bateaux', '\u00c9quipement industriel'],
    requiresCertified: true,
  },
  {
    id: 'cat_immo',
    name: 'Immobilier',
    icon: '\u{1F3E0}',
    color: '#10b981',
    subcats: ['Appartements \u00e0 vendre', 'Maisons \u00e0 vendre', 'Terrains', 'Bureaux commerciaux', 'Locations longue dur\u00e9e'],
    requiresCertified: true,
  },
  {
    id: 'cat_location',
    name: 'Location & Mobilit\u00e9',
    icon: '\u{1F511}',
    color: '#f59e0b',
    subcats: ['Location voitures & 4x4', 'Location bus & minibus', 'Salles de f\u00eate', 'Chapiteaux & tentes', 'Sono & lumi\u00e8res', 'Mat\u00e9riel \u00e9v\u00e9nementiel'],
    requiresConfirmed: true,
  },
  {
    id: 'cat_serv',
    name: 'Services & Autres',
    icon: '\u{1F527}',
    color: '#8b5cf6',
    subcats: ['Informatique & Tech', 'Beaut\u00e9 & Bien-\u00eatre', 'Cours & Formation', 'BTP & Artisanat', 'Transport & Livraison', 'Sant\u00e9'],
  },
  {
    id: 'cat_elec',
    name: '\u00c9lectrom\u00e9nager',
    icon: '\u{1F4FA}',
    color: '#06b6d4',
    subcats: ['R\u00e9frig\u00e9rateurs', 'Climatiseurs', 'Machines \u00e0 laver', 'Cuisini\u00e8res', 'Petits appareils'],
  },
  {
    id: 'cat_bebe',
    name: 'B\u00e9b\u00e9 & Mamans',
    icon: '\u{1F476}',
    color: '#ec4899',
    subcats: ['V\u00eatements b\u00e9b\u00e9', 'Poussettes & Si\u00e8ges', 'Jouets', 'Alimentation', 'Chambre b\u00e9b\u00e9'],
  },
  {
    id: 'cat_pharma',
    name: 'Parapharmacie',
    icon: '\u{1F48A}',
    color: '#14b8a6',
    subcats: ['Soins visage', 'Soins corps', 'Compl\u00e9ments alimentaires', 'Hygi\u00e8ne'],
  },
  {
    id: 'cat_epicerie',
    name: '\u00c9picerie & Boissons',
    icon: '\u{1F6D2}',
    color: '#f97316',
    subcats: ['Alimentation s\u00e8che', 'Boissons', 'Produits locaux CI', 'Bio & Naturel'],
  },
  {
    id: 'cat_lingerie',
    name: 'Lingerie & Accessoires',
    icon: '\u{1F459}',
    color: '#f43f5e',
    isAdult: true,
    subcats: ['Lingerie & Sous-v\u00eatements', 'Mallots de bain', 'Cosm\u00e9tiques & Bien-\u00eatre', 'Accessoires de mode'],
  },
]

export const CITIES = [
  '\u{1F30D} Toute la CI',
  '\u{1F3D9}\u{FE0F} Abidjan',
  '\u{1F307} Bouak\u00e9',
  '\u{1F3DB}\u{FE0F} Yamoussoukro',
  '\u{2693} San-P\u00e9dro',
  '\u{1F333} Daloa',
  '\u{1F334} Korhogo',
  '\u{26F0}\u{FE0F} Man',
  '\u{1F30A} Gagnoa',
]

export const MOCK_ADS = [
  { id: 1, title: 'iPhone 15 Pro Max 256Go', price: 750000, category: 'cat_tech', subcategory: 'T\u00e9l\u00e9phones & Accessoires', city: 'Abidjan', quartier: 'Cocody', etat: 'Neuf', seller: 'Kofi Tech', certified: true, views: 342, badge: 'boost', img: 'https://images.unsplash.com/photo-1696446701796-da61339ab2e4?w=400&h=300&fit=crop', emoji: '\u{1F4F1}' },
  { id: 2, title: 'MacBook Pro M3 14"', price: 1200000, category: 'cat_tech', subcategory: 'Ordinateurs & Tablettes', city: 'Abidjan', quartier: 'Plateau', etat: 'Bon \u00e9tat', seller: 'DigiStore CI', certified: true, views: 215, badge: 'pro', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', emoji: '\u{1F4BB}' },
  { id: 3, title: 'Toyota RAV4 2021 Full Options', price: 18500000, category: 'cat_auto', subcategory: 'Voitures', city: 'Abidjan', quartier: 'Marcory', etat: 'Bon \u00e9tat', seller: 'AutoDeal CI', certified: true, views: 892, badge: 'boost', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop', emoji: '\u{1F697}' },
  { id: 4, title: 'Villa F5 Cocody Riviera 3', price: 95000000, category: 'cat_immo', subcategory: 'Maisons \u00e0 vendre', city: 'Abidjan', quartier: 'Riviera', etat: 'Neuf', seller: 'ImmoCI Premium', certified: true, views: 654, badge: 'new', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop', emoji: '\u{1F3E0}' },
  { id: 5, title: 'Samsung Galaxy S24 Ultra', price: 620000, category: 'cat_tech', subcategory: 'T\u00e9l\u00e9phones & Accessoires', city: 'Bouak\u00e9', quartier: 'Centre', etat: 'Neuf', seller: 'Mobile Plus', certified: false, views: 178, badge: null, img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop', emoji: '\u{1F4F1}' },
  { id: 6, title: 'Climatiseur Midea 1.5CV Inverter', price: 285000, category: 'cat_elec', subcategory: 'Climatiseurs', city: 'Abidjan', quartier: 'Yopougon', etat: 'Neuf', seller: 'ElectroCIV', certified: false, views: 412, badge: 'urgent', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop', emoji: '\u2744\uFE0F' },
  { id: 7, title: 'Salle de f\u00eate 300 personnes', price: 350000, category: 'cat_location', subcategory: 'Salles de f\u00eate', city: 'Abidjan', quartier: 'Abobo', etat: 'Disponible', seller: 'EventSpace CI', certified: true, views: 267, badge: 'boost', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop', emoji: '\u{1F389}' },
  { id: 8, title: 'Cours de D\u00e9veloppement Web', price: 150000, category: 'cat_serv', subcategory: 'Cours & Formation', city: 'Yamoussoukro', quartier: 'Habitat', etat: 'Disponible', seller: 'TechAcademy CI', certified: false, views: 156, badge: null, img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop', emoji: '\u{1F4BB}' },
  { id: 9, title: 'R\u00e9frig\u00e9rateur LG 350L NoFrost', price: 420000, category: 'cat_elec', subcategory: 'R\u00e9frig\u00e9rateurs', city: 'Abidjan', quartier: 'Treichville', etat: 'Neuf', seller: 'Electro Discount', certified: false, views: 198, badge: 'new', img: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop', emoji: '\u{1F9CA}' },
  { id: 10, title: 'Terrain 500m\u00b2 Bingerville', price: 12000000, category: 'cat_immo', subcategory: 'Terrains', city: 'Abidjan', quartier: 'Bingerville', etat: 'Disponible', seller: 'FonciCI', certified: true, views: 445, badge: null, img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop', emoji: '\u{1F331}' },
  { id: 11, title: 'PS5 + 3 jeux', price: 480000, category: 'cat_tech', subcategory: 'Jeux vid\u00e9o', city: 'Abidjan', quartier: 'Cocody', etat: 'Bon \u00e9tat', seller: 'GameZone CI', certified: false, views: 523, badge: 'boost', img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop', emoji: '\u{1F3AE}' },
  { id: 12, title: 'Location minibus 30 places', price: 80000, category: 'cat_location', subcategory: 'Location bus & minibus', city: 'Bouak\u00e9', quartier: 'Commerce', etat: 'Disponible', seller: 'TransportCI', certified: true, views: 134, badge: null, img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop', emoji: '\u{1F68C}' },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CI').format(price) + ' FCFA'
}

export function getCategoryById(id: string) {
  return CATEGORIES.find(c => c.id === id)
}
`;

fs.writeFileSync('src/lib/data.ts', content, { encoding: 'utf8' });
console.log('data.ts reecrit avec succes !');
