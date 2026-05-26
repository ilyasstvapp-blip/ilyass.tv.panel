"use client"

import { useTranslations } from "@/i18n/useTranslations"
import { locales, localeNames, type Locale } from "@/i18n/config"
import { useRouter } from "next/navigation"
import { useLocale } from "@/contexts/LocaleContext"

export default function Footer() {
  const { t } = useTranslations()
  const { locale } = useLocale()
  const router = useRouter()

  return (
    <footer style={{
      background: "var(--bg-primary)",
      borderTop: "1px solid var(--border-light)",
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "var(--accent-gradient)" }}
              >
                IT
              </div>
              <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                ILYASS <span style={{ color: "var(--accent)" }}>TV</span>
              </span>
            </div>
            <p className="text-sm max-w-md" style={{ color: "var(--text-muted)" }}>
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              {t("footer.platform")}
            </h4>
            <ul className="space-y-2">
              {["Android Mobile", "Android TV", "Emulator"].map((item) => (
                <li key={item}>
                  <a href="#download" className="text-sm transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              {t("footer.company")}
            </h4>
            <ul className="space-y-2">
              {["About", "Contact", "Privacy"].map((item) => (
                <li key={item}>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--border-light)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} ILYASS TV. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => {
                  const path = window.location.pathname.replace(/^\/[a-z]{2}/, `/${l}`)
                  router.push(path)
                }}
                className="text-xs px-2.5 py-1 rounded-lg transition-all font-medium"
                style={{
                  background: l === locale ? "var(--accent-subtle)" : "transparent",
                  color: l === locale ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${l === locale ? "var(--accent)" : "transparent"}`,
                }}
              >
                {localeNames[l]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
