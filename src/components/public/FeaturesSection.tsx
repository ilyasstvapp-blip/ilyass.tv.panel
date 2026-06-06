"use client"

import { useTranslations } from "@/i18n/useTranslations"
import { MotionDiv, staggerContainer, fadeInUp } from "prism-kit"
import { usePublicSettings } from "@/hooks/usePublicSettings"
import type { FeatureItem } from "@/hooks/usePublicSettings"

const gradients = [
  "from-blue-500 to-cyan-500",
  "from-indigo-500 to-purple-500",
  "from-purple-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
]

const featureIcons = [
  "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  "M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  "M13 10V3L4 14h7v7l9-11h-7z",
  "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z",
]

export default function FeaturesSection() {
  const { t } = useTranslations()
  const { features } = usePublicSettings()
  const items = features.length > 0 ? features : null

  return (
    <section id="features" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-page-bg)" }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent-purple) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionDiv
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14 lg:mb-18"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t("features.title")}
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            {t("features.subtitle")}
          </p>
        </MotionDiv>

        {items ? (
          <MotionDiv
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((f, i) => {
              const grad = gradients[i % gradients.length]
              const icon = featureIcons[i % featureIcons.length]
              return (
                <MotionDiv
                  key={f.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div className="p-7 lg:p-8">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {f.description}
                    </p>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${grad.includes('blue') ? 'rgba(37,99,235,0.02)' : grad.includes('purple') ? 'rgba(139,92,246,0.02)' : grad.includes('emerald') ? 'rgba(16,185,129,0.02)' : 'rgba(236,72,153,0.02)'}, transparent)`,
                    }}
                  />
                </MotionDiv>
              )
            })}
          </MotionDiv>
        ) : (
          /* Fallback: translation-based features when no settings configured */
          <MotionDiv
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { key: "live_tv", grad: 0, iconIdx: 0 },
              { key: "live_events", grad: 1, iconIdx: 1 },
              { key: "responsive_ui", grad: 2, iconIdx: 2 },
              { key: "fast_streaming", grad: 3, iconIdx: 3 },
              { key: "android_tv", grad: 4, iconIdx: 4 },
              { key: "modern_player", grad: 5, iconIdx: 5 },
            ].map((f, i) => (
              <MotionDiv
                key={f.key}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="p-7 lg:p-8">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[f.grad]} flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={featureIcons[f.iconIdx]} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                    {t(`features.${f.key}` as any)}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {t(`features.${f.key}_desc` as any)}
                  </p>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${gradients[f.grad].includes('blue') ? 'rgba(37,99,235,0.02)' : gradients[f.grad].includes('purple') ? 'rgba(139,92,246,0.02)' : gradients[f.grad].includes('emerald') ? 'rgba(16,185,129,0.02)' : 'rgba(236,72,153,0.02)'}, transparent)`,
                  }}
                />
              </MotionDiv>
            ))}
          </MotionDiv>
        )}
      </div>
    </section>
  )
}
