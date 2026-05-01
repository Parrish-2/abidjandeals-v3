'use client'

import { Building2, Layers, DollarSign, Ruler, FileText, Trees } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────
export type ImmobilierSubcat =
  | 'location-meublee'
  | 'location-vide'
  | 'colocation'
  | 'vente-appartement'
  | 'vente-maison-villa'
  | 'terrains'
  | 'residences-meublees'
  | 'bureaux-boutiques'
  | ''

export interface ImmobilierValues {
  nombrePieces: string
  caution: string
  avance: string
  fraisAgence: string
  superficie: string
  typeDocument: string
  natureTerrain: string
}

interface ImmobilierFieldsProps {
  subcat: ImmobilierSubcat
  values: ImmobilierValues
  onChange: (field: keyof ImmobilierValues, value: string) => void
  showErrors?: boolean
}

// ── Options ──────────────────────────────────────────────────────
const PIECES_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: '2',      label: '2 pièces' },
  { value: '3',      label: '3 pièces' },
  { value: '4',      label: '4 pièces' },
  { value: '5+',     label: '5 pièces +' },
]

const AVANCE_OPTIONS = [
  { value: '1', label: '1 mois' },
  { value: '2', label: '2 mois' },
  { value: '3', label: '3 mois' },
  { value: '4', label: '4 mois' },
  { value: '5', label: '5 mois' },
  { value: '6', label: '6 mois' },
]

const DOCUMENT_OPTIONS = [
  { value: 'acd',                    label: 'ACD (Arrêté de Concession Définitive)' },
  { value: 'certificat-propriete',   label: 'Certificat de Propriété' },
  { value: 'titre-foncier',          label: 'Titre Foncier' },
  { value: 'lettre-attribution',     label: "Lettre d'Attribution" },
  { value: 'arrete',                 label: 'Arrêté' },
  { value: 'attestation-villageoise',label: 'Attestation Villageoise' },
  { value: 'autre',                  label: 'Autre document' },
]

const NATURE_TERRAIN_OPTIONS = [
  { value: 'urbain',      label: '🏙️ Urbain' },
  { value: 'agricole',    label: '🌾 Agricole' },
  { value: 'industriel',  label: '🏭 Industriel' },
  { value: 'residentiel', label: '🏡 Résidentiel' },
  { value: 'foret',       label: '🌿 Forêt' },
]

// ── Helper : détermine le cas ────────────────────────────────────
function getCase(subcat: ImmobilierSubcat): 'location' | 'vente' | 'terrain' | 'autre' {
  if (['location-meublee', 'location-vide', 'colocation', 'residences-meublees'].includes(subcat)) return 'location'
  if (['vente-appartement', 'vente-maison-villa', 'bureaux-boutiques'].includes(subcat)) return 'vente'
  if (subcat === 'terrains') return 'terrain'
  return 'autre'
}

// ── Retourne le libellé du prix (à utiliser dans page.tsx) ───────
export function getPrixLabel(subcat: ImmobilierSubcat): string {
  const cas = getCase(subcat)
  if (cas === 'location') return 'Loyer mensuel (FCFA) *'
  if (cas === 'vente')    return 'Prix de vente total (FCFA) *'
  return 'Prix (FCFA) *'
}

// ── Styles réutilisables ─────────────────────────────────────────
const inputCls = (err?: boolean) =>
  `w-full px-3 py-2.5 rounded-xl border text-sm bg-white text-dark outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${err ? 'border-red-400' : 'border-gray-200'}`

const labelCls = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide'

