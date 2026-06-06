"use client"

import { useTranslations } from "@/i18n/useTranslations"
import { locales, localeNames, type Locale } from "@/i18n/config"
import { useRouter } from "next/navigation"
import { useLocale } from "@/contexts/LocaleContext"
import { usePublicSettings } from "@/hooks/usePublicSettings"
import { MotionDiv, fadeInUp, staggerContainer, float } from "prism-kit"

export default function Footer() {
  const { t } = useTranslations()
  const { locale } = useLocale()
  const router = useRouter()
  const { footerContent, appCards } = usePublicSettings()

  const platforms = appCards.map(c => ({ name: c.name || c.platform, url: c.apkUrl }))
  const social = footerContent?.social ?? {}
  const contactEmail = footerContent?.email ?? ""

  return (
    <footer className="relative"
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border-light)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <MotionDiv variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="md:col-span-2">
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
              {footerContent?.description || t("footer.description")}
            </p>
            {contactEmail && (
              <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Email: </span>
                {contactEmail}
              </p>
            )}
            {/* Social Links */}
            {Object.keys(social).length > 0 && (
              <div className="flex items-center gap-3 mt-5">
                {social.telegram && (
                  <a href={social.telegram} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                    style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)" }}>
                    <svg className="w-4 h-4" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </a>
                )}
                {social.whatsapp && (
                  <a href={social.whatsapp} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                    style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)" }}>
                    <svg className="w-4 h-4" style={{ color: "var(--accent-green)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21l1.65-3.8a9 9 0 113.15 3.15L3 21z" />
                    </svg>
                  </a>
                )}
                {social.website && (
                  <a href={social.website} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                    style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)" }}>
                    <svg className="w-4 h-4" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </MotionDiv>

          <MotionDiv variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h4 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
              {t("footer.platform")}
            </h4>
            <ul className="space-y-3">
              {platforms.length > 0 ? platforms.map((p) => (
                <li key={p.name}>
                  <a href={p.url || "#download"} className="text-sm transition-all duration-200 hover:pl-1"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                    {p.name}
                  </a>
                </li>
              )) : ["Android Mobile", "Android TV", "Emulator"].map((item) => (
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
          </MotionDiv>

          <MotionDiv variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}>
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
          </MotionDiv>
        </div>

        <MotionDiv variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{ borderTop: "1px solid var(--border-light)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} ILYASS TV. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {locales.map((l) => (
              <button key={l} onClick={() => { const path = window.location.pathname.replace(/^\/[a-z]{2}/, `/${l}`); router.push(path) }}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
                style={{
                  background: l === locale ? "var(--accent-subtle)" : "transparent",
                  color: l === locale ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${l === locale ? "var(--accent)" : "var(--border-light)"}`,
                }}>
                {localeNames[l]}
              </button>
            ))}
          </div>
        </MotionDiv>
      </div>
    </footer>
  )
}
