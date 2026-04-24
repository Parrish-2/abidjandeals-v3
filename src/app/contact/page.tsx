'use client'
import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Mail, MessageCircle, Phone, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm]       = useState({ nom: '', email: '', sujet: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Simulation envoi — remplace par ton endpoint ou Resend/EmailJS
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  const CONTACTS = [
    {
      icon: Mail,
      color: 'bg-blue-50 text-blue-600',
      label: 'Email',
      value: 'contact@abidjandeals.ci',
      href: 'mailto:contact@abidjandeals.ci',
    },
    {
      icon: MessageCircle,
      color: 'bg-emerald-50 text-emerald-600',
      label: 'WhatsApp',
      value: '+225 07 00 00 00 00',
      href: 'https://wa.me/2250700000000',
    },
    {
      icon: Phone,
      color: 'bg-orange-50 text-orange-600',
      label: 'Téléphone',
      value: '+225 07 00 00 00 00',
      href: 'tel:+2250700000000',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">

        <div className="text-center mb-10">
          <h1 className="font-sans font-extrabold text-3xl text-gray-900 mb-2">
            Contactez-nous
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Une question, un signalement ou un partenariat ? Notre équipe répond sous 48h.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {CONTACTS.map((c, i) => (
            <a
              key={i}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.color}`}>
                <c.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{c.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{c.value}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="font-bold text-xl text-gray-900 mb-2">Message envoyé !</h2>
              <p className="text-gray-500 text-sm">
                Merci de nous avoir contactés. Nous vous répondrons sous 48h.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-bold text-lg text-gray-900 mb-6">Envoyer un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={form.nom}
                      onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                      placeholder="Kouamé Koffi"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sujet *</label>
                  <select
                    required
                    value={form.sujet}
                    onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white"
                  >
                    <option value="">Choisissez un sujet</option>
                    <option value="signalement">Signaler une arnaque ou annonce frauduleuse</option>
                    <option value="compte">Problème avec mon compte</option>
                    <option value="annonce">Problème avec une annonce</option>
                    <option value="paiement">Problème de paiement</option>
                    <option value="partenariat">Partenariat & Presse</option>
                    <option value="recrutement">Recrutement</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Décrivez votre demande en détail..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-all"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>

                <p className="text-center text-gray-400 text-xs">
                  Nous répondons sous 48h · Lundi–Vendredi
                </p>
              </form>
            </>
          )}
        </div>

      </main>
      <Footer />
    </div>
  )
}
