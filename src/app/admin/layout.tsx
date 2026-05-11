import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'

interface AdminProfile {
  id: string
  prenom: string | null
  nom: string | null
  email: string | null
  avatar_url: string | null
  role: string
}

async function getAdminUser(): Promise<AdminProfile> {
  const cookieStore = await cookies()

  // Client SSR pour lire la session depuis les cookies
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // ✅ FIX : getUser() valide le JWT auprès du serveur Supabase Auth
  // getSession() lit le cookie sans re-valider — tokens révoqués acceptés
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

  if (authError || !user) {
    redirect('/?auth=login&redirect=/admin')
  }

  // ✅ Client admin (service role) pour lire le profil sans RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, prenom, nom, email, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/')
  }

  return {
    id: profile.id,
    prenom: profile.prenom ?? null,
    nom: profile.nom ?? null,
    email: profile.email ?? null,
    avatar_url: profile.avatar_url ?? null,
    role: profile.role,
  } satisfies AdminProfile
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminUser()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <AdminSidebar admin={admin} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AdminTopbar admin={admin} />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
