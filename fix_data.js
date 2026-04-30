const fs = require('fs');

const filePath = 'src/app/publier/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Nouveau bloc CATEGORY_FIELDS complet avec les 12 catégories
const newCategoryFields = `const CATEGORY_FIELDS: Record<string, CatConfig> = {
  cat_tech: {
    etats: ['Neuf', 'Reconditionn\u00e9', 'Tr\u00e8s bon \u00e9tat', 'Bon \u00e9tat', '\u00c0 r\u00e9parer'],
    extraFields: [
      { name: 'marque', label: 'Marque *', placeholder: 'Apple, Samsung, HP...' },
      { name: 'modele', label: 'Mod\u00e8le', placeholder: 'iPhone 15, Galaxy S24...' },
      { name: 'stockage', label: 'Stockage', type: 'select', options: ['32 Go', '64 Go', '128 Go', '256 Go', '512 Go', '1 To', '2 To'] },
      { name: 'ram', label: 'RAM', type: 'select', options: ['2 Go', '4 Go', '6 Go', '8 Go', '12 Go', '16 Go', '32 Go'] },
      { name: 'couleur', label: 'Couleur', placeholder: 'Noir, Blanc, Or...' },
    ],
  },
  cat_auto: {
    etats: ['Neuf', 'Tr\u00e8s bon \u00e9tat', 'Bon \u00e9tat', '\u00c9tat correct', 'Pour pi\u00e8ces'],
    extraFields: [
      { name: 'marque', label: 'Marque *', placeholder: 'Toyota, Kia, Renault...' },
      { name: 'modele', label: 'Mod\u00e8le', placeholder: 'Prado, Forte, Duster...' },
      { name: 'annee', label: 'Ann\u00e9e', type: 'number', placeholder: '2020' },
      { name: 'kilometrage', label: 'Kilom\u00e9trage (km)', type: 'number', placeholder: '45000' },
      { name: 'carburant', label: 'Carburant', type: 'select', options: ['Essence', 'Diesel', 'Hybride', '\u00c9lectrique', 'GPL'] },
      { name: 'boite', label: 'Bo\u00eete de vitesse', type: 'select', options: ['Automatique', 'Manuelle'] },
    ],
  },
  cat_immo: {
    etats: ['Neuf', 'Bon \u00e9tat', '\u00c0 r\u00e9nover'],
    extraFields: [
      { name: 'type_bien', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison', 'Villa', 'Terrain', 'Bureau', 'Entrep\u00f4t', 'Chambre'] },
      { name: 'surface', label: 'Surface (m\u00b2)', type: 'number', placeholder: '120' },
      { name: 'pieces', label: 'Nombre de pi\u00e8ces', type: 'select', options: ['Studio', '2 pi\u00e8ces', '3 pi\u00e8ces', '4 pi\u00e8ces', '5 pi\u00e8ces', '6+'] },
      { name: 'meuble', label: 'Meubl\u00e9 ?', type: 'select', options: ['Oui', 'Non', 'Partiellement'] },
    ],
  },
  cat_location: {
    etats: ['Disponible', 'Sous r\u00e9serve'],
    extraFields: [
      { name: 'capacite', label: 'Capacit\u00e9 / Places', placeholder: '30 personnes, 300 invit\u00e9s...' },
      { name: 'duree_min', label: 'Dur\u00e9e minimale', placeholder: '1 jour, 1 semaine...' },
      { name: 'caution', label: 'Caution (FCFA)', type: 'number', placeholder: '50000' },
    ],
  },
  cat_serv: {
    etats: ['Disponible', 'Sur rendez-vous'],
    extraFields: [
      { name: 'experience', label: 'Exp\u00e9rience', type: 'select', options: ["Moins d'1 an", '1-3 ans', '3-5 ans', '5-10 ans', 'Plus de 10 ans'] },
      { name: 'deplacement', label: 'D\u00e9placement', type: 'select', options: ['\u00c0 domicile', 'En boutique', 'Les deux'] },
      { name: 'delai', label: "D\u00e9lai d'intervention", placeholder: '24h, 1 semaine...' },
    ],
  },
  cat_maison: {
    etats: ['Neuf', 'Tr\u00e8s bon \u00e9tat', 'Bon \u00e9tat', 'En panne'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'LG, Samsung, Ikea...' },
      { name: 'modele', label: 'Mod\u00e8le / R\u00e9f\u00e9rence', placeholder: 'R\u00e9f\u00e9rence du produit' },
      { name: 'couleur', label: 'Couleur', placeholder: 'Blanc, Noir, Bois...' },
    ],
  },
  cat_mode: {
    etats: ['Neuf avec \u00e9tiquette', 'Neuf sans \u00e9tiquette', 'Tr\u00e8s bon \u00e9tat', 'Bon \u00e9tat'],
    extraFields: [
      { name: 'taille', label: 'Taille', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46', 'Autre'] },
      { name: 'couleur', label: 'Couleur', placeholder: 'Noir, Rouge, Blanc...' },
      { name: 'marque', label: 'Marque', placeholder: 'Zara, H&M, Nike...' },
    ],
  },
  cat_beaute: {
    etats: ['Neuf', 'Ouvert', 'Entam\u00e9'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'MAC, L\'Or\u00e9al, Nivea...' },
      { name: 'date_expiration', label: "Date d'expiration", placeholder: 'MM/AAAA' },
    ],
  },
  cat_adulte: {
    etats: ['Neuf', 'Ouvert', 'Tr\u00e8s bon \u00e9tat'],
    extraFields: [
      { name: 'marque', label: 'Marque (optionnel)', placeholder: 'Marque du produit' },
    ],
  },
  cat_bebe: {
    etats: ['Neuf', 'Tr\u00e8s bon \u00e9tat', 'Bon \u00e9tat'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'Chicco, Graco...' },
      { name: 'age_cible', label: '\u00c2ge cible', type: 'select', options: ['0-3 mois', '3-6 mois', '6-12 mois', '1-2 ans', '2-3 ans', '3-5 ans', '5+ ans'] },
    ],
  },
  cat_epicerie: {
    etats: ['Disponible', 'Stock limit\u00e9'],
    extraFields: [
      { name: 'poids', label: 'Poids / Quantit\u00e9', placeholder: '1kg, 500g, 1L...' },
      { name: 'origine', label: 'Origine', placeholder: "C\u00f4te d'Ivoire, Import\u00e9..." },
      { name: 'date_expiration', label: "Date d'expiration", placeholder: 'MM/AAAA' },
    ],
  },
  cat_sport: {
    etats: ['Neuf', 'Tr\u00e8s bon \u00e9tat', 'Bon \u00e9tat'],
    extraFields: [
      { name: 'marque', label: 'Marque', placeholder: 'Nike, Adidas, Decathlon...' },
      { name: 'taille', label: 'Taille / Pointure', placeholder: '42, L, XL...' },
    ],
  },
}`;

// Trouver et remplacer le bloc CATEGORY_FIELDS existant
const startMarker = 'const CATEGORY_FIELDS: Record<string, CatConfig> = {';
const endMarker = '\nconst DEFAULT_CONFIG';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log('⚠️  Bloc CATEGORY_FIELDS non trouvé');
  process.exit(1);
}

content = content.substring(0, startIdx) + newCategoryFields + content.substring(endIdx);

fs.writeFileSync(filePath, content, 'utf8');
console.log('\u2705 CATEGORY_FIELDS mis \u00e0 jour avec les 12 cat\u00e9gories !');
