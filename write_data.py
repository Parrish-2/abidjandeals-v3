content = """export const CATEGORIES = [
  {
    id: 'cat_tech',
    name: 'High-Tech',
    icon: '📱',
    color: '#6366f1',
    subcats: ['Téléphones & Accessoires', 'Ordinateurs & Tablettes', 'TV & Audio', 'Jeux vidéo', 'Photo & Vidéo', 'Objets connectés'],
  },
  {
    id: 'cat_auto',
    name: 'Automobile & Industrie',
    icon: '🚗',
    color: '#ef4444',
    subcats: ['Voitures', 'Camions & Utilitaires', 'Pièces & Accessoires', 'Motos', 'Bateaux', 'Équipement industriel'],
    requiresCertified: true,
  },
  {
    id: 'cat_immo',
    name: 'Immobilier',
    icon: '🏠',
    color: '#10b981',
    subcats: ['Appartements à vendre', 'Maisons à vendre', 'Terrains', 'Bureaux commerciaux', 'Locations longue durée'],
    requiresCertified: true,
  },
  {
    id: 'cat_location',
    name: 'Location & Mobilité',
    icon: '🔑',
    color: '#f59e0b',
    subcats: ['Location voitures & 4x4', 'Location bus & minibus', 'Salles de fête', 'Chapiteaux & tentes', 'Sono & lumières', 'Matériel événementiel'],
    requiresConfirmed: true,
  },
  {
    id: 'cat_serv',
    name: 'Services & Autres',
    icon: '🔧',
    color: '#8b5cf6',
    subcats: ['Informatique & Tech', 'Beauté & Bien-être', 'Cours & Formation', 'BTP & Artisanat', 'Transport & Livraison', 'Santé'],
  },
  {
    id: 'cat_elec',
    name: 'Électroménager',
    icon: '📺',
    color: '#06b6d4',
    subcats: ['Réfrigérateurs', 'Climatiseurs', 'Machines à laver', 'Cuisinières', 'Petits appareils'],
  },
  {
    id: 'cat_bebe',
    name: 'Bébé & Mamans',
    icon: '👶',
    color: '#ec4899',
    subcats: ['Vêtements bébé', 'Poussettes & Sièges', 'Jouets', 'Alimentation', 'Chambre bébé'],
  },
  {
    id: 'cat_pharma',
    name: 'Parapharmacie',
    icon: '💊',
    color: '#14b8a6',
    subcats: ['Soins visage', 'Soins corps', 'Compléments alimentaires', 'Hygiène'],
  },
  {
    id: 'cat_epicerie',
    name: 'Épicerie & Boissons',
    icon: '🛒',
    color: '#f97316',
    subcats: ['Alimentation sèche', 'Boissons', 'Produits locaux CI', 'Bio & Naturel'],
  },
  {
    id: 'cat_lingerie',
    name: 'Lingerie & Accessoires',
    icon: '👙',
    color: '#f43f5e',
    isAdult: true,
    subcats: [
      'Lingerie & Sous-vêtements',
      'Mallots de bain',
      'Cosmétiques & Bien-être',
      'Accessoires de mode',
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
  { id: 3, title: 'Toyota RAV4 2021 Full Options', price: 18500000, category: 'cat_auto', subcategory: 'Voitures', city: 'Abidjan', quartier: 'Marcory', etat: 'Bon état', seller: 'AutoDeal CI', certified: true, views: 892, badge: 'boost', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop', emoji: '🚗' },
  { id: 4, title: 'Villa F5 Cocody Riviera 3', price: 95000000, category: 'cat_immo', subcategory: 'Maisons à vendre', city: 'Abidjan', quartier: 'Riviera', etat: 'Neuf', seller: 'ImmoCI Premium', certified: true, views: 654, badge: 'new', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop', emoji: '🏠' },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CI').format(price) + ' FCFA'
}

export function getCategoryById(id: string) {
  return CATEGORIES.find(c => c.id === id)
}
"""

with open('src/lib/data.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done! data.ts written with correct Supabase IDs.')
