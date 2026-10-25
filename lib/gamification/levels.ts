import { LEVELS, type LevelDefinition } from "@/config/gamification"

export function getLevelForXp(xp: number): LevelDefinition {
  let current = LEVELS[0]
  for (const level of LEVELS) {
    if (xp >= level.minXp) current = level
  }
  if (!current) throw new Error("LEVELS config is empty")
  return current
}

export function getLevelByNumber(level: number): LevelDefinition | undefined {
  return LEVELS.find((item) => item.level === level)
}

export type LevelProgress = {
  current: LevelDefinition
  next: LevelDefinition | null
  /** 0–100 progress towards the next level (100 at the top level). */
  percent: number
  xpIntoLevel: number
  xpToNext: number
}

export function getLevelProgress(xp: number): LevelProgress {
  const current = getLevelForXp(xp)
  const next = getLevelByNumber(current.level + 1) ?? null
  const xpIntoLevel = xp - current.minXp

  if (!next) return { current, next, percent: 100, xpIntoLevel, xpToNext: 0 }

  const span = next.minXp - current.minXp
  return {
    current,
    next,
    percent: Math.min(100, Math.round((xpIntoLevel / span) * 100)),
    xpIntoLevel,
    xpToNext: next.minXp - xp,
  }
}
