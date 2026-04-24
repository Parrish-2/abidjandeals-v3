'use client'
// src/components/DynamicFields.tsx
// ─── Champs dynamiques pilotés par field-schemas.config.ts ────────────────

import { Control, useController } from 'react-hook-form'
import type { CategoryField } from '@/config/field-schemas.config'
import {
  getFieldSchema,
  CATEGORIES_WITHOUT_CONDITION,
  CATEGORIES_WITHOUT_BRAND,
} from '@/config/field-schemas.config'

// ─── Types ────────────────────────────────────────────────────────────────────
// ✅ FIX : suppression des commentaires eslint-disable pour la règle
// '@typescript-eslint/no-explicit-any' qui n'est pas configurée dans ce projet.
// Ces commentaires causaient l'erreur "Definition for rule ... was not found".
// La règle est maintenant désactivée globalement dans .eslintrc.json

interface DynamicFieldsProps {
  control: Control<any>
  category: string
  showHeader?: boolean
}

// ─── ToggleField ──────────────────────────────────────────────────────────────

function ToggleField({
  field,
  control,
  name,
}: {
  field: CategoryField
  control: Control<any>
  name: string
}) {
  const { field: rhf } = useController({ name, control, defaultValue: false })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', borderRadius: 10,
      background: '#f8fafc', border: '1px solid #e2e8f0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{field.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{field.label}</span>
      </div>
      <button
        type="button"
        onClick={() => rhf.onChange(!rhf.value)}
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: rhf.value ? '#F97316' : '#d1d5db',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s', flexShrink: 0,
        }}
        role="switch"
        aria-checked={rhf.value}
      >
        <span style={{
          position: 'absolute', top: 3,
          left: rhf.value ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({
  field,
  control,
  name,
}: {
  field: CategoryField
  control: Control<any>
  name: string
}) {
  const { field: rhf, fieldState } = useController({
    name, control, defaultValue: '',
    rules: field.required ? { required: `${field.label} est requis` } : undefined,
  })

  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
      }}>
        <span>{field.icon}</span>
        {field.label}
        {field.required && <span style={{ color: '#F97316' }}>*</span>}
      </label>
      <select
        {...rhf}
        style={{
          width: '100%', padding: '10px 12px',
          borderRadius: 10, fontSize: 13, color: '#1e293b',
          background: '#fff',
          border: fieldState.error ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
          outline: 'none', cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: 36,
        }}
      >
        <option value="">— Sélectionner —</option>
        {field.options?.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {fieldState.error && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
          {fieldState.error.message}
        </p>
      )}
    </div>
  )
}

// ─── NumberField ──────────────────────────────────────────────────────────────

function NumberField({
  field,
  control,
  name,
}: {
  field: CategoryField
  control: Control<any>
  name: string
}) {
  const { field: rhf, fieldState } = useController({
    name, control, defaultValue: '',
    rules: field.required ? { required: `${field.label} est requis` } : undefined,
  })

  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
      }}>
        <span>{field.icon}</span>
        {field.label}
        {field.unit && (
          <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            ({field.unit})
          </span>
        )}
        {field.required && <span style={{ color: '#F97316' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          {...rhf}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          placeholder={`Ex: ${field.min ?? 0}`}
          style={{
            width: '100%', padding: '10px 12px',
            paddingRight: field.unit ? 44 : 12,
            borderRadius: 10, fontSize: 13, color: '#1e293b',
            border: fieldState.error ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
            outline: 'none', background: '#fff', boxSizing: 'border-box',
          }}
        />
        {field.unit && (
          <span style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 12, color: '#94a3b8', fontWeight: 500, pointerEvents: 'none',
          }}>
            {field.unit}
          </span>
        )}
      </div>
      {fieldState.error && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
          {fieldState.error.message}
        </p>
      )}
    </div>
  )
}

// ─── TextField ────────────────────────────────────────────────────────────────

function TextField({
  field,
  control,
  name,
}: {
  field: CategoryField
  control: Control<any>
  name: string
}) {
  const { field: rhf, fieldState } = useController({
    name, control, defaultValue: '',
    rules: field.required ? { required: `${field.label} est requis` } : undefined,
  })

  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
      }}>
        <span>{field.icon}</span>
        {field.label}
        {field.required && <span style={{ color: '#F97316' }}>*</span>}
      </label>
      <input
        {...rhf}
        type="text"
        style={{
          width: '100%', padding: '10px 12px',
          borderRadius: 10, fontSize: 13, color: '#1e293b',
          border: fieldState.error ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
          outline: 'none', background: '#fff', boxSizing: 'border-box',
        }}
      />
      {fieldState.error && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
          {fieldState.error.message}
        </p>
      )}
    </div>
  )
}

// ─── DynamicFields ────────────────────────────────────────────────────────────

export function DynamicFields({ control, category, showHeader = true }: DynamicFieldsProps) {
  const fields = getFieldSchema(category)

  if (!fields.length) return null

  const toggleFields = fields.filter(f => f.type === 'toggle')
  const normalFields = fields.filter(f => f.type !== 'toggle')

  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid #fed7aa',
      background: 'rgba(249,115,22,0.03)',
      overflow: 'hidden',
    }}>
      {showHeader && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(249,115,22,0.07)',
          borderBottom: '1px solid #fed7aa',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#c2410c', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Caractéristiques spécifiques
          </p>
          <span style={{ fontSize: 10, color: '#f97316', background: 'rgba(249,115,22,0.1)', borderRadius: 20, padding: '1px 8px', fontWeight: 600 }}>
            Boost visibilité
          </span>
        </div>
      )}

      <div style={{ padding: '14px 14px 6px' }}>
        {normalFields.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: toggleFields.length ? 12 : 8,
          }}>
            {normalFields.map(field => {
              const name = `metadata.${field.key}`
              if (field.type === 'select') return <SelectField key={field.key} field={field} control={control} name={name} />
              if (field.type === 'number') return <NumberField key={field.key} field={field} control={control} name={name} />
              return <TextField key={field.key} field={field} control={control} name={name} />
            })}
          </div>
        )}

        {toggleFields.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {toggleFields.map(field => (
              <ToggleField
                key={field.key}
                field={field}
                control={control}
                name={`metadata.${field.key}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Re-exports pour compatibilité ───────────────────────────────────────────

export { CATEGORIES_WITHOUT_CONDITION, CATEGORIES_WITHOUT_BRAND }
