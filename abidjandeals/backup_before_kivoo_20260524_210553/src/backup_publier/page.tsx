'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PublierPage() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const adData = {
        title: title.trim(),
        price: Number(price),
        phone: phone.trim(),
        city: city.trim(),
        status: 'pending' as const,
        user_id: user?.id || null
      }

      const { error: insertError } = await supabase
        .from('ads')
        .insert(adData)

      if (insertError) {
        throw new Error(insertError.message)
      }

      alert('✅ Annonce créée avec succès !')
      router.push('/')
      // Reset form
      setTitle('')
      setPrice('')
      setPhone('')
      setCity('')
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Publier une annonce</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Titre de l'annonce *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Ex: iPhone 15 Pro - 256Go - Comme neuf"
            required
            maxLength={80}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Prix (FCFA) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="150000"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Téléphone *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+225 07 12 34 56 78"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Ville *
          </label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Abidjan, Yamoussoukro..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading
            ? <span>⏳ Publication en cours...</span>
            : <span>🚀 Publier mon annonce</span>
          }
        </button>

        <p className="text-xs text-gray-500 text-center">
          * Champs obligatoires. Annonce en modération (24h max).
        </p>
      </form>
    </div>
  )
}