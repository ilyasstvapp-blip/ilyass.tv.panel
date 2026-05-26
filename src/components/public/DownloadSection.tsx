"use client"

import { useTranslations } from "@/i18n/useTranslations"

export default function DownloadSection() {
  const { t } = useTranslations()

  return (
    <section id="download" className="relative py-24">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)",
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            {t("download.title")}
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            {t("download.subtitle")}
          </p>
        </div>

        <div className="text-center py-12">
          <p style={{ color: "var(--text-muted)" }}>No downloads available yet</p>
        </div>
      </div>
    </section>
  )
}
