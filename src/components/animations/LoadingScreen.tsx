"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
  isLoading?: boolean
  minimumDuration?: number
}

export function LoadingScreen({ isLoading, minimumDuration = 800 }: LoadingScreenProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (isLoading === false) {
      const timer = setTimeout(() => setShow(false), minimumDuration)
      return () => clearTimeout(timer)
    }
  }, [isLoading, minimumDuration])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "var(--bg-primary)" }}
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-2xl"
              style={{ background: "var(--accent-gradient)" }}
            />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm font-medium tracking-wider uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Loading
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
