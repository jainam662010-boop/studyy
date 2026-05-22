'use client'

export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
}
