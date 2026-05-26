"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { staggerContainer, scaleIn } from "@/lib/animations/variants"

interface StaggerGridProps {
  children: ReactNode
  className?: string
}

export function StaggerGrid({ children, className }: StaggerGridProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={scaleIn} className={className}>
      {children}
    </motion.div>
  )
}
