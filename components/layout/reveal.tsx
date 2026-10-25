"use client"

import * as m from "motion/react-m"

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Seconds to wait before animating; use small steps to stagger lists. */
  delay?: number
}

// Fades content up into place the first time it scrolls into view.
// Only use below the fold: the hero must render visible for fast first paint.
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -64px 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  )
}
