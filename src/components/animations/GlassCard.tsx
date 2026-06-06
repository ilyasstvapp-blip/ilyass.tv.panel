"use client"

import type { ReactNode } from "react"
import { cn } from "prism-kit"

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: "cyan" | "green" | "orange" | "pink" | "purple"
  onClick?: () => void
}

const glowColors: Record<string, string> = {
  cyan: "0 0 30px rgba(34,211,238,0.12)",
  green: "0 0 30px rgba(52,211,153,0.12)",
  orange: "0 0 30px rgba(251,191,36,0.12)",
  pink: "0 0 30px rgba(244,114,182,0.12)",
  purple: "0 0 30px rgba(167,139,250,0.12)",
}

export function GlassCard({ children, className, glow, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300",
        "bg-white/70 dark:bg-[#101028]/70",
        "border-white/30 dark:border-white/5",
        onClick && "cursor-pointer",
        className
      )}
      style={glow ? { boxShadow: glowColors[glow] } : undefined}
    >
      {children}
    </div>
  )
}

export function GlowCard({ children, className, glow = "cyan", onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5",
        "bg-surface",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        borderColor: `var(--border)`,
        boxShadow: `0 0 24px var(--accent-${glow === "cyan" ? "cyan" : glow === "green" ? "green" : glow === "orange" ? "orange" : glow === "pink" ? "pink" : "purple"})08`,
      }}
    >
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: glowColors[glow] }} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
