import { notFound } from "next/navigation"
import { locales, isLocale } from "@/i18n/config"
import { LocaleProvider } from "@/contexts/LocaleContext"
import { ThemeProvider } from "@/contexts/ThemeContext"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return (
    <ThemeProvider theme="light">
      <LocaleProvider locale={locale}>
        {children}
      </LocaleProvider>
    </ThemeProvider>
  )
}
