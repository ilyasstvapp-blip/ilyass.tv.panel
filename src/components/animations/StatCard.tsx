"use client"

import { motion } from "framer-motion"

interface StatCardProps {
  label: string
  value: string | number
  gradient?: string
  icon?: string
  onClick?: () => void
}

export function StatCard({ label, value, gradient, icon, onClick }: StatCardProps) {
  const GradientMotion = motion.div

  return (
    <GradientMotion
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-5 cursor-pointer"
      style={{ background: "var(--surface)" }}
    >
      {/* Top gradient bar */}
      {gradient && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: gradient }}
        />
      )}
      {icon && (
        <div className="mb-3 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `${gradient || "var(--accent)"}15` }}>
          <span style={{ color: gradient ? undefined : "var(--accent)" }}>{icon}</span>
        </div>
      )}
      <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-3xl font-bold"
      >
        {value}
      </motion.p>
    </GradientMotion>
  )
}
