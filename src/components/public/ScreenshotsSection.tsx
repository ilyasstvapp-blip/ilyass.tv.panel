"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "@/i18n/useTranslations"
import { MotionDiv, fadeInUp, float } from "prism-kit"
import { usePublicSettings } from "@/hooks/usePublicSettings"

export default function ScreenshotsSection() {
  const { t } = useTranslations()
  const { appCards, loading } = usePublicSettings()
  const [current, setCurrent] = useState(0)
  const [viewerIdx, setViewerIdx] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const allScreenshots = appCards.flatMap((c) => c.screenshots || [])
  const screenshots = allScreenshots.length > 0 ? allScreenshots : null
  const total = screenshots?.length ?? 0

  const goTo = useCallback((i: number) => setCurrent(((i % total) + total) % total), [total])
  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (total < 2) return
    intervalRef.current = setInterval(next, 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [next, total])

  const pause = () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  const resume = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (total >= 2) intervalRef.current = setInterval(next, 4000)
  }, [next, total])

  return (
    <section id="screenshots" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-page-bg)" }} />
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionDiv
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14 lg:mb-18"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t("screenshots.title")}
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            {t("screenshots.subtitle")}
          </p>
        </MotionDiv>

        {loading ? (
          <div className="max-w-sm mx-auto">
            <div className="rounded-2xl animate-pulse" style={{ aspectRatio: "9/16", background: "var(--surface)" }} />
          </div>
        ) : screenshots ? (
          <div className="max-w-sm mx-auto" onMouseEnter={pause} onMouseLeave={resume}>
            {/* Carousel */}
            <div className="relative overflow-hidden rounded-2xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {screenshots.map((url, i) => (
                  <div key={i} className="min-w-full aspect-[9/16] shrink-0 cursor-pointer"
                    onClick={() => setViewerIdx(i)}>
                    <img src={url} alt={`Screenshot ${i + 1}`}
                      className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>

              {/* Arrows */}
              {total > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prev() }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 z-10"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); next() }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 z-10"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Dots */}
            {total > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                {screenshots.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === current ? 24 : 8,
                      height: 8,
                      background: i === current ? "var(--accent)" : "var(--border)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Fallback */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Live TV", gradient: "from-blue-500 to-cyan-500", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              { label: "Live Events", gradient: "from-indigo-500 to-purple-500", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
              { label: "Channel List", gradient: "from-purple-500 to-pink-500", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
              { label: "Player", gradient: "from-rose-500 to-pink-500", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
            ].map((shot, i) => (
              <MotionDiv key={shot.label}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                }}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
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
              </MotionDiv>
            ))}
          </div>
        )}

        {/* Image Viewer */}
        {viewerIdx !== null && screenshots && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
            onClick={() => setViewerIdx(null)}>
            <button onClick={() => setViewerIdx(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <img src={screenshots[viewerIdx]} alt={`Screenshot ${viewerIdx + 1}`}
                className="w-full rounded-2xl shadow-2xl" />
              <div className="flex items-center justify-between mt-4">
                <button onClick={() => setViewerIdx(viewerIdx > 0 ? viewerIdx - 1 : screenshots.length - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  Previous
                </button>
                <span className="text-sm text-white/60">{viewerIdx + 1} / {screenshots.length}</span>
                <button onClick={() => setViewerIdx(viewerIdx < screenshots.length - 1 ? viewerIdx + 1 : 0)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
