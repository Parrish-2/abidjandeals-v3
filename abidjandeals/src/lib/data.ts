// ─────────────────────────────────────────────────────────────────────────────
// SOURCE DE VÉRITÉ — AbidjanDeals
// Chaque subcat possède :
//   • name  : label affiché dans le MegaMenu
//   • slug  : slug EXACT stocké dans la colonne `slug` de la table `sub_categories`
//             en base Supabase. NE PAS modifier sans mettre à jour la DB.
// ─────────────────────────────────────────────────────────────────────────────

export interface SubCatDef {
  name: string   // Label d'affichage
  slug: string   // Slug DB exact → utilisé dans l'URL (?sub=<slug>)
}

export interface CategoryDef {
  id: string
  name: string
  icon: string
  color: string
  subcats: SubCatDef[]
  requiresCertified?: boolean
  isAdult?: boolean
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'cat_tech',
    name: 'High-Tech',
    icon: '📱',
    color: '#6366f1',
    subcats: [
      { name: 'Téléphones & Accessoires', slug: 'telephones-accessoires' },
      { name: 'Ordinateurs & Laptops', slug: 'ordinateurs' },
      { name: 'Tablettes', slug: 'tablettes' },
      { name: 'TV & Home Cinéma', slug: 'tv-son' },
      { name: 'Photo & Vidéo', slug: 'photo-video' },
      { name: 'Consoles & Jeux Vidéo', slug: 'consoles-jeux' },
      { name: 'Objets Connectés', slug: 'objets-connectes' },
      { name: 'Cameras', slug: 'cameras' },
      { name: 'Pièces & Périphériques', slug: 'composants' },
    ],
  },
  {
    id: 'cat_auto',
    name: 'Automobile',
    icon: '🚗',
    color: '#ef4444',
    subcats: [
      { name: "Voitures d'occasion", slug: 'voitures-d-occasion' },
      { name: 'Voitures Neuves', slug: 'voitures-neuves' },
      { name: 'Motos & Scooters', slug: 'motos-scooters' },
      { name: 'Pièces détachées & Pneus', slug: 'pieces-pneus' },
      { name: 'Location Auto', slug: 'location-auto' },
      { name: 'Camions & Utilitaires', slug: 'camions-utilitaires' },
      { name: 'Groupes Électrogènes', slug: 'groupes-electrogenes' },
      { name: 'Matériel Agricole', slug: 'materiel-agricole' },
      { name: 'Outillage Industriel', slug: 'outillage-industriel' },
      { name: 'Engins de Chantier', slug: 'engins-chantier' },
    ],
    requiresCertified: true,
  },
  {
    id: 'cat_immo',
    name: 'Immobilier',
    icon: '🏠',
    color: '#10b981',
    subcats: [
      { name: 'Vente Appartements', slug: 'vente-appartement' },
      { name: 'Vente Maisons & Villas', slug: 'vente-maison-villa' },
      { name: 'Location Meublée', slug: 'location-meublee' },
      { name: 'Location Vide', slug: 'location-vide' },
      { name: 'Colocation', slug: 'colocation' },
      { name: 'Terrains avec ACD', slug: 'terrains' },
      { name: 'Bureaux & Commerces', slug: 'bureaux-boutiques' },
    ],
    requiresCertified: true,
  },
  {
    id: 'cat_serv',
    name: 'Services',
    icon: '🛠️',
    color: '#8b5cf6',
    subcats: [
      { name: 'Freelance IT & Design', slug: 'freelance-it' },
      { name: 'BTP & Artisanat', slug: 'batiment' },
      { name: 'Cours & Formations', slug: 'cours-formation' },
      { name: "Offres d'Emploi", slug: 'offres-emploi' },
      { name: 'Transport & Livraison', slug: 'transport' },
      { name: 'Ménage & Nettoyage', slug: 'menage' },
      { name: 'Sécurité & Gardiennage', slug: 'securite' },
      { name: 'Événementiel', slug: 'evenementiel' },
    ],
  },
  {
    id: 'cat_maison',
    name: 'Maison & Équipement',
    icon: '🏡',
    color: '#06b6d4',
    subcats: [
      { name: 'Meubles', slug: 'meubles' },
      { name: 'Électroménager', slug: 'electromenager' },
      { name: 'Décoration', slug: 'decoration' },
      { name: 'Jardin & Bricolage', slug: 'jardin-bricolage' },
    ],
  },
  {
    id: 'cat_mode',
    name: 'Mode & Accessoires',
    icon: '👕',
    color: '#f97316',
    subcats: [
      { name: 'Vêtements & Chaussures', slug: 'vetements' },
      { name: 'Chaussures', slug: 'chaussures' },
      { name: 'Sacs & Accessoires', slug: 'sacs-accessoires' },
      { name: 'Montres & Bijoux', slug: 'montres' },
      { name: 'Cosmétiques & Parfums', slug: 'cosmetiques' },
    ],
  },
  {
    id: 'cat_sport',
    name: 'Sport & Loisirs',
    icon: '⚽',
    color: '#14b8a6',
    subcats: [
      { name: 'Équipements de Sport', slug: 'equipements-sport' },
      { name: 'Instruments de Musique', slug: 'instruments-musique' },
      { name: 'Jouets & Jeux', slug: 'jouets' },
      { name: 'Voyages & Tourisme', slug: 'voyages' },
      { name: 'Vélos & Trottinettes', slug: 'velos' },
    ],
  },
  {
    id: 'cat_autres',
    name: 'Autres & Divers',
    icon: '📦',
    color: '#64748b',
    subcats: [
      { name: 'Animaux & Accessoires', slug: 'animaux' },
      { name: 'Objets de Collection', slug: 'collection' },
      { name: 'Inclassables', slug: 'inclassables' },
    ],
  },
  {
    id: 'cat_adulte',
    name: 'Bien-être & Intimité',
    icon: '❤️',
    color: '#f43f5e',
    isAdult: true,
    subcats: [
      { name: 'Lingerie & Sous-vêtements', slug: 'lingerie-sous-vetements' },
      { name: 'Maillots de Bain', slug: 'maillots-de-bain' },
      { name: 'Cosmétiques & Bien-être', slug: 'cosmetiques-bien-etre' },
      { name: 'Accessoires Mode', slug: 'accessoires-mode' },
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
