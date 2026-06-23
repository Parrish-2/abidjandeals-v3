import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile } from './supabase'

interface FilterState {
  categoryId: string | null
  subcategory: string | null
  city: string | null
  priceMin: number | null
  priceMax: number | null
  etat: string | null
  sort: 'recent' | 'price_asc' | 'price_desc' | 'views'
  search: string
}

interface AppState {
  user: Profile | null
  setUser: (user: Profile | null) => void
  filters: FilterState
  setFilter: (key: keyof FilterState, value: any) => void
  resetFilters: () => void
  setCategory: (categoryId: string, subcategory?: string) => void
  setCity: (city: string | null) => void
  authModalOpen: boolean
  setAuthModalOpen: (open: boolean) => void
  pendingAction: string | null
  setPendingAction: (action: string | null) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

const defaultFilters: FilterState = {
  categoryId: null,
  subcategory: null,
  city: null,
  priceMin: null,
  priceMax: null,
  etat: null,
  sort: 'recent',
  search: '',
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      filters: defaultFilters,
      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),
      resetFilters: () => set({ filters: defaultFilters }),
      setCategory: (categoryId, subcategory) =>
        set(() => ({
          filters: { ...defaultFilters, categoryId, subcategory: subcategory ?? null },
        })),
      setCity: (city) =>
        set((state) => ({ filters: { ...state.filters, city } })),

      authModalOpen: false,
      setAuthModalOpen: (open) => set({ authModalOpen: open }),
      pendingAction: null,
      setPendingAction: (action) => set({ pendingAction: action }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    {
      name: 'abidjandeals-store',
      // Persister uniquement l'utilisateur et les filtres ville
      partialize: (state) => ({
        user: state.user,
        filters: { city: state.filters.city },
      }),
    }
  )
)
