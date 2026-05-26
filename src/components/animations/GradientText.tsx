"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface GradientTextProps {
  children: ReactNode
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
  animate?: boolean
}

export function GradientText({ children, className, as: Tag = "span", animate = true }: GradientTextProps) {
  if (animate) {
    const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div
    return (
      <MotionTag
        className={className}
        style={{
          background: "var(--accent-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      >
        {children}
      </MotionTag>
    )
  }

  const Comp = Tag
  return (
    <Comp
      className={className}
      style={{
        background: "var(--accent-gradient)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </Comp>
  )
}
