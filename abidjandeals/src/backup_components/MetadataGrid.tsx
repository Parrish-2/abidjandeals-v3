'use client'
// src/components/MetadataGrid.tsx
// ─── Affichage "Pro" des caractéristiques d'une annonce ───────────────────
// Usage dans la page de détail d'annonce :
//   <MetadataGrid metadata={ad.metadata} categoryId={ad.category} />

import { getFieldSchema } from '@/config/field-schemas.config'

interface MetadataGridProps {
  /** Objet jsonb stocké dans Supabase */
  metadata?: Record<string, unknown> | null
  categoryId: string
  className?: string
}

// Formate la valeur selon le type de champ
function formatValue(value: unknown, schema?: { options?: { value: string; label: string }[]; unit?: string; type?: string }): string {
  if (value === null || value === undefined || value === '') return '—'

  // Toggle → Oui / Non
  if (schema?.type === 'toggle') return value ? 'Oui ✓' : 'Non'

  // Select → cherche le label correspondant
  if (schema?.type === 'select' && schema.options) {
    const found = schema.options.find(o => o.value === String(value))
    if (found) return found.label
  }

  // Number avec unité
  if (schema?.unit) return `${value} ${schema.unit}`

  return String(value)
}

export function MetadataGrid({ metadata, categoryId, className = '' }: MetadataGridProps) {
  const fields = getFieldSchema(categoryId)

  if (!fields.length || !metadata) return null

  // Filtrer les champs qui ont une valeur renseignée
  const filledFields = fields.filter(f => {
    const val = metadata[f.key]
    return val !== undefined && val !== null && val !== ''
  })

  if (!filledFields.length) return null

  // Séparer toggles "true" des autres pour les afficher en badges
  const badges = filledFields.filter(f => f.type === 'toggle' && metadata[f.key] === true)
  const details = filledFields.filter(f => f.type !== 'toggle')

  return (
    <section className={className}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 14,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(249,115,22,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>
          📋
        </div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Caractéristiques
        </h2>
      </div>

      {/* Grille de détails */}
      {details.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 10,
          marginBottom: badges.length ? 12 : 0,
        }}>
          {details.map(field => {
            const value = metadata[field.key]
            const formatted = formatValue(value, field)

            return (
              <div
                key={field.key}
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 16 }}>{field.icon}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {field.label}
                  </span>
                </div>
                <p style={{
                  fontSize: 14, fontWeight: 600, color: '#1e293b',
                  margin: 0, lineHeight: 1.3,
                }}>
                  {formatted}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Badges "Oui" pour les toggles */}
      {badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {badges.map(field => (
            <span
              key={field.key}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 20,
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                fontSize: 12, fontWeight: 600, color: '#059669',
              }}
            >
              <span style={{ fontSize: 14 }}>{field.icon}</span>
              {field.label}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
