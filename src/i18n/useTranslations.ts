"use client"

import { useLocale } from "@/contexts/LocaleContext"
import en from "./messages/en.json"
import ar from "./messages/ar.json"
import fr from "./messages/fr.json"

const messages: Record<string, typeof en> = { en, ar, fr }

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : `${K}`
        : never
    }[keyof T]
  : never

type TranslationKey = NestedKeyOf<typeof en>

export function useTranslations() {
  const { locale } = useLocale()
  const msg = messages[locale] || messages.en

  function t(key: TranslationKey): string {
    const keys = key.split(".")
    let value: unknown = msg
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key
      }
    }
    return typeof value === "string" ? value : key
  }

  return { t, locale }
}
