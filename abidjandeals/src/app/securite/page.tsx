'use client'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useI18n } from '@/contexts/i18nContext'
import { AlertTriangle, CheckCircle, CreditCard, MapPin, Phone, Shield } from 'lucide-react'

export default function SecuritePage() {
  const { t } = useI18n()

  const TIPS = [
    {
      icon: MapPin,
      color: 'bg-emerald-50 text-emerald-600',
      title: t('securite.rule1_title'),
      desc: t('securite.rule1_desc'),
    },
    {
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-600',
      title: t('securite.rule2_title'),
      desc: t('securite.rule2_desc'),
    },
    {
      icon: Phone,
      color: 'bg-orange-50 text-orange-600',
      title: t('securite.rule3_title'),
      desc: t('securite.rule3_desc'),
    },
    {
      icon: Shield,
      color: 'bg-violet-50 text-violet-600',
      title: t('securite.rule4_title'),
      desc: t('securite.rule4_desc'),
    },
    {
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      title: t('securite.rule5_title'),
      desc: t('securite.rule5_desc'),
    },
    {
      icon: CheckCircle,
      color: 'bg-amber-50 text-amber-600',
      title: t('securite.rule6_title'),
      desc: t('securite.rule6_desc'),
    },
  ]

  const RED_FLAGS = [
    t('securite.scam1'),
    t('securite.scam2'),
    t('securite.scam3'),
    t('securite.scam4'),
    t('securite.scam5'),
    t('securite.scam6'),
    t('securite.scam7'),
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
              <Shield size={24} className="text-orange-400" />
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-2xl">{t('securite.title')}</h1>
              <p className="text-white/60 text-sm">{t('securite.subtitle')}</p>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            {t('securite.intro')}
          </p>
        </div>

        <h2 className="font-bold text-xl text-gray-900 mb-5">{t('securite.rules_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {TIPS.map((tip, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tip.color}`}>
                <tip.icon size={18} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">{tip.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="font-bold text-red-700">{t('securite.scam_title')}</h2>
          </div>
          <ul className="space-y-2">
            {RED_FLAGS.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                <span className="mt-0.5 text-red-400 flex-shrink-0">✕</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
          <p className="font-semibold text-orange-700 mb-1">{t('securite.victim_title')}</p>
          <p className="text-orange-600 text-sm mb-3">
            {t('securite.victim_desc')}
          </p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            {t('securite.victim_cta')}
          </a>
        </div>

      </main>
      <Footer />
    </div>
  )
}
