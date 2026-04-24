export const CATEGORIES = [
  {
    id: 'cat_tech',
    name: 'High-Tech',
    icon: 'ðŸ“±',
    color: '#6366f1',
    subcats: ['TÃ©lÃ©phones & Accessoires', 'Ordinateurs & Tablettes', 'TV & Audio', 'Jeux vidÃ©o', 'Photo & VidÃ©o', 'Objets connectÃ©s'],
  },
  {
    id: 'cat_auto',
    name: 'Automobile & Industrie',
    icon: 'ðŸš—',
    color: '#ef4444',
    subcats: ['Voitures', 'Camions & Utilitaires', 'PiÃ¨ces & Accessoires', 'Motos', 'Bateaux', 'Ã‰quipement industriel'],
    requiresCertified: true,
  },
  {
    id: 'cat_immo',
    name: 'Immobilier',
    icon: 'ðŸ ',
    color: '#10b981',
    subcats: ['Appartements Ã  vendre', 'Maisons Ã  vendre', 'Terrains', 'Bureaux commerciaux', 'Locations longue durÃ©e'],
    requiresCertified: true,
  },
  {
    id: 'cat_location',
    name: 'Location & MobilitÃ©',
    icon: 'ðŸ”‘',
    color: '#f59e0b',
    subcats: ['Location voitures & 4x4', 'Location bus & minibus', 'Salles de fÃªte', 'Chapiteaux & tentes', 'Sono & lumiÃ¨res', 'MatÃ©riel Ã©vÃ©nementiel'],
    requiresConfirmed: true,
  },
  {
    id: 'cat_serv',
    name: 'Services & Autres',
    icon: 'ðŸ”§',
    color: '#8b5cf6',
    subcats: ['Informatique & Tech', 'BeautÃ© & Bien-Ãªtre', 'Cours & Formation', 'BTP & Artisanat', 'Transport & Livraison', 'SantÃ©'],
  },
  {
    id: 'cat_elec',
    name: 'Ã‰lectromÃ©nager',
    icon: 'ðŸ“º',
    color: '#06b6d4',
    subcats: ['RÃ©frigÃ©rateurs', 'Climatiseurs', 'Machines Ã  laver', 'CuisiniÃ¨res', 'Petits appareils'],
  },
  {
    id: 'cat_bebe',
    name: 'BÃ©bÃ© & Mamans',
    icon: 'ðŸ‘¶',
    color: '#ec4899',
    subcats: ['VÃªtements bÃ©bÃ©', 'Poussettes & SiÃ¨ges', 'Jouets', 'Alimentation', 'Chambre bÃ©bÃ©'],
  },
  {
    id: 'cat_pharma',
    name: 'Parapharmacie',
    icon: 'ðŸ’Š',
    color: '#14b8a6',
    subcats: ['Soins visage', 'Soins corps', 'ComplÃ©ments alimentaires', 'HygiÃ¨ne'],
  },
  {
    id: 'cat_epicerie',
    name: 'Ã‰picerie & Boissons',
    icon: 'ðŸ›’',
    color: '#f97316',
    subcats: ['Alimentation sÃ¨che', 'Boissons', 'Produits locaux CI', 'Bio & Naturel'],
  },
  {
    id: 'cat_lingerie',
    name: 'Lingerie & Accessoires',
    icon: 'ðŸ‘™',
    color: '#f43f5e',
    isAdult: true,
    subcats: [
      'Lingerie & Sous-vÃªtements',
      'Mallots de bain',
      'CosmÃ©tiques & Bien-Ãªtre',
      'Accessoires de mode',
    ],
  },
]

export const CITIES = [
  'ðŸŒ Toute la CI',
  'ðŸ™ï¸ Abidjan',
  'ðŸŒ‡ BouakÃ©',
  'ðŸ›ï¸ Yamoussoukro',
  'âš“ San-PÃ©dro',
  'ðŸŒ³ Daloa',
  'ðŸŒ´ Korhogo',
  'â›°ï¸ Man',
  'ðŸŒŠ Gagnoa',
]

