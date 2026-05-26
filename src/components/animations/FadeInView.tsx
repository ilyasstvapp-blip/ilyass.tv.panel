"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { fadeInUp } from "@/lib/animations/variants"

interface FadeInViewProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeInView({ children, className, delay = 0, duration = 0.6 }: FadeInViewProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
