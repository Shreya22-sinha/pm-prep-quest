import { describe, expect, it } from "vitest"

import { homeContent } from "@/content/home"

const sectionIds = [
  homeContent.whatPmsDo.id,
  homeContent.whyItMatters.id,
  homeContent.benefits.id,
  homeContent.youCanDoThis.id,
  homeContent.mythBusters.id,
]

describe("home content", () => {
  it("sends the main calls to action to the roadmap", () => {
    expect(homeContent.hero.primaryCta.href).toBe("/roadmap")
    expect(homeContent.finalCta.cta.href).toBe("/roadmap")
  })

  it("points the secondary hero link at a real section", () => {
    const target = homeContent.hero.secondaryCta.href
    expect(target.startsWith("#")).toBe(true)
    expect(sectionIds).toContain(target.slice(1))
  })

  it("uses unique section ids", () => {
    expect(new Set(sectionIds).size).toBe(sectionIds.length)
  })

  it("explains the role with three or four cards", () => {
    expect(homeContent.whatPmsDo.items.length).toBeGreaterThanOrEqual(3)
    expect(homeContent.whatPmsDo.items.length).toBeLessThanOrEqual(4)
  })

  it("shows the four-step path in the spec's order", () => {
    expect(homeContent.youCanDoThis.steps.map((step) => step.title)).toEqual([
      "Learn",
      "Practice",
      "Mock interview",
      "Land the role",
    ])
  })

  it("debunks the MBA and coding myths", () => {
    const myths = homeContent.mythBusters.myths.map((item) => item.myth.toLowerCase())
    expect(myths.some((myth) => myth.includes("mba"))).toBe(true)
    expect(myths.some((myth) => myth.includes("code"))).toBe(true)
  })

  it("keeps the hero preview progress in range", () => {
    const { progressPercent } = homeContent.hero.preview
    expect(progressPercent).toBeGreaterThanOrEqual(0)
    expect(progressPercent).toBeLessThanOrEqual(100)
  })

  it("makes no specific statistical claims", () => {
    // The spec forbids invented statistics: no percentages or currency figures in the copy.
    const copy = JSON.stringify(homeContent, (key, value: unknown) =>
      key === "icon" || key === "preview" ? undefined : value
    )
    expect(copy).not.toMatch(/\d+\s?%|[$₹€£]\s?\d/)
  })
})
