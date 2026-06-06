"use client"

import { motion } from "framer-motion"

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  wifi: { label: "WiFi", color: "var(--accent-cyan)", icon: "M5 12a10 10 0 0114 0M8 9a6 6 0 018 0M11 6a2 2 0 012 0" },
  mobile_data: { label: "Mobile Data", color: "var(--accent-purple)", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zM8 9h8M8 13h6M8 17h4" },
  ethernet: { label: "Ethernet", color: "var(--accent-orange)", icon: "M8 9l3 3-3 3m5 0h3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" },
}

function ConnectionTypeCard({ type, count, total }: { type: string; count: number; total: number }) {
  const cfg = TYPE_CONFIG[type] || { label: type || "Unknown", color: "var(--text-muted)", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cfg.color}15` }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: cfg.color }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cfg.icon} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{cfg.label}</span>
          <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{count}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full" style={{ background: cfg.color }} />
          </div>
          <span className="text-[10px] w-10 text-right" style={{ color: "var(--text-muted)" }}>{pct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

export default function ConnectionAnalytics({ types, loading, onClick }: {
  types: Array<{ type: string; count: number }> | null
  loading: boolean
  onClick?: () => void
}) {
  const total = types ? types.reduce((s, t) => s + t.count, 0) : 0

  if (loading) {
    return (
      <div className="p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Connection Types</h3>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg" style={{ background: "var(--bg-tertiary)" }} />
              <div className="flex-1"><div className="h-3 w-24 rounded mb-2" style={{ background: "var(--bg-tertiary)" }} /><div className="h-2 w-full rounded" style={{ background: "var(--bg-tertiary)" }} /></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const sorted = types && types.length > 0 ? [...types].sort((a, b) => b.count - a.count) : []

  return (
    <div onClick={onClick}
      className="p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", cursor: onClick ? "pointer" : "default" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="w-1 h-4 rounded-full" style={{ background: "var(--gradient-blue)" }} />
          Connection Types
        </h3>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--accent)12", color: "var(--accent)" }}>
          {total} total
        </span>
      </div>
      {sorted.length === 0 ? (
        <p className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>No connection data</p>
      ) : (
        <div className="space-y-1">
          {sorted.map((t) => (<ConnectionTypeCard key={t.type} type={t.type} count={t.count} total={total} />))}
          <div className="flex items-center justify-center gap-3 pt-3 mt-3" style={{ borderTop: "1px solid var(--border)" }}>
            {sorted.map((t) => {
              const cfg = TYPE_CONFIG[t.type] || { color: "var(--text-muted)", label: t.type || "Unknown" }
              const pct = total > 0 ? (t.count / total) * 100 : 0
              return (
                <div key={t.type} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{cfg.label} {pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
