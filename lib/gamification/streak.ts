import type { StreakState } from "@/lib/gamification/schema"

/** The user's local calendar day as YYYY-MM-DD (streaks follow local days). */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function keyToUtcMs(key: string): number {
  const [year = 0, month = 1, day = 1] = key.split("-").map(Number)
  return Date.UTC(year, month - 1, day)
}

/** Whole calendar days from one date key to another (DST-safe). */
export function daysBetween(fromKey: string, toKey: string): number {
  return Math.round((keyToUtcMs(toKey) - keyToUtcMs(fromKey)) / 86_400_000)
}

export const EMPTY_STREAK: StreakState = { current: 0, longest: 0, lastActiveDate: null }

/** Updates the streak for activity on `todayKey`. Same-day activity changes nothing. */
export function registerActivity(streak: StreakState, todayKey: string): StreakState {
  if (streak.lastActiveDate === todayKey) return streak

  const continues =
    streak.lastActiveDate !== null && daysBetween(streak.lastActiveDate, todayKey) === 1
  const current = continues ? streak.current + 1 : 1

  return { current, longest: Math.max(streak.longest, current), lastActiveDate: todayKey }
}

/** The streak to show today: still alive if the last activity was today or yesterday. */
export function getActiveStreak(streak: StreakState, todayKey: string): number {
  if (streak.lastActiveDate === null) return 0
  return daysBetween(streak.lastActiveDate, todayKey) <= 1 ? streak.current : 0
}