export const MOCK_ADS = [
  { id: 1, title: 'iPhone 15 Pro Max 256Go', price: 750000, category: 'cat_tech', subcategory: 'TÃ©lÃ©phones & Accessoires', city: 'Abidjan', quartier: 'Cocody', etat: 'Neuf', seller: 'Kofi Tech', certified: true, views: 342, badge: 'boost', img: 'https://images.unsplash.com/photo-1696446701796-da61339ab2e4?w=400&h=300&fit=crop', emoji: 'ðŸ“±' },
  { id: 2, title: 'MacBook Pro M3 14"', price: 1200000, category: 'cat_tech', subcategory: 'Ordinateurs & Tablettes', city: 'Abidjan', quartier: 'Plateau', etat: 'Bon Ã©tat', seller: 'DigiStore CI', certified: true, views: 215, badge: 'pro', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop', emoji: 'ðŸ’»' },
  { id: 3, title: 'Toyota RAV4 2021 Full Options', price: 18500000, category: 'cat_auto', subcategory: 'Voitures', city: 'Abidjan', quartier: 'Marcory', etat: 'Bon Ã©tat', seller: 'AutoDeal CI', certified: true, views: 892, badge: 'boost', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop', emoji: 'ðŸš—' },
  { id: 4, title: 'Villa F5 Cocody Riviera 3', price: 95000000, category: 'cat_immo', subcategory: 'Maisons Ã  vendre', city: 'Abidjan', quartier: 'Riviera', etat: 'Neuf', seller: 'ImmoCI Premium', certified: true, views: 654, badge: 'new', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop', emoji: 'ðŸ ' },
  { id: 5, title: 'Samsung Galaxy S24 Ultra', price: 620000, category: 'cat_tech', subcategory: 'TÃ©lÃ©phones & Accessoires', city: 'BouakÃ©', quartier: 'Centre', etat: 'Neuf', seller: 'Mobile Plus', certified: false, views: 178, badge: null, img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop', emoji: 'ðŸ“±' },
  { id: 6, title: 'Climatiseur Midea 1.5CV Inverter', price: 285000, category: 'cat_elec', subcategory: 'Climatiseurs', city: 'Abidjan', quartier: 'Yopougon', etat: 'Neuf', seller: 'ElectroCIV', certified: false, views: 412, badge: 'urgent', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop', emoji: 'â„ï¸' },
  { id: 7, title: 'Salle de fÃªte 300 personnes', price: 350000, category: 'cat_location', subcategory: 'Salles de fÃªte', city: 'Abidjan', quartier: 'Abobo', etat: 'Disponible', seller: 'EventSpace CI', certified: true, views: 267, badge: 'boost', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop', emoji: 'ðŸŽ‰' },
  { id: 8, title: 'Cours de DÃ©veloppement Web', price: 150000, category: 'cat_serv', subcategory: 'Cours & Formation', city: 'Yamoussoukro', quartier: 'Habitat', etat: 'Disponible', seller: 'TechAcademy CI', certified: false, views: 156, badge: null, img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop', emoji: 'ðŸ’»' },
  { id: 9, title: 'RÃ©frigÃ©rateur LG 350L NoFrost', price: 420000, category: 'cat_elec', subcategory: 'RÃ©frigÃ©rateurs', city: 'Abidjan', quartier: 'Treichville', etat: 'Neuf', seller: 'Electro Discount', certified: false, views: 198, badge: 'new', img: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop', emoji: 'ðŸ§Š' },
  { id: 10, title: 'Terrain 500mÂ² Bingerville', price: 12000000, category: 'cat_immo', subcategory: 'Terrains', city: 'Abidjan', quartier: 'Bingerville', etat: 'Disponible', seller: 'FonciCI', certified: true, views: 445, badge: null, img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop', emoji: 'ðŸŒ¿' },
  { id: 11, title: 'PS5 + 3 jeux', price: 480000, category: 'cat_tech', subcategory: 'Jeux vidÃ©o', city: 'Abidjan', quartier: 'Cocody', etat: 'Bon Ã©tat', seller: 'GameZone CI', certified: false, views: 523, badge: 'boost', img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop', emoji: 'ðŸŽ®' },
  { id: 12, title: 'Location minibus 30 places', price: 80000, category: 'cat_location', subcategory: 'Location bus & minibus', city: 'BouakÃ©', quartier: 'Commerce', etat: 'Disponible', seller: 'TransportCI', certified: true, views: 134, badge: null, img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop', emoji: 'ðŸšŒ' },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CI').format(price) + ' FCFA'
}

export function getCategoryById(id: string) {
  return CATEGORIES.find(c => c.id === id)
}
