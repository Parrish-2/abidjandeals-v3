'use client'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { useI18n } from '@/contexts/i18nContext'
import { Briefcase, ChevronRight, Clock, MapPin } from 'lucide-react'

export default function RecrutementPage() {
    const { t } = useI18n()

    const POSTES = [
        {
            titre: t('recrutement.job1_title'),
            type: t('recrutement.job1_type'),
            lieu: t('recrutement.job1_location'),
            desc: t('recrutement.job1_desc'),
        },
        {
            titre: t('recrutement.job2_title'),
            type: t('recrutement.job2_type'),
            lieu: t('recrutement.job2_location'),
            desc: t('recrutement.job2_desc'),
        },
        {
            titre: t('recrutement.job3_title'),
            type: t('recrutement.job3_type'),
            lieu: t('recrutement.job3_location'),
            desc: t('recrutement.job3_desc'),
        },
        {
            titre: t('recrutement.job4_title'),
            type: t('recrutement.job4_type'),
            lieu: t('recrutement.job4_location'),
            desc: t('recrutement.job4_desc'),
        },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">

                {/* Hero */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                            <Briefcase size={24} className="text-orange-400" />
                        </div>
                        <div>
                            <h1 className="font-sans font-extrabold text-2xl">{t('recrutement.title')}</h1>
                            <p className="text-white/60 text-sm">{t('recrutement.subtitle')}</p>
                        </div>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        {t('recrutement.intro')}
                    </p>
                </div>

                {/* Postes */}
                <h2 className="font-bold text-xl text-gray-900 mb-5">{t('recrutement.open_positions')}</h2>
                <div className="space-y-4 mb-12">
                    {POSTES.map((poste, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-orange-200 transition-colors">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="font-bold text-gray-900">{poste.titre}</h3>
                                <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-3 py-1 rounded-full flex-shrink-0">
                                    {poste.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                <span className="flex items-center gap-1"><MapPin size={11} /> {poste.lieu}</span>
                                <span className="flex items-center gap-1"><Clock size={11} /> {t('recrutement.asap')}</span>
                            </div>
                            <p className="text-gray-500 text-sm">{poste.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Candidature spontanée */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                    <p className="font-semibold text-orange-700 mb-1">{t('recrutement.spontaneous_title')}</p>
                    <p className="text-orange-600 text-sm mb-4">
                        {t('recrutement.spontaneous_desc')}
                    </p>
                    <a href="mailto:recrutement@kivoo.ci"
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                        {t('recrutement.spontaneous_cta')} <ChevronRight size={16} />
                    </a>
                </div>

            </main>
            <Footer />
        </div>
    )
}
