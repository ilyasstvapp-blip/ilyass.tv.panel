"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations/variants"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  id?: string
}

export function AnimatedSection({ children, className, delay = 0, id }: AnimatedSectionProps) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      className={className}
    >
      <motion.div variants={fadeInUp} custom={delay}>
        {children}
      </motion.div>
    </motion.section>
  )
}
