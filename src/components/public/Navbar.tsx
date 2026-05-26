"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "@/contexts/LocaleContext"
import { useTranslations } from "@/i18n/useTranslations"
import { locales, localeNames, type Locale } from "@/i18n/config"

const navLinks = [
  { key: "nav.home", href: "#hero" },
  { key: "nav.download", href: "#download" },
  { key: "nav.features", href: "#features" },
  { key: "nav.screenshots", href: "#screenshots" },
]

export default function Navbar() {
  const { t } = useTranslations()
  const { locale, direction } = useLocale()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogoClick = () => {
    const next = clickCount + 1
    setClickCount(next)
    if (next >= 5) {
      setClickCount(0)
      router.push("/admin-login")
    }
    setTimeout(() => setClickCount(0), 3000)
  }

  const switchLocale = (l: Locale) => {
    const path = window.location.pathname.replace(/^\/[a-z]{2}/, `/${l}`)
    router.push(path)
    setLangOpen(false)
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-light)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "var(--accent-gradient)" }}
            >
              IT
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              ILYASS <span style={{ color: "var(--accent)" }}>TV</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
              >
                {t(link.key as any)}
              </a>
            ))}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{locale.toUpperCase()}</span>
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div
                    className="absolute top-full mt-2 right-0 z-20 min-w-[140px] rounded-xl overflow-hidden shadow-lg border"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {locales.map((l) => (
                      <button
                        key={l}
                        onClick={() => switchLocale(l)}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                        style={{
                          color: l === locale ? "var(--accent)" : "var(--text-primary)",
                          background: l === locale ? "var(--accent-subtle)" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (l !== locale) e.currentTarget.style.background = "var(--bg-tertiary)"
                        }}
                        onMouseLeave={(e) => {
                          if (l !== locale) e.currentTarget.style.background = "transparent"
                        }}
                      >
                        {l === locale && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={l !== locale ? "ml-6" : ""}>{localeNames[l]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: "var(--text-primary)" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                {t(link.key as any)}
              </a>
            ))}
            <div className="border-t pt-3 mt-3" style={{ borderColor: "var(--border-light)" }}>
              <p className="text-xs font-medium mb-2 px-4" style={{ color: "var(--text-muted)" }}>Language</p>
              <div className="space-y-1">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors"
                    style={{
                      color: l === locale ? "var(--accent)" : "var(--text-primary)",
                      background: l === locale ? "var(--accent-subtle)" : "transparent",
                    }}
                  >
                    {localeNames[l]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
