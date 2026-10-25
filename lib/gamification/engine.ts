import { findNewlyEarnedBadges } from "@/lib/gamification/badges"
import { getLevelForXp } from "@/lib/gamification/levels"
import type { ProgressData } from "@/lib/gamification/schema"
import { EMPTY_STREAK, registerActivity, toLocalDateKey } from "@/lib/gamification/streak"

export type GamificationEvent =
  | { id: string; type: "xp"; amount: number; reason: string }
  | { id: string; type: "level-up"; level: number }
  | { id: string; type: "badge"; badgeId: string }

export const INITIAL_PROGRESS: ProgressData = {
  xp: 0,
  completedTopicIds: [],
  unlockedBadges: {},
  streak: EMPTY_STREAK,
  interviews: [],
  programTracks: {},
}

export type ProgressChange = {
  xp: number
  reason: string
  /** Any other data change that happens alongside the XP (e.g. marking a topic done). */
  update?: (data: ProgressData) => ProgressData
}

type ApplyOptions = {
  now?: Date
  createId?: () => string
}

/**
 * The single place progress changes: applies the update and XP, extends the
 * streak, then works out level-ups and newly unlocked badges as events for the UI.
 */
export function applyProgress(
  data: ProgressData,
  change: ProgressChange,
  { now = new Date(), createId = () => crypto.randomUUID() }: ApplyOptions = {}
): { data: ProgressData; events: GamificationEvent[] } {
  const events: GamificationEvent[] = []
  const updated = change.update ? change.update(data) : data
  const amount = Math.max(0, Math.round(change.xp))

  let next: ProgressData = {
    ...updated,
    xp: updated.xp + amount,
    streak: registerActivity(updated.streak, toLocalDateKey(now)),
  }

  if (amount > 0) {
    events.push({ id: createId(), type: "xp", amount, reason: change.reason })
  }

  const levelBefore = getLevelForXp(data.xp).level
  const levelAfter = getLevelForXp(next.xp).level
  if (levelAfter > levelBefore) {
    events.push({ id: createId(), type: "level-up", level: levelAfter })
  }

  const newBadges = findNewlyEarnedBadges(next)
  if (newBadges.length > 0) {
    const unlockedAt = now.toISOString()
    next = {
      ...next,
      unlockedBadges: {
        ...next.unlockedBadges,
        ...Object.fromEntries(newBadges.map((id) => [id, unlockedAt])),
      },
    }
    for (const badgeId of newBadges) {
      events.push({ id: createId(), type: "badge", badgeId })
    }
  }

  return { data: next, events }
}
