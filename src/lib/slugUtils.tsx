// src/lib/slugUtils.ts
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Sépare les accents des lettres
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .trim()
    .replace(/\s+/g, '-') // Espaces -> tirets
    .replace(/[^\w-]+/g, '') // Supprime tout ce qui n'est pas lettre/chiffre/tiret
    .replace(/--+/g, '-') // Évite les doubles tirets
    .replace(/^-+/, '') // Supprime tiret au début
    .replace(/-+$/, ''); // Supprime tiret à la fin
}

export function normalizeForSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}