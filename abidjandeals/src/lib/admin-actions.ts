// src/lib/admin-actions.ts
'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { ModerationAction, ListingStatus, DashboardStats } from '@/types/admin'

async function getSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
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
}

async function assertAdmin(supabase: Awaited<ReturnType<typeof getSupabaseServer>>) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Non authentifie')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Acces refuse : role admin requis')
  }

  return session.user.id
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await getSupabaseServer()
  await assertAdmin(supabase)

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: newUsersToday },
    { count: newUsersWeek },
    { count: totalListings },
    { count: pendingListings },
    { count: activeListings },
    { count: listingsToday },
    { count: openReports },
    { count: resolvedReportsWeek },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('reports').select('*', { count: 'exact', head: true })
      .eq('status', 'resolved').gte('resolved_at', weekStart),
  ])

  return {
    total_users:              totalUsers           ?? 0,
    new_users_today:          newUsersToday        ?? 0,
    new_users_week:           newUsersWeek         ?? 0,
    total_listings:           totalListings        ?? 0,
    pending_listings:         pendingListings      ?? 0,
    active_listings:          activeListings       ?? 0,
    listings_today:           listingsToday        ?? 0,
    open_reports:             openReports          ?? 0,
    resolved_reports_week:    resolvedReportsWeek  ?? 0,
    revenue_month:            0,
    revenue_growth_percent:   0,
  }
}

export async function moderateListing(
  listingId: string,
  action: ModerationAction,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServer()
    const moderatorId = await assertAdmin(supabase)

    const statusMap: Partial<Record<ModerationAction, ListingStatus>> = {
      approve: 'active',
      reject:  'rejected',
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (action === 'approve' || action === 'reject') updates.status = statusMap[action]
    if (action === 'feature')   updates.is_featured = true
    if (action === 'unfeature') updates.is_featured = false

    if (action === 'delete') {
      const { error } = await supabase.from('listings').delete().eq('id', listingId)
      if (error) throw error
    } else {
      const { error } = await supabase.from('listings').update(updates).eq('id', listingId)
      if (error) throw error
    }

    await supabase.from('moderation_logs').insert({
      listing_id:   listingId,
      moderator_id: moderatorId,
      action,
      reason:       reason ?? null,
      created_at:   new Date().toISOString(),
    }).then(() => {})

    revalidatePath('/admin')
    revalidatePath('/admin/moderation')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

export async function toggleUserBan(
  userId: string,
  ban: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServer()
    await assertAdmin(supabase)

    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: ban, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

export async function resolveReport(
  reportId: string,
  status: 'resolved' | 'dismissed'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServer()
    const moderatorId = await assertAdmin(supabase)

    const { error } = await supabase
      .from('reports')
      .update({
        status,
        resolved_by: moderatorId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (error) throw error
    revalidatePath('/admin/reports')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}