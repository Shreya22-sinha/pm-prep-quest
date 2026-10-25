import { describe, expect, it } from "vitest"

import {
  daysBetween,
  EMPTY_STREAK,
  getActiveStreak,
  registerActivity,
  toLocalDateKey,
} from "@/lib/gamification/streak"

describe("date keys", () => {
  it("formats the local calendar day", () => {
    expect(toLocalDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05")
  })

  it("counts days across month and year boundaries", () => {
    expect(daysBetween("2026-01-31", "2026-02-01")).toBe(1)
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1)
    expect(daysBetween("2026-03-01", "2026-03-08")).toBe(7)
  })
})

describe("registerActivity", () => {
  it("starts a streak on first activity", () => {
    expect(registerActivity(EMPTY_STREAK, "2026-10-24")).toEqual({
      current: 1,
      longest: 1,
      lastActiveDate: "2026-10-24",
    })
  })

  it("does not double count the same day", () => {
    const streak = registerActivity(EMPTY_STREAK, "2026-10-24")
    expect(registerActivity(streak, "2026-10-24")).toBe(streak)
  })

  it("extends on consecutive days and resets after a gap, keeping the best", () => {
    let streak = EMPTY_STREAK
    for (const day of ["2026-10-20", "2026-10-21", "2026-10-22"]) {
      streak = registerActivity(streak, day)
    }
    expect(streak.current).toBe(3)

    streak = registerActivity(streak, "2026-10-25")
    expect(streak).toEqual({ current: 1, longest: 3, lastActiveDate: "2026-10-25" })
  })
})

describe("getActiveStreak", () => {
  const streak = { current: 4, longest: 4, lastActiveDate: "2026-10-24" }

  it("stays alive today and tomorrow", () => {
    expect(getActiveStreak(streak, "2026-10-24")).toBe(4)
    expect(getActiveStreak(streak, "2026-10-25")).toBe(4)
  })

  it("shows zero once a day is missed", () => {
    expect(getActiveStreak(streak, "2026-10-26")).toBe(0)
    expect(getActiveStreak(EMPTY_STREAK, "2026-10-26")).toBe(0)
  })
})
