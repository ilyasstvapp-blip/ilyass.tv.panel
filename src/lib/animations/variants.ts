import type { Variants } from "framer-motion"

const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
}

export const float: Variants = {
  hidden: { y: 0 },
  visible: { y: [0, -10, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
}

export const cardHover: Record<string, object> = {
  rest: { scale: 1, boxShadow: "var(--shadow-card)" },
  hover: {
    scale: 1.02,
    boxShadow: "var(--shadow-card-hover)",
    transition: { duration: 0.3, ease: easeOut },
  },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

export const sidebarVariants: Variants = {
  open: { width: 260, transition: { duration: 0.3, ease: easeOut } },
  closed: { width: 72, transition: { duration: 0.3, ease: easeOut } },
}

export const mobileMenu: Variants = {
  closed: { x: "-100%", transition: { duration: 0.3, ease: easeOut } },
  open: { x: 0, transition: { duration: 0.3, ease: easeOut } },
}

export const dropdown: Variants = {
  closed: { opacity: 0, y: -8, scale: 0.96, pointerEvents: "none" as const },
  open: {
    opacity: 1, y: 0, scale: 1, pointerEvents: "auto" as const,
    transition: { duration: 0.2, ease: easeOut },
  },
}

export const shimmer: Variants = {
  hidden: { backgroundPosition: "-200% 0" },
  visible: { backgroundPosition: "200% 0", transition: { duration: 2, repeat: Infinity, ease: "linear" } },
}

export const buttonTap = { scale: 0.97 }

export const listStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}

export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } },
}
