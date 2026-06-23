'use client'

import { supabase } from '@/lib/supabase'
import { FileText, Flag, Home, LayoutDashboard, LogOut, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface AdminProfile {
  id: string
  prenom: string | null
  nom: string | null
  email: string | null
  avatar_url: string | null
  role: string
}

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/moderation', label: 'Modération', icon: FileText, exact: false },
  { href: '/admin/pubs', label: 'Régie Pub', icon: Megaphone, exact: false },
  { href: '/admin/vendeurs', label: 'Signalements', icon: Flag, exact: false },
]

export function AdminSidebar({ admin }: { admin: AdminProfile }) {
  const pathname = usePathname()
  const router = useRouter()

  const displayName = [admin.prenom, admin.nom].filter(Boolean).join(' ') || admin.email || 'Admin'
  const initial = displayName[0]?.toUpperCase() ?? 'A'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-[#0d0d0d] border-r border-white/[0.06] flex flex-col">

      {/* Logo */}
      <div className="h-14 flex items-center px-6 border-b border-white/[0.06] shrink-0">
        <span className="font-bold text-orange-400 text-lg tracking-tight">
          Abidjan<span className="text-white">Deals</span>
        </span>
        <span className="ml-2 text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Navigation
        </p>

        {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
          // ✅ FIX : exact=true pour /admin afin d'éviter qu'il soit actif sur toutes les sous-pages
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/20'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.05] border border-transparent',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        {/* Séparateur */}
        <div className="my-3 border-t border-white/[0.06]" />

        {/* Lien retour accueil */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-100 hover:bg-white/[0.05] border border-transparent transition-all duration-150"
        >
          <Home className="w-4 h-4 shrink-0" />
          Retour au site
        </Link>
      </nav>

      {/* Admin info + logout */}
      <div className="p-4 border-t border-white/[0.06] shrink-0 space-y-3">
        <div className="flex items-center gap-3 px-2">
          {admin.avatar_url ? (
            <img
              src={admin.avatar_url}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 text-xs font-bold">{initial}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-100 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}