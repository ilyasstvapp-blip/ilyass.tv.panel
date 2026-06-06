"use client"

import { useTranslations } from "@/i18n/useTranslations"
import { MotionDiv } from "prism-kit"
import { fadeInUp, scaleIn } from "prism-kit"
import { usePublicSettings } from "@/hooks/usePublicSettings"

export default function HeroSection() {
  const { t } = useTranslations()
  const { homePage, primaryApp } = usePublicSettings()

  const downloadUrl = primaryApp?.apkUrl || "#download"
  const heroTitle = homePage?.title || t("hero.title")
  const heroSubtitle = homePage?.subtitle || t("hero.subtitle")
  const heroDescription = homePage?.banner || t("hero.description")

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.05] pointer-events-none animate-spin-slow"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none animate-spin-slow"
        style={{ background: "radial-gradient(circle, var(--accent-light) 0%, transparent 70%)", animationDirection: "reverse" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.02] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent-purple) 0%, transparent 70%)" }} />

      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <MotionDiv
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-8"
          style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)" }}
        >
          <span className="relative flex w-2.5 h-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--success)" }} />
            <span className="relative inline-flex rounded-full w-2.5 h-2.5" style={{ background: "var(--success)" }} />
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            {t("hero.badge")}
          </span>
        </MotionDiv>

        <MotionDiv
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight tracking-tight">
            <span className="gradient-text">{heroTitle}</span>
            <br />
            <span style={{ color: "var(--text-primary)" }}>
              {heroSubtitle}
            </span>
          </h1>
        </MotionDiv>

        <MotionDiv
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <p className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}>
            {heroDescription}
          </p>
        </MotionDiv>

        {/* Single CTA — Download */}
        <MotionDiv
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <a
            href={downloadUrl}
            target={primaryApp?.apkUrl ? "_blank" : undefined}
            rel={primaryApp?.apkUrl ? "noopener noreferrer" : undefined}
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 gradient-btn hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t("hero.cta_download")}
          </a>
        </MotionDiv>

        <MotionDiv
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="mt-14 flex items-center justify-center gap-6 text-sm flex-wrap"
          style={{ color: "var(--text-muted)" }}
        >
          {[
            { key: "hero.feature_no_buffer", icon: "check" },
            { key: "hero.feature_4k", icon: "check" },
            { key: "hero.feature_support", icon: "check" },
          ].map((f) => (
            <span key={f.key} className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)" }}>
              <svg className="w-4 h-4" style={{ color: "var(--success)" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t(f.key as any)}
            </span>
          ))}
        </MotionDiv>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40"
        style={{ background: "linear-gradient(to top, var(--bg-primary), transparent)" }} />
    </section>
  )
}
