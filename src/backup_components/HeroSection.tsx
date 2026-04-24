'use client'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { useI18n } from '@/contexts/i18nContext'

interface HeroSectionProps {
  stats: { total: number; vendors: number }
}

export function HeroSection({ stats }: HeroSectionProps) {
  const { t } = useI18n()

  const showTotal   = stats.total   >= 50
  const showVendors = stats.vendors >= 10

  const TRUST_ITEMS = [
    { emoji: '✅', label: t('trust.meet_public') },
    { emoji: '🔒', label: t('trust.certified') },
    { emoji: '🚫', label: t('trust.no_payment') },
    { emoji: '📞', label: t('trust.whatsapp') },
    { emoji: '💬', label: t('trust.messaging') },
    { emoji: '🛡️', label: t('trust.moderation') },
  ]

  return (
    <>
      {/* ── HERO COMPACT ── max-height: 280px on desktop ── */}
      <section className="
        bg-[#111111]
        border-b border-white/5
        flex items-center
        px-6 lg:px-10
        py-8 lg:py-0
        min-h-[160px] lg:min-h-0 lg:h-[220px]
      ">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">

            {/* ── LEFT : badge + title + stats ── */}
            <div className="flex-1 min-w-0">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Zap size={11} />
                {t('hero.badge')}
              </div>

              {/* Title */}
              <h1 className="font-extrabold text-2xl lg:text-3xl leading-tight text-white whitespace-nowrap">
                {t('hero.title_1')}{' '}
                {t('hero.title_2')}{' '}
                <span className="text-orange-500">{t('hero.title_highlight')}</span>
              </h1>

              {/* Stats row */}
              <div className="flex items-center gap-5 mt-4 flex-wrap">

                <div>
                  <p className="font-bold text-lg text-orange-400 leading-none">
                    {showTotal ? `${stats.total.toLocaleString('fr')}+` : '—'}
                  </p>
                  <p className="text-gray-500 text-[11px] uppercase tracking-wide mt-0.5">
                    {t('hero.stat_ads')}
                  </p>
                </div>

                <div className="w-px h-6 bg-white/10 hidden sm:block" />

                <div>
                  <p className="font-bold text-lg text-orange-400 leading-none">
                    {showVendors ? `${stats.vendors}+` : '—'}
                  </p>
                  <p className="text-gray-500 text-[11px] uppercase tracking-wide mt-0.5">
                    {t('hero.stat_sellers')}
                  </p>
                </div>

                <div className="w-px h-6 bg-white/10 hidden sm:block" />

                <div>
                  <p className="font-bold text-lg text-orange-400 leading-none">10</p>
                  <p className="text-gray-500 text-[11px] uppercase tracking-wide mt-0.5">
                    {t('hero.stat_categories')}
                  </p>
                </div>

                <div className="w-px h-6 bg-white/10 hidden sm:block" />

                <div>
                  <p className="font-bold text-lg text-orange-400 leading-none">26</p>
                  <p className="text-gray-500 text-[11px] uppercase tracking-wide mt-0.5">
                    {t('hero.stat_cities')}
                  </p>
                </div>

              </div>
            </div>

            {/* ── RIGHT : CTA ── */}
            <div className="flex-shrink-0 flex flex-col items-start lg:items-end gap-2">
              <Link
                href="/publier"
                className="
                  inline-flex items-center gap-2
                  bg-orange-500 hover:bg-orange-600 active:scale-95
                  text-white font-semibold text-sm
                  px-6 py-3.5 rounded-lg
                  transition-all duration-150
                  whitespace-nowrap
                "
              >
                + {t('hero.publish_title')} →
              </Link>
              <p className="text-gray-600 text-xs">
                100% gratuit · Sans engagement
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="bg-dark text-white py-3 px-6 overflow-x-auto border-t border-white/5">
        <div className="flex items-center justify-center gap-8 min-w-max mx-auto">
          {TRUST_ITEMS.map(item => (
            <span key={item.label} className="text-xs text-gray-400 whitespace-nowrap">
              {item.emoji} {item.label}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
