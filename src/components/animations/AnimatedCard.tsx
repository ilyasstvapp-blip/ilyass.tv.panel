"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { cardHover } from "@/lib/animations/variants"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function AnimatedCard({ children, className, onClick }: AnimatedCardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={cardHover}
      onClick={onClick}
      className={className}
      style={{ borderRadius: "1rem", cursor: onClick ? "pointer" : undefined }}
    >
      {children}
    </motion.div>
  )
}
