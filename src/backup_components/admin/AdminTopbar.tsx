// src/components/admin/AdminTopbar.tsx

interface AdminProfile {
  id: string
  prenom: string | null
  nom: string | null
  email: string | null
  avatar_url: string | null
  role: string
}

export function AdminTopbar({ admin }: { admin: AdminProfile }) {
  const displayName = [admin.prenom, admin.nom].filter(Boolean).join(' ') || admin.email || 'Admin'

  return (
    <header className="h-14 border-b border-white/6 bg-[#0d0d0d] flex items-center justify-between px-6 shrink-0">
      <p className="text-sm font-semibold text-gray-100">Dashboard</p>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{displayName}</span>
        <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs font-medium">
          Admin
        </span>
      </div>
    </header>
  )
}
