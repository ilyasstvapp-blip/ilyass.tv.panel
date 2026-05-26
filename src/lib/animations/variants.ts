import type { Variants } from "framer-motion"

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
}

export const float: Variants = {
  hidden: { y: 0 },
  visible: { y: [0, -10, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
}

export const cardHover = {
  rest: { scale: 1, boxShadow: "var(--card-shadow)" },
  hover: {
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export const sidebarVariants: Variants = {
  open: { width: 240, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  closed: { width: 64, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
}

export const mobileMenu: Variants = {
  closed: { x: "-100%", transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  open: { x: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
}

export const dropdown: Variants = {
  closed: { opacity: 0, y: -8, scale: 0.96, pointerEvents: "none" as const },
  open: { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" as const, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
}

export const shimmer: Variants = {
  hidden: { backgroundPosition: "-200% 0" },
  visible: { backgroundPosition: "200% 0", transition: { duration: 2, repeat: Infinity, ease: "linear" } },
}
