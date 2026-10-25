import { describe, expect, it } from "vitest"

import { LEVELS } from "@/config/gamification"
import { getLevelForXp, getLevelProgress } from "@/lib/gamification/levels"

describe("level config", () => {
  it("starts at 0 XP and is sorted with increasing thresholds", () => {
    expect(LEVELS[0]?.minXp).toBe(0)
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i]!.minXp).toBeGreaterThan(LEVELS[i - 1]!.minXp)
      expect(LEVELS[i]!.level).toBe(i + 1)
    }
  })

  it("uses the spec's level names in order", () => {
    expect(LEVELS.map((level) => level.name)).toEqual([
      "Curious Explorer",
      "Aspiring PM",
      "Product Thinker",
      "Strategy Builder",
      "Interview Ready",
      "Offer Hunter",
    ])
  })
})

describe("getLevelForXp", () => {
  it("returns the highest level whose threshold is met", () => {
    expect(getLevelForXp(0).level).toBe(1)
    expect(getLevelForXp(99).level).toBe(1)
    expect(getLevelForXp(100).level).toBe(2)
    expect(getLevelForXp(1_000_000).level).toBe(LEVELS.length)
  })
})

describe("getLevelProgress", () => {
  it("measures progress within the current level", () => {
    const progress = getLevelProgress(150)
    expect(progress.current.name).toBe("Aspiring PM")
    expect(progress.next?.name).toBe("Product Thinker")
    expect(progress.xpToNext).toBe(150)
    expect(progress.percent).toBe(25)
  })

  it("is full at the top level", () => {
    const top = LEVELS[LEVELS.length - 1]!
    const progress = getLevelProgress(top.minXp + 500)
    expect(progress.next).toBeNull()
    expect(progress.percent).toBe(100)
    expect(progress.xpToNext).toBe(0)
  })
})
