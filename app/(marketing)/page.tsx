import type { Metadata } from "next"

import { Benefits } from "@/components/home/benefits"
import { FinalCta } from "@/components/home/final-cta"
import { Hero } from "@/components/home/hero"
import { MythBusters } from "@/components/home/myth-busters"
import { WhatPmsDo } from "@/components/home/what-pms-do"
import { WhyItMatters } from "@/components/home/why-it-matters"
import { YouCanDoThis } from "@/components/home/you-can-do-this"

// Only the description is overridden: an `openGraph` object here would replace
// the inherited one, including the share image.
export const metadata: Metadata = {
  description:
    "Discover what product managers do, why the role matters, and how people from any background break into PM. Then start your learning roadmap.",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatPmsDo />
      <WhyItMatters />
      <Benefits />
      <YouCanDoThis />
      <MythBusters />
      <FinalCta />
    </>
  )
}
