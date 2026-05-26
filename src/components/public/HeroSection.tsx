"use client"

import { useTranslations } from "@/i18n/useTranslations"

export default function HeroSection() {
  const { t } = useTranslations()

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, rgba(37,99,235,0.03) 0%, rgba(59,130,246,0.05) 50%, rgba(37,99,235,0.02) 100%)",
      }} />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent-light) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-light)",
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {t("hero.badge")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          <span className="gradient-text">{t("hero.title")}</span>
          <br />
          <span style={{ color: "var(--text-primary)" }}>
            {t("hero.subtitle")}
          </span>
        </h1>

        {/* Description */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("hero.description")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#download"
            className="gradient-btn inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t("hero.cta_download")}
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)"
              e.currentTarget.style.boxShadow = "var(--shadow-md)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)"
              e.currentTarget.style.boxShadow = "var(--shadow-sm)"
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("hero.cta_demo")}
          </a>
        </div>

        {/* Features */}
        <div className="mt-16 flex items-center justify-center gap-8 text-sm flex-wrap"
          style={{ color: "var(--text-muted)" }}>
          {[
            { key: "hero.feature_no_buffer", icon: "check" },
            { key: "hero.feature_4k", icon: "check" },
            { key: "hero.feature_support", icon: "check" },
          ].map((f) => (
            <span key={f.key} className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: "var(--success)" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t(f.key as any)}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to top, var(--bg-primary), transparent)" }} />
    </section>
  )
}
