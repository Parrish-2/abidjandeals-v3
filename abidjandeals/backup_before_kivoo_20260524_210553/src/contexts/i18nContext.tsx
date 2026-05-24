'use client'
// src/contexts/i18nContext.tsx
// SSR-safe + Cookie persistance pour que la langue survive entre /dashboard et /admin

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import fr from "../locales/fr.json"
import en from "../locales/en.json"

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

// ── Context ───────────────────────────────────────────────────────────────────
interface I18nContextType {
  locale: string
  t: (key: string) => string
  changeLocale: (locale: string) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Démarrage en FR côté serveur, lecture cookie côté client
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE)

  useEffect(() => {
    // Priorité : cookie > localStorage > défaut
    const saved = getCookie(COOKIE_KEY) || localStorage.getItem(COOKIE_KEY)
    if (saved && translations[saved]) {
      setLocale(saved)
    }
  }, [])

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".")
      let value: any = translations[locale]
      for (const k of keys) {
        value = value?.[k]
      }
      return typeof value === "string" ? value : key
    },
    [locale]
  )

  const changeLocale = useCallback((newLocale: string) => {
    if (!translations[newLocale]) return
    setLocale(newLocale)
    // Persiste dans cookie ET localStorage pour double sécurité
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