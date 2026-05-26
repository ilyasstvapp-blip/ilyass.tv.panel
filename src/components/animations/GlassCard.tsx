"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/animations/cn"

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: "cyan" | "green" | "orange" | "pink" | "purple"
  onClick?: () => void
}

const glowMap = {
  cyan: "0 0 30px rgba(34, 211, 238, 0.1)",
  green: "0 0 30px rgba(52, 211, 153, 0.1)",
  orange: "0 0 30px rgba(251, 191, 36, 0.1)",
  pink: "0 0 30px rgba(244, 114, 182, 0.1)",
  purple: "0 0 30px rgba(167, 139, 250, 0.1)",
}

export function GlassCard({ children, className, glow, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, boxShadow: glow ? glowMap[glow] : undefined }}
      onClick={onClick}
      className={cn(
        "rounded-2xl border backdrop-blur-xl transition-colors",
        "bg-white/70 dark:bg-[#101028]/70",
        "border-white/30 dark:border-white/5",
        className
      )}
      style={glow ? { boxShadow: glowMap[glow] } : undefined}
    >
      {children}
    </motion.div>
  )
}
