"use client"

import { motion } from "framer-motion"

function getVersionColor(version: string, versions: string[]): string {
  const idx = versions.indexOf(version); const total = versions.length
  if (total <= 1) return "var(--accent-cyan)"
  const ratio = total > 1 ? idx / (total - 1) : 0
  if (ratio < 0.33) return "var(--accent-green)"
  if (ratio < 0.66) return "var(--accent-cyan)"
  return "var(--accent-purple)"
}

export default function ApplicationAnalytics({ versions, loading, onClick }: {
  versions: Array<{ version: string; count: number }> | null
  loading: boolean
  onClick?: () => void
}) {
  if (loading) {
    return (
      <div className="p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Application Analytics</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-16 rounded-xl mb-4" style={{ background: "var(--bg-tertiary)" }} />
          {Array.from({ length: 4 }).map((_, i) => (<div key={i}><div className="h-3 w-24 rounded mb-1" style={{ background: "var(--bg-tertiary)" }} /><div className="h-2 w-full rounded" style={{ background: "var(--bg-tertiary)" }} /></div>))}
        </div>
      </div>
    )
  }

  const sorted = versions && versions.length > 0 ? [...versions].sort((a, b) => b.count - a.count) : []
  const totalInstalls = sorted.reduce((s, v) => s + v.count, 0)
  const maxCount = sorted.length > 0 ? sorted[0].count : 1
  const topVersion = sorted.length > 0 ? sorted[0] : null
  const versionLabels = sorted.map(v => v.version)

  return (
    <div onClick={onClick}
      className="p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", cursor: onClick ? "pointer" : "default" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="w-1 h-4 rounded-full" style={{ background: "var(--gradient-pink)" }} />
          Most Used Versions
        </h3>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--accent)12", color: "var(--accent)" }}>
          {totalInstalls.toLocaleString()} installs
        </span>
      </div>
      {sorted.length === 0 ? (
        <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>No version data</p>
      ) : (
        <>
          {topVersion && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-4 mb-4" style={{ background: "var(--accent-cyan)10", border: "1px solid var(--accent-cyan)20" }}>
              <p className="text-[10px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Most Used Version</p>
              <p className="text-lg font-bold" style={{ color: "var(--accent-cyan)" }}>v{topVersion.version}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                  <div className="h-full rounded-full" style={{ background: "var(--accent-cyan)", width: `${(topVersion.count / maxCount) * 100}%` }} />
                </div>
                <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{((topVersion.count / totalInstalls) * 100).toFixed(0)}%</span>
              </div>
            </motion.div>
          )}
          <div className="space-y-2">
            {sorted.slice(0, 4).map((v, i) => {
              const pct = (v.count / maxCount) * 100
              const color = getVersionColor(v.version, versionLabels)
              return (
                <motion.div key={v.version} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>v{v.version}</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{((v.count / totalInstalls) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                      className="h-full rounded-full" style={{ background: color }} />
                  </div>
                </motion.div>
              )
            })}
            {sorted.length > 4 && (
              <p className="text-[10px] pt-1 text-center" style={{ color: "var(--text-muted)" }}>
                +{sorted.length - 4} more versions &mdash; click to view all
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
