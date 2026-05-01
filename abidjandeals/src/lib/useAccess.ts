import { useStore } from '@/lib/store'

export function useAccess() {
  const { user } = useStore()

  const hasAccess = (): boolean => {
    if (!user) return false
    if (user.role === 'admin') return true          // bypass total admin
    if (user.is_verified === true) return true      // vendeur vérifié
    if (user.verified_seller === true) return true  // fallback colonne BDD
    return false
  }

  const isAdmin = (): boolean => user?.role === 'admin'

  return { hasAccess, isAdmin, user }
}
