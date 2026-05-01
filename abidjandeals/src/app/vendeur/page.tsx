'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Shield, Star, Zap, Lock, Phone, FileText, ChevronDown, CheckCircle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useI18n } from '@/contexts/i18nContext'

export default function VendeurPage() {
  const router = useRouter()
  const { user } = useStore()
  const { t } = useI18n()
  const [loading, setLoading] = useState<'basic' | 'confirmed' | null>(null)

  const FAQS = [
    { q: t('vendeur.faq1_q'), a: t('vendeur.faq1_a') },
    { q: t('vendeur.faq2_q'), a: t('vendeur.faq2_a') },
    { q: t('vendeur.faq3_q'), a: t('vendeur.faq3_a') },
    { q: t('vendeur.faq4_q'), a: t('vendeur.faq4_a') },
    { q: t('vendeur.faq5_q'), a: t('vendeur.faq5_a') },
  ]

  async function handleChooseLevel(level: 'basic' | 'confirmed_pending') {
    if (!user) { router.push('/?auth=login'); return }
    const key = level === 'basic' ? 'basic' : 'confirmed'
    setLoading(key as any)
    try {
      const { error } = await supabase.from('profiles').update({ account_level: level }).eq('id', user.id)
      if (error) throw error
      if (level === 'basic') {
        toast.success(t('vendeur.welcome_toast'))
        router.push('/dashboard')
      } else {
        toast.success(t('vendeur.docs_toast'))
        router.push('/verification-documents')
      }
    } catch (e: any) {
      toast.error(e.message || t('vendeur.error'))
    } finally {
      setLoading(null)
    }
  }

  const WHY_ITEMS = [
    { icon: Shield,   titleKey: 'vendeur.why1_title', descKey: 'vendeur.why1_desc', color: 'bg-blue-50 text-blue-600' },
    { icon: Zap,      titleKey: 'vendeur.why2_title', descKey: 'vendeur.why2_desc', color: 'bg-amber-50 text-amber-600' },
    { icon: Phone,    titleKey: 'vendeur.why3_title', descKey: 'vendeur.why3_desc', color: 'bg-emerald-50 text-emerald-600' },
    { icon: Star,     titleKey: 'vendeur.why4_title', descKey: 'vendeur.why4_desc', color: 'bg-violet-50 text-violet-600' },
    { icon: Lock,     titleKey: 'vendeur.why5_title', descKey: 'vendeur.why5_desc', color: 'bg-rose-50 text-rose-600' },
    { icon: FileText, titleKey: 'vendeur.why6_title', descKey: 'vendeur.why6_desc', color: 'bg-gray-100 text-gray-700' },
  ]

  const BASIC_FEATURES = [
    { textKey: 'vendeur.feature_mode',     ok: true  },
    { textKey: 'vendeur.feature_maison',   ok: true  },
    { textKey: 'vendeur.feature_bebe',     ok: true  },
    { textKey: 'vendeur.feature_divers',   ok: true  },
    { textKey: 'vendeur.feature_services', ok: false },
    { textKey: 'vendeur.feature_immo',     ok: false },
    { textKey: 'vendeur.feature_hightech', ok: false },
    { textKey: 'vendeur.feature_vehicles', ok: false },
  ]

  const CONFIRMED_FEATURES = [
    'vendeur.feature_mode', 'vendeur.feature_maison', 'vendeur.feature_bebe',
    'vendeur.feature_divers', 'vendeur.feature_services',
    'vendeur.feature_immo_excl', 'vendeur.feature_hightech_excl', 'vendeur.feature_vehicles_excl',
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">

        {/* HERO */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
              🇨🇮 {t('vendeur.hero_badge')}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              {t('vendeur.hero_title_1')}<br />
              <span className="text-emerald-400">{t('vendeur.hero_title_2')}</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">{t('vendeur.hero_subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#niveaux" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105">
                {t('vendeur.choose_level')} →
              </a>
              <Link href="/search" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all border border-white/20">
                {t('vendeur.see_ads')}
              </Link>
            </div>
          </div>
        </section>

        {/* OFFRE PIONNIER */}
        <section className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-5 px-4">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <p className="font-extrabold text-lg">🔥 {t('vendeur.pioneer_title')}</p>
              <p className="text-emerald-100 text-sm mt-1">{t('vendeur.pioneer_desc')}</p>
            </div>
            <a href="#niveaux" className="bg-white text-emerald-700 font-bold px-6 py-3 rounded-2xl text-sm hover:bg-emerald-50 transition-colors flex-shrink-0">
              {t('vendeur.pioneer_cta')} →
            </a>
          </div>
        </section>

        {/* NIVEAUX */}
        <section id="niveaux" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">{t('vendeur.choose_your_level')}</h2>
              <p className="text-gray-500 max-w-xl mx-auto">{t('vendeur.level_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

              {/* BASIC */}
              <div className="rounded-3xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="bg-gray-800 text-white p-6">
                  <div className="text-3xl mb-2">⭐</div>
                  <h3 className="text-xl font-extrabold">BASIC</h3>
                  <p className="text-white/70 text-sm mt-1">{t('vendeur.basic_subtitle')}</p>
                  <div className="mt-4 bg-white/15 rounded-xl px-4 py-2 text-sm font-semibold">{t('vendeur.basic_limit')}</div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-center mb-5">
                    <span className="text-2xl font-extrabold text-gray-900">{t('vendeur.free')}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {BASIC_FEATURES.map((item, i) => (
                      <li key={i} className={`text-sm flex items-center gap-2.5 ${item.ok ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {item.ok ? (
                          <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                          <span className="flex items-center gap-1 bg-gray-100 text-gray-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                            <Lock size={8} /> {t('vendeur.locked')}
                          </span>
                        )}
                        {t(item.textKey)}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleChooseLevel('basic')} disabled={loading === 'basic'}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all bg-gray-800 hover:bg-gray-700 text-white hover:scale-105 disabled:opacity-60">
                    {loading === 'basic' ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t('vendeur.start_free')}
                  </button>
                </div>
              </div>

              {/* CONFIRMÉ */}
              <div className="rounded-3xl border-2 border-emerald-400 bg-emerald-50 ring-2 ring-emerald-400 shadow-xl overflow-hidden flex flex-col scale-[1.02]">
                <div className="bg-amber-400 text-amber-900 text-xs font-extrabold text-center py-2 tracking-wider uppercase">
                  ⭐ {t('vendeur.recommended')}
                </div>
                <div className="bg-emerald-600 text-white p-6">
                  <div className="text-3xl mb-2">✅</div>
                  <h3 className="text-xl font-extrabold">{t('vendeur.confirmed_title')}</h3>
                  <p className="text-white/70 text-sm mt-1">{t('vendeur.confirmed_subtitle')}</p>
                  <div className="mt-4 bg-white/15 rounded-xl px-4 py-2 text-sm font-semibold">{t('vendeur.confirmed_limit')}</div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-center mb-1">
                    <span className="text-2xl font-extrabold text-gray-900">{t('vendeur.three_months_free')}</span>
                  </div>
                  <p className="text-center text-xs text-rose-500 font-semibold mb-5">🔥 {t('vendeur.pioneer_spots')}</p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {CONFIRMED_FEATURES.map((key, i) => (
                      <li key={i} className="text-sm flex items-center gap-2.5 text-gray-700 font-medium">
                        <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleChooseLevel('confirmed_pending')} disabled={loading === 'confirmed'}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 disabled:opacity-60">
                    {loading === 'confirmed' ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : `🔥 ${t('vendeur.become_confirmed')}`}
                  </button>
                  <p className="text-center text-gray-400 text-xs mt-2">{t('vendeur.quick_secure')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* POURQUOI */}
        <section className="bg-white py-16 px-4 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center mb-10">{t('vendeur.why_title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {WHY_ITEMS.map(item => (
                <div key={item.titleKey} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{t(item.titleKey)}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{t(item.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center mb-10">{t('vendeur.faq_title')} 🇨🇮</h2>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <details key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-gray-900 text-sm list-none">
                    {faq.q}
                    <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-gray-900 text-white py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">{t('vendeur.cta_title')}</h2>
            <p className="text-gray-400 mb-8">{t('vendeur.cta_desc')}</p>
            <a href="#niveaux" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all hover:scale-105">
              {t('vendeur.choose_level')} →
            </a>
            <p className="text-gray-500 text-xs mt-4">{t('vendeur.cta_sub')}</p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
