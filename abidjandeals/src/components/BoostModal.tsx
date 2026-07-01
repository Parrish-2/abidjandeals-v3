'use client'

import { Loader2, X, Zap } from 'lucide-react'
import { useState } from 'react'

interface BoostModalProps {
  adId: string
  adTitle: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

const BOOST_PLANS = [
  {
    id: 'urgent',
    label: 'Pack Urgent',
    price: 2500,
    icon: '⚡',
    color: '#F5A623',
    perks: ['Badge Urgent', '3× plus de vues', '7 jours'],
  },
  {
    id: 'top',
    label: 'Top Annonce',
    price: 7000,
    icon: '🚀',
    color: '#E8490F',
    highlight: true,
    perks: ['Badge Top', '8× plus de vues', '15 jours', 'En tête de liste'],
  },
  {
    id: 'vedette',
    label: 'Pack Vedette',
    price: 20000,
    icon: '👑',
    color: '#7C3AED',
    perks: ['Badge Vedette', '15× plus de vues', '30 jours', "Page d'accueil"],
  },
]

export function BoostModal({ adId, adTitle, onClose }: BoostModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('top')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const plan = BOOST_PLANS.find(p => p.id === selectedPlan)!

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, boostType: selectedPlan }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkout_url) {
        setError(data.error ?? 'Erreur lors de la création du paiement.')
        return
      }
      window.location.href = data.checkout_url
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: '100%', maxWidth: 460, background: '#1F2937', borderRadius: 20, padding: '24px 20px', maxHeight: '90dvh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="#F5A623" fill="#F5A623" /> Choisir un pack
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
              {adTitle.length > 40 ? adTitle.slice(0, 40) + '…' : adTitle}
            </p>
          </div>
          <button onClick={onClose}
            style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {BOOST_PLANS.map(p => (
            <button key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              style={{
                position: 'relative', width: '100%', padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                background: selectedPlan === p.id ? `${p.color}18` : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${selectedPlan === p.id ? p.color : 'rgba(255,255,255,0.09)'}`,
                borderRadius: 14, transition: 'all 0.2s',
              }}>
              {p.highlight && (
                <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#F5A623', color: '#111827', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 20 }}>
                  POPULAIRE
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.label}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{p.perks.join(' · ')}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: p.color, whiteSpace: 'nowrap' }}>
                  {p.price.toLocaleString('fr-CI')} <small style={{ fontSize: 10, fontWeight: 500 }}>FCFA</small>
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Erreur */}
        {error && (
          <p style={{ color: '#F87171', fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 }}>
          <button onClick={handlePay} disabled={loading}
            style={{
              width: '100%', padding: '15px', background: 'linear-gradient(135deg, #F5A623, #C47D0E)',
              border: 'none', borderRadius: 12, color: '#111827', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'transform 0.15s',
            }}>
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Redirection...</>
              : `Payer ${plan.price.toLocaleString('fr-CI')} FCFA →`}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>
            🔒 Paiement sécurisé via GeniusPay · Wave, Orange, MTN, Moov
          </p>
        </div>
      </div>
    </div>
  )
}
