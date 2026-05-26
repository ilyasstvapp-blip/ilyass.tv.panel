"use client"

import { useTranslations } from "@/i18n/useTranslations"

const features = [
  {
    key: "live_tv",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "#2563eb",
  },
  {
    key: "live_events",
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    color: "#3b82f6",
  },
  {
    key: "responsive_ui",
    icon: "M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    color: "#8b5cf6",
  },
  {
    key: "fast_streaming",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "#f59e0b",
  },
  {
    key: "android_tv",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "#10b981",
  },
  {
    key: "modern_player",
    icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "#ec4899",
  },
]

export default function FeaturesSection() {
  const { t } = useTranslations()

  return (
    <section id="features" className="relative py-24">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)",
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            {t("features.title")}
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.key}
              className="card p-6 group transition-all"
              style={{ background: "var(--surface)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{
                  background: `${f.color}10`,
                  color: f.color,
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                {t(`features.${f.key}` as any)}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {t(`features.${f.key}_desc` as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
