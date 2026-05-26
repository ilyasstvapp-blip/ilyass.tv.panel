"use client"

import { createContext, useContext, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import type { Locale } from "@/i18n/config"
import { locales } from "@/i18n/config"
import { getDirection } from "@/i18n/config"

interface LocaleContextValue {
  locale: Locale
  direction: "ltr" | "rtl"
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()

  const direction = getDirection(locale)

  const setLocale = useCallback(
    (newLocale: Locale) => {
      const segments = (params?.locale as string)?.split("/") || []
      const path = window.location.pathname
      const newPath = path.replace(/^\/[a-z]{2}/, `/${newLocale}`)
      router.push(newPath)
    },
    [params, router]
  )

  return (
    <LocaleContext.Provider value={{ locale, direction, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
