"use client"

import { useTranslations } from "@/i18n/useTranslations"

const screenshots = [
  { label: "Live TV", gradient: "linear-gradient(135deg, #2563eb, #3b82f6)" },
  { label: "Live Events", gradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)" },
  { label: "Channel List", gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
  { label: "Player", gradient: "linear-gradient(135deg, #ec4899, #2563eb)" },
]

export default function ScreenshotsSection() {
  const { t } = useTranslations()

  return (
    <section id="screenshots" className="relative py-24">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)",
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            {t("screenshots.title")}
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            {t("screenshots.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {screenshots.map((shot) => (
            <div
              key={shot.label}
              className="card overflow-hidden group"
              style={{ background: "var(--surface)" }}
            >
              <div
                className="aspect-[9/16] flex items-center justify-center transition-all group-hover:scale-[1.02]"
                style={{ background: shot.gradient, opacity: 0.9 }}
              >
                <div className="text-center p-6">
                  <svg className="w-12 h-12 mx-auto mb-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/80 font-medium text-sm">{shot.label}</span>
                </div>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{shot.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
