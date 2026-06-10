'use client'

import { AuthModal } from '@/components/AuthModal'
import { MegaMenu } from '@/components/MegaMenu'
import { useI18n } from '@/contexts/i18nContext'
import { CATEGORIES } from '@/lib/data'
import { useStore } from '@/lib/store'
import { Profile, supabase } from '@/lib/supabase'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown, Globe,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Package,
  Plus,
  PlusCircle,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Location {
  id: string
  name: string
  region: string
  is_active: boolean
}
type GroupedLocations = Record<string, Location[]>

// ─── UserMenu Portal ──────────────────────────────────────────────────────────

interface UserMenuProps {
  user: Profile
  onClose: () => void
  anchorRef: React.RefObject<HTMLDivElement>
}

function UserMenu({ user, onClose, anchorRef }: UserMenuProps) {
  const router = useRouter()
  const { t } = useI18n()
  const isAdmin = user?.role === 'admin'
  const [pos, setPos] = useState({ top: 0, right: 0 })

  const calcPos = useCallback(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + window.scrollY + 6, right: window.innerWidth - rect.right })
  }, [anchorRef])

  useEffect(() => {
    calcPos()
    window.addEventListener('resize', calcPos, { passive: true })
    window.addEventListener('scroll', calcPos, { passive: true })
    return () => {
      window.removeEventListener('resize', calcPos)
      window.removeEventListener('scroll', calcPos)
    }
  }, [calcPos])

  const USER_LINKS = [
    { href: '/dashboard', label: t('dashboard.tab_overview'), icon: LayoutDashboard, desc: t('dashboard.active_ads') },
    { href: '/dashboard', label: t('dashboard.tab_ads'), icon: Package, desc: t('dashboard.no_ads_desc') },
    { href: '/messages', label: t('dashboard.tab_messages'), icon: MessageSquare, desc: t('dashboard.messages_desc') },
    { href: '/favorites', label: t('dashboard.tab_favorites'), icon: Heart, desc: t('dashboard.favorites_desc') },
    { href: '/publier', label: t('dashboard.publish_ad'), icon: PlusCircle, desc: t('hero.cta_free'), highlight: true },
  ]

  function handleNav(href: string) { onClose(); router.push(href) }
  async function handleLogout() { await supabase.auth.signOut(); onClose(); router.push('/') }

  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      data-usermenu-portal
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        position: 'absolute', top: pos.top, right: pos.right,
        background: '#fff', border: '0.5px solid #e5e7eb',
        borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
        width: 280, zIndex: 99999, overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #0F1117 0%, #1a2535 100%)', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#F97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
            {user?.prenom?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{user?.prenom} {user?.nom}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{user?.email}</p>
          </div>
          {isAdmin && (
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: '#F97316', background: 'rgba(249,115,22,0.15)', border: '0.5px solid rgba(249,115,22,0.3)', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>ADMIN</span>
          )}
        </div>
      </div>
      <div style={{ padding: '8px 6px' }}>
        {USER_LINKS.map(({ href, label, icon: Icon, desc, highlight }) => (
          <button key={`${href}-${label}`} onClick={() => handleNav(href)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, background: highlight ? 'rgba(249,115,22,0.06)' : 'transparent', width: '100%', border: 'none', cursor: 'pointer', transition: 'background 0.1s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = highlight ? 'rgba(249,115,22,0.1)' : '#f9fafb'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = highlight ? 'rgba(249,115,22,0.06)' : 'transparent'}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: highlight ? 'rgba(249,115,22,0.1)' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} color={highlight ? '#F97316' : '#6b7280'} />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: highlight ? 600 : 500, color: highlight ? '#F97316' : '#111827', margin: 0 }}>{label}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{desc}</p>
            </div>
          </button>
        ))}
        {isAdmin && (
          <>
            <div style={{ height: '0.5px', background: '#f3f4f6', margin: '6px 4px' }} />
            <button onClick={() => handleNav('/admin')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Settings size={15} color="#6b7280" />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0 }}>Administration</p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Moderation & management</p>
              </div>
            </button>
          </>
        )}
      </div>
      <div style={{ padding: '6px 6px 8px', borderTop: '0.5px solid #f3f4f6' }}>
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 8, background: '#fef2f2', border: 'none', cursor: 'pointer', transition: 'background 0.1s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fee2e2'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fef2f2'}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LogOut size={15} color="#dc2626" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#dc2626' }}>{t('dashboard.logout')}</span>
        </button>
      </div>
    </motion.div>,
    document.body
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar({ hideCategories = false }: { hideCategories?: boolean }) {
  const router = useRouter()
  const { t, locale, changeLocale } = useI18n()
  const { user, setAuthModalOpen, setPendingAction, setCategory, setCity, filters } = useStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [cityDropdown, setCityDropdown] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [groupedLocations, setGroupedLocations] = useState<GroupedLocations>({})
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    supabase.from('locations').select('id, name, region, is_active').eq('is_active', true).order('region').order('name')
      .then(({ data, error }) => {
        if (!error && data) {
          const grouped = data.reduce<GroupedLocations>((acc, loc) => {
            if (!acc[loc.region]) acc[loc.region] = []
            acc[loc.region].push(loc)
            return acc
          }, {})
          setGroupedLocations(grouped)
        }
        setLocationsLoading(false)
      })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!cityDropdown) return
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-city-dropdown]')) setCityDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [cityDropdown])

  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!userMenuRef.current?.contains(target) && !target.closest('[data-usermenu-portal]')) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenuOpen])

  // ── Bloquer le scroll body quand le menu mobile est ouvert ──
  useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenu])

  const selectedCity = filters.city || 'Abidjan'

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  function handlePublish() {
    if (!user) { setPendingAction('publish'); setAuthModalOpen(true) }
    else router.push('/publier')
  }

  return (
    <>
      {/* ── Overlay sombre derrière le menu mobile ── */}
      {mobileMenu && (
        <div
          onClick={() => setMobileMenu(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 49,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#ffffff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(229,231,235,0.7)' : '#f1f5f9'}`,
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
        transition: 'background 0.25s, box-shadow 0.25s, border-color 0.25s',
        // ✅ FIX PRINCIPAL : empêcher le débordement horizontal
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
      }}>

        {/* ── Main bar ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          // ✅ padding réduit sur mobile pour éviter le débordement
          padding: '0 12px',
          height: 52,
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#1e293b', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
              Abidjan<span style={{ color: '#F97316' }}>Deals</span>
            </span>
            <span style={{ fontSize: 13 }}>🇨🇮</span>
          </Link>

          {/* ── Desktop search ── */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex"
            style={{
              flex: 1,
              maxWidth: 580,
              alignItems: 'center',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              overflow: 'visible',
              height: 40,
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocusCapture={e => { const f = e.currentTarget as HTMLFormElement; f.style.borderColor = '#F97316'; f.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)' }}
            onBlurCapture={e => { const f = e.currentTarget as HTMLFormElement; f.style.borderColor = '#e2e8f0'; f.style.boxShadow = 'none' }}
          >
            {/* City selector */}
            <div style={{ position: 'relative', flexShrink: 0 }} data-city-dropdown>
              <button type="button" onClick={() => setCityDropdown(prev => !prev)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 40, fontSize: 12, fontWeight: 500, color: '#475569', background: 'none', border: 'none', borderRight: '1.5px solid #e2e8f0', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <MapPin size={12} style={{ color: '#F97316' }} />
                {selectedCity}
                <ChevronDown size={11} style={{ transition: 'transform 0.2s', transform: cityDropdown ? 'rotate(180deg)' : 'none', color: '#94a3b8' }} />
              </button>

              {cityDropdown && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb', padding: '8px 0', minWidth: 220, zIndex: 200, maxHeight: 320, overflowY: 'auto' }}>
                  <button type="button" onClick={() => { setCity(null); setCityDropdown(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, fontWeight: !filters.city ? 700 : 400, color: !filters.city ? '#F97316' : '#374151', background: !filters.city ? '#FFF7ED' : 'none', border: 'none', cursor: 'pointer' }}
                  >
                    🇨🇮 {t('search.all_ci')}
                  </button>
                  <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />
                  {locationsLoading
                    ? <div style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>{t('admin.loading')}</div>
                    : Object.entries(groupedLocations).map(([region, locs]) => (
                      <div key={region}>
                        <div style={{ padding: '6px 16px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#f9fafb' }}>{region}</div>
                        {locs.map(loc => (
                          <button key={loc.id} type="button" onClick={() => { setCity(loc.name); setCityDropdown(false) }}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: filters.city === loc.name ? '#F97316' : '#374151', fontWeight: filters.city === loc.name ? 600 : 400, background: filters.city === loc.name ? '#FFF7ED' : 'none', border: 'none', cursor: 'pointer' }}
                          >
                            {loc.name}
                          </button>
                        ))}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Input */}
            <input type="text" placeholder={t('header.search_placeholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '0 14px', height: 40, fontSize: 13, color: '#1e293b', background: 'none', border: 'none', outline: 'none' }}
            />

            {/* Bouton recherche */}
            <button type="submit"
              style={{ padding: '0 18px', height: 40, background: '#F97316', color: '#fff', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ea580c'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#F97316'}
            >
              <Search size={16} />
            </button>
          </form>

          {/* ── Mobile search ── */}
          <form onSubmit={handleSearch} className="flex md:hidden"
            style={{ flex: 1, alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, overflow: 'hidden', height: 34, minWidth: 0 }}
          >
            <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '0 8px', fontSize: 12, color: '#1e293b', background: 'none', border: 'none', outline: 'none', minWidth: 0, width: '100%' }}
            />
            <button type="submit" style={{ padding: '0 10px', height: 34, background: '#F97316', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <Search size={14} />
            </button>
          </form>

          {/* ── Séparateur visuel desktop ── */}
          <div className="hidden md:block" style={{ width: 1, height: 28, background: '#e2e8f0', flexShrink: 0 }} />

          {/* ── Right actions ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            marginLeft: 'auto',
          }}>

            <Link href="/vendeur" className="hidden md:flex"
              style={{ alignItems: 'center', padding: '5px 12px', borderRadius: 7, color: '#475569', fontSize: 12, fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#1e293b' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569' }}
            >
              {t('header.become_seller')}
            </Link>

            <Link href="/favorites" className="hidden md:flex"
              style={{ padding: 8, borderRadius: 8, color: '#475569', display: 'flex', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#1e293b' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569' }}
            >
              <Heart size={18} />
            </Link>

            <Link href="/messages" className="hidden md:flex"
              style={{ padding: 8, borderRadius: 8, color: '#475569', display: 'flex', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#1e293b' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569' }}
            >
              <MessageCircle size={18} />
            </Link>

            {/* Language switcher desktop */}
            <div className="hidden md:flex"
              style={{ alignItems: 'center', gap: 3, border: '1px solid #e2e8f0', borderRadius: 7, padding: '4px 9px', fontSize: 11 }}
            >
              <Globe size={11} style={{ marginRight: 1, color: '#94a3b8' }} />
              {(['fr', 'en'] as const).map(lang => (
                <button key={lang} onClick={() => changeLocale(lang)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: locale === lang ? 700 : 400, color: locale === lang ? '#F97316' : '#64748b', fontSize: 11, padding: '0 2px', transition: 'color 0.15s' }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="hidden md:block" style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px', flexShrink: 0 }} />

            {/* User connecté desktop */}
            {user ? (
              <div ref={userMenuRef} className="hidden md:block" style={{ position: 'relative' }}>
                <button onClick={() => setUserMenuOpen(prev => !prev)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 4px', borderRadius: 9, border: '1px solid #e2e8f0', background: userMenuOpen ? '#f8fafc' : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #ea580c)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {user.prenom?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#1e293b', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.prenom}
                  </span>
                  <ChevronDown size={12} style={{ color: '#94a3b8', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && mounted && (
                    <UserMenu user={user} onClose={() => setUserMenuOpen(false)} anchorRef={userMenuRef} />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="hidden md:flex"
                style={{ alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', color: '#1e293b', fontSize: 12, fontWeight: 500, background: '#fff', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0' }}
              >
                <User size={14} />
                {t('header.login')}
              </button>
            )}

            {/* Bouton Publier — icône seule sur mobile, texte sur desktop */}
            <button onClick={handlePublish}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRadius: 9, background: 'linear-gradient(135deg, #F97316 0%, #ef4444 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, flexShrink: 0, boxShadow: '0 2px 8px rgba(249,115,22,0.35)', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)'; el.style.boxShadow = '0 4px 16px rgba(249,115,22,0.45)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'linear-gradient(135deg, #F97316 0%, #ef4444 100%)'; el.style.boxShadow = '0 2px 8px rgba(249,115,22,0.35)' }}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">{t('header.post_ad')}</span>
            </button>

            {/* Burger mobile */}
            <button onClick={() => setMobileMenu(prev => !prev)} className="md:hidden"
              style={{ padding: 7, borderRadius: 7, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Desktop categories bar ── */}
        {!hideCategories && (
          <div className="hidden md:block" style={{ background: '#0F1117', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}>
              <MegaMenu activeCategoryId={filters.categoryId ?? null} onCategoryClick={(catId) => setCategory(catId)} />
            </div>
          </div>
        )}

        {/* ── Mobile menu — panneau latéral droit ── */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              className="md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '80%',
                maxWidth: 320,
                background: '#fff',
                zIndex: 51,
                overflowY: 'auto',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                boxSizing: 'border-box',
              }}
            >
              {/* Header du panneau */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>
                  Abidjan<span style={{ color: '#F97316' }}>Deals</span> 🇨🇮
                </span>
                <button onClick={() => setMobileMenu(false)} style={{ padding: 6, borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  <X size={18} color="#475569" />
                </button>
              </div>

              <div style={{ padding: '12px 16px', boxSizing: 'border-box' }}>
                {/* Section utilisateur */}
                {user ? (
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px', marginBottom: 16, border: '0.5px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                        {user.prenom?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.prenom} {user.nom}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {[
                        { href: '/dashboard', label: t('dashboard.tab_overview'), icon: LayoutDashboard },
                        { href: '/messages', label: t('dashboard.tab_messages'), icon: MessageSquare },
                        { href: '/favorites', label: t('dashboard.tab_favorites'), icon: Heart },
                        { href: '/publier', label: t('dashboard.publish'), icon: PlusCircle },
                      ].map(({ href, label, icon: Icon }) => (
                        <button key={`mobile-${href}-${label}`} onClick={() => { setMobileMenu(false); router.push(href) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, background: '#fff', border: '0.5px solid #e2e8f0', fontSize: 11, fontWeight: 500, color: '#334155', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <Icon size={13} color="#F97316" />
                          {label}
                        </button>
                      ))}
                    </div>
                    <button onClick={async () => { await supabase.auth.signOut(); setMobileMenu(false); router.push('/') }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, width: '100%', padding: '8px 10px', borderRadius: 8, background: '#fef2f2', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 500, cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <LogOut size={13} /> {t('dashboard.logout')}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setAuthModalOpen(true); setMobileMenu(false) }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', marginBottom: 16, borderRadius: 10, background: 'linear-gradient(135deg, #F97316 0%, #ef4444 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(249,115,22,0.35)' }}
                  >
                    <User size={16} /> {t('header.login')} / {t('footer.register')}
                  </button>
                )}

                {/* Catégories */}
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Catégories</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => { setCategory(cat.id); router.push(`/search?category=${cat.id}`); setMobileMenu(false) }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer', fontSize: 10, fontWeight: 500, color: '#475569', boxSizing: 'border-box', transition: 'all 0.15s', width: '100%' }}
                    >
                      <span style={{ fontSize: 20 }}>{cat.icon}</span>
                      <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textAlign: 'center', width: '100%', lineHeight: 1.2 } as React.CSSProperties}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Langue */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={13} color="#94a3b8" />
                  <span style={{ fontSize: 12, color: '#64748b' }}>Langue :</span>
                  {(['fr', 'en'] as const).map(lang => (
                    <button key={lang} onClick={() => changeLocale(lang)}
                      style={{ background: locale === lang ? '#FFF7ED' : 'none', border: locale === lang ? '1px solid #fed7aa' : '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: locale === lang ? 700 : 400, color: locale === lang ? '#F97316' : '#64748b', cursor: 'pointer' }}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>
      <AuthModal />
    </>
  )
}