// ── Composant ────────────────────────────────────────────────────
export function ImmobilierFields({ subcat, values, onChange, showErrors = false }: ImmobilierFieldsProps) {

  // Aucune sous-catégorie sélectionnée
  if (!subcat) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/20 p-5 text-center">
        <Building2 size={24} className="text-orange-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Sélectionnez une sous-catégorie pour afficher les champs immobilier.</p>
      </div>
    )
  }

  const cas = getCase(subcat)

  return (
    <div className="space-y-5 rounded-2xl border border-orange-100 bg-orange-50/30 p-5">

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-orange-100 pb-3">
        <Building2 size={18} className="text-orange-500" />
        <h3 className="font-semibold text-dark text-sm">
          {cas === 'location' && '🏠 Détails Location'}
          {cas === 'vente'    && '🏢 Détails Vente'}
          {cas === 'terrain'  && '🌿 Détails Terrain / Forêt'}
          {cas === 'autre'    && '🏗️ Détails Immobilier'}
        </h3>
        <span className="ml-auto text-[10px] text-orange-400 bg-orange-100 px-2 py-0.5 rounded-full font-semibold">
          Spécial Abidjan
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════
          CAS 1 — LOCATION & COLOCATION
      ══════════════════════════════════════════════════════ */}
      {cas === 'location' && (
        <div className="space-y-4">

          {/* Nombre de pièces */}
          <div>
            <label className={labelCls}>
              <Layers size={12} className="inline mr-1 text-orange-400" />
              Nombre de pièces *
            </label>
            <select value={values.nombrePieces} onChange={e => onChange('nombrePieces', e.target.value)}
              className={inputCls(showErrors && !values.nombrePieces)}>
              <option value="">Sélectionner…</option>
              {PIECES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {showErrors && !values.nombrePieces && <p className="text-xs text-red-500 mt-1">Obligatoire</p>}
          </div>

          {/* Conditions financières */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Caution */}
            <div>
              <label className={labelCls}>
                <DollarSign size={12} className="inline mr-1 text-orange-400" />
                Caution (FCFA) *
              </label>
              <div className="relative">
                <input type="number" placeholder="Ex : 150 000" value={values.caution} min={0}
                  onChange={e => onChange('caution', e.target.value)}
                  className={inputCls(showErrors && !values.caution) + ' pr-8'} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">F</span>
              </div>
              {showErrors && !values.caution && <p className="text-xs text-red-500 mt-1">Obligatoire</p>}
            </div>

            {/* Avance */}
            <div>
              <label className={labelCls}>
                <DollarSign size={12} className="inline mr-1 text-orange-400" />
                Avance *
              </label>
              <select value={values.avance} onChange={e => onChange('avance', e.target.value)}
                className={inputCls(showErrors && !values.avance)}>
                <option value="">Sélectionner…</option>
                {AVANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {showErrors && !values.avance && <p className="text-xs text-red-500 mt-1">Obligatoire</p>}
            </div>

            {/* Frais d'agence */}
            <div>
              <label className={labelCls}>
                <DollarSign size={12} className="inline mr-1 text-orange-400" />
                Frais d'agence
              </label>
              <div className="relative">
                <input type="number" placeholder="0 si direct proprio" value={values.fraisAgence} min={0}
                  onChange={e => onChange('fraisAgence', e.target.value)}
                  className={inputCls() + ' pr-8'} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">F</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">0 si direct propriétaire</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          CAS 2 — VENTE MAISON / VILLA / APPARTEMENT
      ══════════════════════════════════════════════════════ */}
      {cas === 'vente' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Nombre de pièces */}
            <div>
              <label className={labelCls}>
                <Layers size={12} className="inline mr-1 text-orange-400" />
                Nombre de pièces *
              </label>
              <select value={values.nombrePieces} onChange={e => onChange('nombrePieces', e.target.value)}
                className={inputCls(showErrors && !values.nombrePieces)}>
                <option value="">Sélectionner…</option>
                {PIECES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {showErrors && !values.nombrePieces && <p className="text-xs text-red-500 mt-1">Obligatoire</p>}
            </div>

            {/* Superficie */}
            <div>
              <label className={labelCls}>
                <Ruler size={12} className="inline mr-1 text-orange-400" />
                Superficie totale *
              </label>
              <div className="relative">
                <input type="number" placeholder="Ex : 120" value={values.superficie} min={0}
                  onChange={e => onChange('superficie', e.target.value)}
                  className={inputCls(showErrors && !values.superficie) + ' pr-10'} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">m²</span>
              </div>
              {showErrors && !values.superficie && <p className="text-xs text-red-500 mt-1">Obligatoire</p>}
            </div>
          </div>

          {/* Type de document */}
          <div>
            <label className={labelCls}>
              <FileText size={12} className="inline mr-1 text-orange-400" />
              Type de document *
            </label>
            <select value={values.typeDocument} onChange={e => onChange('typeDocument', e.target.value)}
              className={inputCls(showErrors && !values.typeDocument)}>
              <option value="">Sélectionner le document…</option>
              {DOCUMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {showErrors && !values.typeDocument && <p className="text-xs text-red-500 mt-1">Obligatoire</p>}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            <p className="text-[11px] text-blue-600">
              💡 Caution, avance et frais d'agence ne s'appliquent pas à la vente — masqués automatiquement.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          CAS 3 — TERRAIN / FORÊT
      ══════════════════════════════════════════════════════ */}
      {cas === 'terrain' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Superficie */}
            <div>
              <label className={labelCls}>
                <Ruler size={12} className="inline mr-1 text-orange-400" />
                Superficie *
              </label>
              <div className="relative">
                <input type="number" placeholder="Ex : 500" value={values.superficie} min={0}
                  onChange={e => onChange('superficie', e.target.value)}
                  className={inputCls(showErrors && !values.superficie) + ' pr-10'} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">m²</span>
              </div>
              {showErrors && !values.superficie && <p className="text-xs text-red-500 mt-1">Obligatoire</p>}
              <p className="text-[10px] text-gray-400 mt-0.5">1 hectare = 10 000 m²</p>
            </div>

            {/* Nature du terrain */}
            <div>
              <label className={labelCls}>
                <Trees size={12} className="inline mr-1 text-orange-400" />
                Nature du terrain *
              </label>
              <select value={values.natureTerrain} onChange={e => onChange('natureTerrain', e.target.value)}
                className={inputCls(showErrors && !values.natureTerrain)}>
                <option value="">Sélectionner…</option>
                {NATURE_TERRAIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {showErrors && !values.natureTerrain && <p className="text-xs text-red-500 mt-1">Obligatoire</p>}
            </div>
          </div>

          {/* Documents juridiques */}
          <div>
            <label className={labelCls}>
              <FileText size={12} className="inline mr-1 text-orange-400" />
              Documents juridiques *
            </label>
            <select value={values.typeDocument} onChange={e => onChange('typeDocument', e.target.value)}
              className={inputCls(showErrors && !values.typeDocument)}>
              <option value="">Sélectionner le document…</option>
              {DOCUMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {showErrors && !values.typeDocument && <p className="text-xs text-red-500 mt-1">Obligatoire</p>}
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <p className="text-[11px] text-emerald-700">
              🌿 Nombre de pièces masqué — non applicable pour un terrain ou une forêt.
            </p>
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-400 pt-1 border-t border-orange-100">
        💡 Ces informations rassureront les acheteurs et éviteront les questions répétitives.
      </p>
    </div>
  )
}
