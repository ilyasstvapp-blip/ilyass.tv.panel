"use client"

import { motion } from "framer-motion"

export default function SecurityCenter({ security, loading }: {
  security: { total_verified: number; total_unverified: number; flagged_devices: number } | null
  loading: boolean
}) {
  const total = security
    ? security.total_verified + security.total_unverified + security.flagged_devices
    : 0
  const verifiedPct = total > 0 ? (security!.total_verified / total) * 100 : 0

  if (loading) {
    return (
      <div className="p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Security Monitoring</h3>
        <div className="animate-pulse">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl" style={{ background: "var(--bg-tertiary)" }} />
            ))}
          </div>
          <div className="h-2 rounded-full" style={{ background: "var(--bg-tertiary)" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent-cyan)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Security Monitoring</h3>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 text-center"
          style={{ background: "var(--accent-green)10", border: "1px solid var(--accent-green)20" }}
        >
          <p className="text-xl font-bold" style={{ color: "var(--accent-green)" }}>{security?.total_verified.toLocaleString() ?? "—"}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Verified</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-3 text-center"
          style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}
        >
          <p className="text-xl font-bold" style={{ color: "var(--text-secondary)" }}>{security?.total_unverified.toLocaleString() ?? "—"}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Unverified</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-3 text-center"
          style={{ background: "var(--accent-orange)10", border: "1px solid var(--accent-orange)20" }}
        >
          <p className="text-xl font-bold" style={{ color: "var(--accent-orange)" }}>{security?.flagged_devices.toLocaleString() ?? "—"}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Flagged</p>
        </motion.div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Verified Rate</span>
          <span className="text-[10px] font-medium" style={{ color: "var(--accent-green)" }}>{verifiedPct.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${verifiedPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full"
            style={{ background: "var(--accent-green)" }}
          />
        </div>
      </div>
    </div>
  )
}
