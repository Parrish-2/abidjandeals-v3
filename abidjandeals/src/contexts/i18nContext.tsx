'use client'
// src/contexts/i18nContext.tsx
// SSR-safe + Cookie persistance pour que la langue survive entre /dashboard et /admin

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import en from "../locales/en.json"
import fr from "../locales/fr.json"

const translations: Record<string, any> = { fr, en }
const COOKIE_KEY = "abidjan_locale"
const DEFAULT_LOCALE = "fr"

// ── Helpers cookie (SSR-safe) ─────────────────────────────────────────────────
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

// ── Lire la locale sauvegardée AVANT le premier rendu pour éviter le flash ────
function getInitialLocale(): string {
  if (typeof document === "undefined") return DEFAULT_LOCALE
  const saved = getCookie(COOKIE_KEY) || localStorage.getItem(COOKIE_KEY)
  if (saved && translations[saved]) return saved
  return DEFAULT_LOCALE
}

// ── Context ───────────────────────────────────────────────────────────────────
interface I18nContextType {
  locale: string
  t: (key: string) => string
  changeLocale: (locale: string) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Initialisation directe — pas de useState("fr") puis useEffect
  // getInitialLocale() s'exécute côté client uniquement (le composant est 'use client')
  const [locale, setLocale] = useState<string>(getInitialLocale)

  // Sync si le cookie change dans un autre onglet
  useEffect(() => {
    const saved = getCookie(COOKIE_KEY) || localStorage.getItem(COOKIE_KEY)
    if (saved && translations[saved] && saved !== locale) {
      setLocale(saved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".")

      // 1. Essaie la locale active
      let value: any = translations[locale]
      for (const k of keys) value = value?.[k]
      if (typeof value === "string") return value

      // 2. Fallback vers le français si la clé est absente
      let fallback: any = translations["fr"]
      for (const k of keys) fallback = fallback?.[k]
      if (typeof fallback === "string") return fallback

      // 3. Retourne la clé brute en dernier recours
      return key
    },
    [locale]
  )

  const changeLocale = useCallback((newLocale: string) => {
    if (!translations[newLocale]) return
    setLocale(newLocale)
    setCookie(COOKIE_KEY, newLocale)
    localStorage.setItem(COOKIE_KEY, newLocale)
  }, [])

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider")
  return ctx
}
