export const locales = ["en", "ar", "fr"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
}

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
  fr: "ltr",
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return localeDirections[locale]
}
