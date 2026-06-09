'use client'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useI18n } from '@/contexts/i18nContext'
import { Globe, Mail, Newspaper, TrendingUp, Users } from 'lucide-react'

export default function PressePage() {
    const { t } = useI18n()

    const CHIFFRES = [
        { value: '35+', label: t('presse.stat_ads'), icon: TrendingUp },
        { value: '26', label: t('presse.stat_cities'), icon: Globe },
        { value: '10', label: t('presse.stat_categories'), icon: Users },
        { value: '2026', label: t('presse.stat_year'), icon: Newspaper },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">

                {/* Hero */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                            <Newspaper size={24} className="text-orange-400" />
                        </div>
                        <div>
                            <h1 className="font-sans font-extrabold text-2xl">{t('presse.title')}</h1>
                            <p className="text-white/60 text-sm">{t('presse.subtitle')}</p>
                        </div>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        {t('presse.intro')}
                    </p>
                </div>

                {/* Chiffres clés */}
                <h2 className="font-bold text-xl text-gray-900 mb-5">{t('presse.stats_title')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {CHIFFRES.map((c, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <c.icon size={18} className="text-orange-500" />
                            </div>
                            <p className="text-2xl font-extrabold text-orange-500">{c.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
                        </div>
                    ))}
                </div>

                {/* À propos */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
                    <h2 className="font-bold text-lg text-gray-900 mb-3">{t('presse.about_title')}</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {t('presse.about_text')}
                    </p>
                </div>

                {/* Contact presse */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Mail size={18} className="text-orange-500" />
                        <p className="font-semibold text-orange-700">{t('presse.press_contact_title')}</p>
                    </div>
                    <p className="text-orange-600 text-sm mb-4">
                        {t('presse.press_contact_desc')}
                    </p>
                    <a href="mailto:presse@kivoo.ci"
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                        <Mail size={15} /> presse@kivoo.ci
                    </a>
                </div>

                {/* Partenariats */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Users size={18} className="text-blue-500" />
                        <p className="font-semibold text-blue-700">{t('presse.partner_title')}</p>
                    </div>
                    <p className="text-blue-600 text-sm mb-4">
                        {t('presse.partner_desc')}
                    </p>
                    <a href="mailto:partenariats@kivoo.ci"
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                        <Mail size={15} /> partenariats@kivoo.ci
                    </a>
                </div>

            </main>
            <Footer />
        </div>
    )
}
