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
    <footer className="relative"
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border-light)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "var(--accent-gradient)" }}>
                IT
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                ILYASS <span style={{ color: "var(--accent)" }}>TV</span>
              </span>
            </div>
            <p className="text-sm max-w-md leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
              {t("footer.platform")}
            </h4>
            <ul className="space-y-3">
              {["Android Mobile", "Android TV", "Emulator"].map((item) => (
                <li key={item}>
                  <a href="#download" className="text-sm transition-all duration-200 hover:pl-1"
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
            <h4 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
              {t("footer.company")}
            </h4>
            <ul className="space-y-3">
              {["About", "Contact", "Privacy"].map((item) => (
                <li key={item}>
                  <span className="text-sm transition-all duration-200" style={{ color: "var(--text-muted)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{ borderTop: "1px solid var(--border-light)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} ILYASS TV. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => {
                  const path = window.location.pathname.replace(/^\/[a-z]{2}/, `/${l}`)
                  router.push(path)
                }}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
                style={{
                  background: l === locale ? "var(--accent-subtle)" : "transparent",
                  color: l === locale ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${l === locale ? "var(--accent)" : "var(--border-light)"}`,
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
