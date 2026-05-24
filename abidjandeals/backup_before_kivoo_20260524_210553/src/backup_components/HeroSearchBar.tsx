'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useI18n } from '@/contexts/i18nContext'

export function HeroSearchBar() {
  const router = useRouter()
  const { setAuthModalOpen, user } = useStore()
  const { t } = useI18n()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function handlePublish() {
    if (!user) { setAuthModalOpen(true); return }
    router.push('/publier')
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex items-center bg-white rounded-2xl shadow-xl overflow-hidden">
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 px-4 py-3 text-sm text-dark placeholder:text-gray-400 outline-none bg-transparent"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors flex items-center gap-2"
        >
          <Search size={16} />
          <span className="hidden sm:inline text-sm">{t('search.search_btn')}</span>
        </button>
      </form>

      <button
        onClick={handlePublish}
        className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-[10px] px-5 rounded-2xl transition-all hover:scale-[1.02] text-base"
      >
        {t('hero.cta_deposit')}
      </button>
      <p className="text-center text-gray-500 text-xs">{t('hero.cta_free')}</p>
    </div>
  )
}
