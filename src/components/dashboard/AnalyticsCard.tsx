"use client"

import { motion } from "framer-motion"

interface AnalyticsCardProps {
  label: string
  value: number
  color: string
  icon?: string
  gradient?: string
  loading?: boolean
}

export default function AnalyticsCard({ label, value, color, icon, gradient, loading }: AnalyticsCardProps) {
  if (loading) {
    return (
      <div className="stat-card animate-pulse" style={{ background: "var(--surface)", height: 140 }}>
        <div className="h-4 w-20 rounded mb-3" style={{ background: "var(--bg-tertiary)" }} />
        <div className="h-8 w-16 rounded" style={{ background: "var(--bg-tertiary)" }} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="stat-card relative overflow-hidden group"
      style={{ background: "var(--surface)" }}
    >
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}15` }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
            </svg>
          </div>
        )}
      </div>
      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-3xl font-bold tracking-tight" style={{ color }}>{value.toLocaleString()}</p>
    </motion.div>
  )
}
