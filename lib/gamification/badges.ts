import { BADGES, type BadgeDefinition, type BadgeId } from "@/config/gamification"
import type { ProgressData } from "@/lib/gamification/schema"

export function getBadge(id: string): BadgeDefinition | undefined {
  return BADGES.find((badge) => badge.id === id)
}

/** Badges whose condition is now met but which haven't been unlocked yet. */
export function findNewlyEarnedBadges(data: ProgressData): BadgeId[] {
  return BADGES.filter((badge) => !data.unlockedBadges[badge.id] && badge.isEarned(data)).map(
    (badge) => badge.id
  )
}
