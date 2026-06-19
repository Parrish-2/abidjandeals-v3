'use client'
import { useEffect } from 'react'

export default function ShopActions({ sellerId, whatsapp, phone, facebook, instagram }:
  { sellerId: string, whatsapp?: string, phone?: string,
    facebook?: string, instagram?: string }) {

  useEffect(() => {
    fetch('/api/analytics/shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seller_id: sellerId, event: 'shop_view' }),
    })
  }, [sellerId])

  const trackAndOpen = (event: string, url: string) => {
    fetch('/api/analytics/shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seller_id: sellerId, event }),
    })
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {whatsapp && (
        <button
          onClick={() => trackAndOpen('wa_click', `https://wa.me/${whatsapp.replace(/\D/g,'')}`)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium">
          WhatsApp
        </button>
      )}
      {phone && (
        <button
          onClick={() => trackAndOpen('tel_click', `tel:${phone}`)}
          className="flex items-center gap-2 px-4 py-2 border text-sm rounded-lg">
          Appeler
        </button>
      )}
      {facebook && (
        <a href={facebook} target="_blank" rel="noopener"
          className="px-3 py-2 border text-sm rounded-lg">Facebook</a>
      )}
      {instagram && (
        <a href={instagram} target="_blank" rel="noopener"
          className="px-3 py-2 border text-sm rounded-lg">Instagram</a>
      )}
    </div>
  )
}
