/**
 * Utilitaires de formatage pour AbidjanDeals CI
 * Source de vérité unique — importer depuis ici, jamais utiliser toLocaleString directement
 */

const FCFA_FORMATTER = new Intl.NumberFormat('fr-CI', {
  style: 'currency',
  currency: 'XOF',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

const NUMBER_FORMATTER = new Intl.NumberFormat('fr-CI', {
  maximumFractionDigits: 0,
})

/**
 * Formate un prix en FCFA
 * @example formatFCFA(150000) → "150 000 FCFA"
 */
export function formatFCFA(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) return '— FCFA'
  // XOF s'affiche comme "XOF" ou "F CFA" selon le système
  // On force le format manuel pour cohérence CI
  return `${NUMBER_FORMATTER.format(price)} FCFA`
}

/**
 * Formate un nombre avec séparateurs français
 * @example formatNumber(15000) → "15 000"
 */
export function formatNumber(n: number): string {
  return NUMBER_FORMATTER.format(n)
}

/**
 * Formate une date en français CI
 * @example formatDate('2025-01-15') → "15 jan. 2025"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-CI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formate une date relative
 * @example formatRelativeDate('2025-01-13') → "Il y a 2 jours"
 */
export function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  return formatDate(dateStr)
}

/**
 * Valide un numéro de téléphone ivoirien
 * Formats valides : 07XXXXXXXX, 01XXXXXXXX, 05XXXXXXXX, 27XXXXXXXX, etc.
 */
export function isValidCIPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '').replace(/^\+225/, '')
  return /^(0[157][0-9]{8}|2[0-9]{9}|[0-9]{10})$/.test(cleaned)
}

/**
 * Nettoie et normalise un numéro CI pour CinetPay
 * @example normalizeCIPhone('+225 07 00 00 00 00') → '0700000000'
 */
export function normalizeCIPhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, '').replace(/^\+225/, '')
}