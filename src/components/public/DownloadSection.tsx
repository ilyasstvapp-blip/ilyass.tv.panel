"use client"

import { useTranslations } from "@/i18n/useTranslations"
import { motion } from "framer-motion"

const platforms = [
  {
    id: "android-mobile",
    name: "Android Mobile",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-emerald-500 to-teal-500",
    badge: "APK",
    size: "v2.1.0 • 45 MB",
  },
  {
    id: "android-tv",
    name: "Android TV",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    gradient: "from-blue-500 to-indigo-500",
    badge: "APK",
    size: "v2.1.0 • 52 MB",
  },
  {
    id: "emulator",
    name: "Emulator",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    gradient: "from-purple-500 to-pink-500",
    badge: "APK",
    size: "v2.1.0 • 48 MB",
  },
]

const changelog = [
  "New UI design with improved navigation",
  "Enhanced streaming stability",
  "Fixed buffering issues on low bandwidth",
  "Added support for Android 14",
]

export default function DownloadSection() {
  const { t } = useTranslations()

  return (
    <section id="download" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-page-bg)" }} />
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Ready to Install
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t("download.title")}
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            {t("download.subtitle")}
          </p>
        </motion.div>

        {/* Download Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {/* Gradient top accent */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${platform.gradient}`} />

              <div className="p-6 lg:p-7">
                {/* Platform icon and badge */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={platform.icon} />
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: `linear-gradient(135deg, rgba(34,211,238,0.1), rgba(99,102,241,0.1))`,
                      color: "var(--accent)",
                      border: "1px solid rgba(34,211,238,0.15)",
                    }}>
                    {platform.badge}
                  </span>
                </div>

                {/* Platform name and size */}
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  {platform.name}
                </h3>
                <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
                  {platform.size}
                </p>

                {/* Download Button */}
                <a
                  href="#"
                  className="group/btn inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 gradient-btn"
                >
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download APK
                </a>

                {/* Changelog Preview */}
                {i === 0 && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                      What&apos;s New
                    </p>
                    <ul className="space-y-1">
                      {changelog.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                          <span className="mt-0.5 w-1 h-1 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Latest version: <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>v2.1.0</span>
            {" • "}Requires Android 8.0+
            {" • "}Free &amp; Unlimited
          </p>
        </motion.div>
      </div>
    </section>
  )
}
