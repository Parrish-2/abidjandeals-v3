'use client'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/data'
import { useI18n } from '@/contexts/i18nContext'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-dark text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-sans font-bold text-2xl mb-3">
              Abidjan<span className="text-orange-500">Deals</span> 🇨🇮
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-2">
              {['🟠 Orange Money', '🔵 Wave', '🟡 MTN MoMo'].map(p => (
                <span key={p} className="text-xs bg-white/10 px-2 py-1 rounded-lg text-white/60">{p}</span>
              ))}
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              {t('footer.categories')}
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map(c => (
                <li key={c.id}>
                  <Link
                    href={`/search?category=${c.id}`}
                    className="text-white/60 hover:text-orange-400 text-sm transition-colors"
                  >
                    {c.icon} {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mon compte */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              {t('footer.my_account')}
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/?auth=register" className="hover:text-orange-400 transition-colors">{t('footer.register')}</Link></li>
              <li><Link href="/?auth=login"    className="hover:text-orange-400 transition-colors">{t('footer.login')}</Link></li>
              <li><Link href="/publier"         className="hover:text-orange-400 transition-colors">{t('footer.post_ad')}</Link></li>
              <li><Link href="/dashboard"       className="hover:text-orange-400 transition-colors">{t('footer.dashboard')}</Link></li>
              <li><Link href="/messages"        className="hover:text-orange-400 transition-colors">{t('footer.messaging')}</Link></li>
              <li><Link href="/favorites"       className="hover:text-orange-400 transition-colors">{t('footer.favorites')}</Link></li>
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              {t('footer.about')}
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/securite"       className="hover:text-orange-400 transition-colors">{t('footer.security')}</Link></li>
              <li><Link href="/cgu"            className="hover:text-orange-400 transition-colors">{t('footer.terms')}</Link></li>
              <li><Link href="/vendeur"        className="hover:text-orange-400 transition-colors">{t('footer.pricing')}</Link></li>
              <li><Link href="/contact"        className="hover:text-orange-400 transition-colors">{t('footer.contact')}</Link></li>
              <li><Link href="/contact"        className="hover:text-orange-400 transition-colors">{t('footer.press')}</Link></li>
              <li><Link href="/contact"        className="hover:text-orange-400 transition-colors">{t('footer.jobs')}</Link></li>
            </ul>
          </div>

          {/* App */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              {t('footer.app')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>🤖</span> {t('footer.android_soon')}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>🍎</span> {t('footer.ios_soon')}
              </div>
            </div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mt-6 mb-3">
              {t('footer.popular_cities')}
            </h4>
            <ul className="space-y-1 text-sm text-white/60">
              {[
                { name: 'Abidjan',       slug: 'Abidjan' },
                { name: 'Bouaké',        slug: 'Bouaké' },
                { name: 'Yamoussoukro', slug: 'Yamoussoukro' },
                { name: 'San-Pédro',    slug: 'San-Pédro' },
              ].map(v => (
                <li key={v.name}>
                  <Link
                    href={`/search?city=${encodeURIComponent(v.slug)}`}
                    className="hover:text-orange-400 transition-colors"
                  >
                    {v.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-4">
          <p className="text-white/30 text-sm">{t('footer.copyright')}</p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/cgu"              className="hover:text-orange-400 transition-colors">{t('footer.terms')}</Link>
            <Link href="/confidentialite"  className="hover:text-orange-400 transition-colors">{t('footer.privacy')}</Link>
            <Link href="/contact"          className="hover:text-orange-400 transition-colors">{t('footer.cookies')}</Link>
            <Link href="/contact"          className="hover:text-orange-400 transition-colors">{t('footer.contact')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
