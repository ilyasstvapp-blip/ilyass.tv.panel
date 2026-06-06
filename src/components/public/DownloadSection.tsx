"use client"

import { useTranslations } from "@/i18n/useTranslations"
import { MotionDiv } from "prism-kit"
import { fadeInUp } from "prism-kit"
import { usePublicSettings } from "@/hooks/usePublicSettings"

export default function DownloadSection() {
  const { t } = useTranslations()
  const { primaryApp, loading, appCards } = usePublicSettings()

  const app = primaryApp
  const platforms = appCards.filter((c) => c.id !== app?.id)

  return (
    <section id="download" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-page-bg)" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <MotionDiv
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
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
        </MotionDiv>

        {loading ? (
          <div className="max-w-lg mx-auto">
            <div className="rounded-2xl animate-pulse" style={{ height: 280, background: "var(--surface)" }} />
          </div>
        ) : app ? (
          <div className="max-w-lg mx-auto">
            <MotionDiv
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl text-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {/* Top gradient bar */}
              <div className="h-1.5 w-full" style={{ background: "var(--accent-gradient)" }} />

              <div className="p-8 lg:p-10">
                {/* App icon */}
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "var(--accent-gradient)" }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* App name */}
                <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  {app.name || "ILYASS TV"}
                </h3>

                {/* Version */}
                {app.version && (
                  <p className="text-sm mb-1" style={{ color: "var(--accent)" }}>
                    v{app.version}
                  </p>
                )}

                {/* Description */}
                {app.description && (
                  <p className="text-sm mt-4 mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {app.description}
                  </p>
                )}

                {/* Single Download Button */}
                <a
                  href={app.apkUrl || "#"}
                  target={app.apkUrl ? "_blank" : undefined}
                  rel={app.apkUrl ? "noopener noreferrer" : undefined}
                  className="group/btn inline-flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-base transition-all duration-300 gradient-btn hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download APK
                </a>

                {/* Changelog */}
                {app.changelog && (
                  <div className="mt-6 pt-6 border-t text-left" style={{ borderColor: "var(--border)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                      What&apos;s New in v{app.version}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {app.changelog}
                    </p>
                  </div>
                )}
              </div>
            </MotionDiv>

            {/* Other platforms */}
            {platforms.length > 0 && (
              <MotionDiv
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <p className="text-xs text-center mb-4 font-medium" style={{ color: "var(--text-muted)" }}>
                  Also available on
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {platforms.map((p) => (
                    <a
                      key={p.id}
                      href={p.apkUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {p.name} {p.version ? `v${p.version}` : ""}
                    </a>
                  ))}
                </div>
              </MotionDiv>
            )}
          </div>
        ) : (
          /* Fallback if no app configured */
          <div className="max-w-lg mx-auto text-center">
            <MotionDiv
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl p-8"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--accent-subtle)" }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                ILYASS TV
              </h3>
              <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
                Premium IPTV Streaming
              </p>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm gradient-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download APK
              </a>
            </MotionDiv>
          </div>
        )}

        {/* Version Info */}
        <MotionDiv
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Latest version: <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
              {app?.version ? `v${app.version}` : "v2.1.0"}
            </span>
            {" \u2022 "}Requires Android 8.0+
            {" \u2022 "}Free &amp; Unlimited
          </p>
        </MotionDiv>
      </div>
    </section>
  )
}
