"use client"

import { LazyMotion, MotionConfig } from "motion/react"

const loadFeatures = () => import("@/lib/motion-features").then((module) => module.default)

// LazyMotion keeps the animation engine out of the initial bundle; `strict`
// makes any full `motion.*` component (which would pull it back in) an error.
// reducedMotion="user" turns off transform/layout animations for people who
// set "reduce motion" in their operating system.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
