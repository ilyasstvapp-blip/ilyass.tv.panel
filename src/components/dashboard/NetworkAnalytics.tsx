"use client"

import { motion } from "framer-motion"

export default function NetworkAnalytics({ isps, loading, onClick }: {
  isps: Array<{ isp: string; count: number; online: number; offline: number }> | null
  loading: boolean
  onClick?: () => void
}) {
  if (loading) {
    return (
      <div className="p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>ISP Analytics</h3>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-32 rounded mb-2" style={{ background: "var(--bg-tertiary)" }} />
              <div className="h-2 w-full rounded" style={{ background: "var(--bg-tertiary)" }} />
              <div className="flex gap-4 mt-1">
                <div className="h-2 w-12 rounded" style={{ background: "var(--bg-tertiary)" }} />
                <div className="h-2 w-12 rounded" style={{ background: "var(--bg-tertiary)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const sorted = isps ? [...isps].sort((a, b) => b.count - a.count) : []
  const maxCount = sorted.length > 0 ? sorted[0].count : 1

  return (
    <div onClick={onClick}
      className="p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", cursor: onClick ? "pointer" : "default" }}>
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
        <span className="w-1 h-4 rounded-full" style={{ background: "var(--gradient-green)" }} />
        Top ISPs
      </h3>
      {sorted.length === 0 ? (
        <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>No ISP data</p>
      ) : (
        <div className="space-y-3">
          {sorted.slice(0, 4).map((isp, i) => {
            const onlinePct = isp.count > 0 ? (isp.online / isp.count) * 100 : 0
            const barPct = (isp.count / maxCount) * 100
            return (
              <motion.div key={isp.isp} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{isp.isp}</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{isp.count}</span>
                </div>
                <div className="h-2 rounded-full mb-1" style={{ background: "var(--bg-tertiary)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${barPct}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                    className="h-full rounded-full" style={{ background: "var(--accent-cyan)" }} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--accent-green)" }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--accent-green)" }} />
                    {isp.online} online
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--text-muted)" }} />
                    {isp.offline} offline
                  </span>
                </div>
              </motion.div>
            )
          })}
          {sorted.length > 4 && (
            <p className="text-[10px] pt-1 text-center" style={{ color: "var(--text-muted)" }}>
              +{sorted.length - 4} more ISPs &mdash; click to view all
            </p>
          )}
        </div>
      )}
    </div>
  )
}
