import { describe, expect, it } from "vitest"

import { BADGES, STREAK_BADGE_DAYS } from "@/config/gamification"
import { ROADMAP_TOPICS } from "@/content/topics"
import { findNewlyEarnedBadges } from "@/lib/gamification/badges"
import { applyProgress, INITIAL_PROGRESS } from "@/lib/gamification/engine"
import type { ProgressData } from "@/lib/gamification/schema"

const now = new Date(2026, 9, 24, 12)
let counter = 0
const options = { now, createId: () => `id-${++counter}` }

describe("applyProgress", () => {
  it("adds XP, starts the streak and emits an XP event", () => {
    const { data, events } = applyProgress(INITIAL_PROGRESS, { xp: 40, reason: "Test" }, options)
    expect(data.xp).toBe(40)
    expect(data.streak).toEqual({ current: 1, longest: 1, lastActiveDate: "2026-10-24" })
    expect(events).toEqual([expect.objectContaining({ type: "xp", amount: 40, reason: "Test" })])
  })

  it("emits a single level-up for the level finally reached", () => {
    const { events } = applyProgress(INITIAL_PROGRESS, { xp: 650, reason: "Big win" }, options)
    const levelUps = events.filter((event) => event.type === "level-up")
    expect(levelUps).toEqual([expect.objectContaining({ level: 4 })])
  })

  it("unlocks badges once and records when", () => {
    const update = (data: ProgressData) => ({
      ...data,
      completedTopicIds: ["metrics"],
    })
    const first = applyProgress(INITIAL_PROGRESS, { xp: 50, reason: "Done", update }, options)
    const badgeIds = first.events.flatMap((event) =>
      event.type === "badge" ? [event.badgeId] : []
    )
    expect(badgeIds).toEqual(["first-steps", "metrics-master"])
    expect(first.data.unlockedBadges["metrics-master"]).toBe(now.toISOString())

    const second = applyProgress(first.data, { xp: 10, reason: "More" }, options)
    expect(second.events.some((event) => event.type === "badge")).toBe(false)
  })

  it("never subtracts XP", () => {
    const { data, events } = applyProgress(INITIAL_PROGRESS, { xp: -50, reason: "Oops" }, options)
    expect(data.xp).toBe(0)
    expect(events).toEqual([])
  })
})

describe("badge conditions", () => {
  const earned = (data: Partial<ProgressData>) =>
    findNewlyEarnedBadges({ ...INITIAL_PROGRESS, ...data })

  it("has unique ids", () => {
    expect(new Set(BADGES.map((badge) => badge.id)).size).toBe(BADGES.length)
  })

  it("awards the streak badge at the configured length", () => {
    expect(
      earned({ streak: { current: 1, longest: STREAK_BADGE_DAYS - 1, lastActiveDate: null } })
    ).not.toContain("streak-7")
    expect(
      earned({ streak: { current: 1, longest: STREAK_BADGE_DAYS, lastActiveDate: null } })
    ).toContain("streak-7")
  })

  it("awards Roadmap Champion only when every level is done", () => {
    const all = ROADMAP_TOPICS.map((topic) => topic.id)
    expect(earned({ completedTopicIds: all.slice(1) })).not.toContain("roadmap-champion")
    expect(earned({ completedTopicIds: all })).toContain("roadmap-champion")
  })
})
