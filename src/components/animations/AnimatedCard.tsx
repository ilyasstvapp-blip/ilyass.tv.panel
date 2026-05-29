"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function AnimatedCard({ children, className, onClick }: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      onClick={onClick}
      className={className}
      style={{ borderRadius: "1rem", cursor: onClick ? "pointer" : undefined }}
    >
      {children}
    </motion.div>
  )
}
