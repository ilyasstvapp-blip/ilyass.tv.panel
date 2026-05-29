"use client"

import { useTranslations } from "@/i18n/useTranslations"
import { motion } from "framer-motion"

const screenshots = [
  { label: "Live TV", gradient: "from-blue-500 to-cyan-500", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Live Events", gradient: "from-indigo-500 to-purple-500", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  { label: "Channel List", gradient: "from-purple-500 to-pink-500", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { label: "Player", gradient: "from-rose-500 to-pink-500", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
]

export default function ScreenshotsSection() {
  const { t } = useTranslations()

  return (
    <section id="screenshots" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-page-bg)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 lg:mb-18"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t("screenshots.title")}
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            {t("screenshots.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {screenshots.map((shot, i) => (
            <motion.div
              key={shot.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className={`aspect-[9/16] bg-gradient-to-br ${shot.gradient} flex items-center justify-center transition-all duration-500 group-hover:scale-[1.03]`}>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={shot.icon} />
                      </svg>
                    </div>
                    <span className="text-white/90 font-semibold text-sm tracking-wide">{shot.label}</span>
                  </div>
                </div>
                <div className="p-4 text-center border-t" style={{ borderColor: "var(--border-light)" }}>
                  <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{shot.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
