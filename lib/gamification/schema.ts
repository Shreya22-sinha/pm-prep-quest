import { z } from "zod"

import { INTERVIEW_LEVELS, INTERVIEW_MODES, INTERVIEW_PATHS } from "@/config/interview"

// Saved progress is validated on load, so a corrupted or outdated save falls
// back to a fresh start instead of crashing the app.

const localDateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const interviewRecordSchema = z.object({
  id: z.string().min(1),
  completedAt: z.iso.datetime(),
  targetLabel: z.string(),
  path: z.enum(INTERVIEW_PATHS),
  level: z.enum(INTERVIEW_LEVELS),
  mode: z.enum(INTERVIEW_MODES),
  questionCount: z.number().int().nonnegative(),
  overallScore: z.number().min(0).max(100),
  xpEarned: z.number().int().nonnegative(),
})

export const streakSchema = z.object({
  current: z.number().int().nonnegative(),
  longest: z.number().int().nonnegative(),
  lastActiveDate: localDateKey.nullable(),
})

export const programTrackProgressSchema = z.object({
  name: z.string(),
  completedMockIds: z.array(z.string()),
  /** The most recent results page for this program, where the track continues. */
  lastSessionId: z.string().nullable(),
})

export const progressDataSchema = z.object({
  xp: z.number().int().nonnegative(),
  // Plain strings (not enums) so renaming a topic or badge later never wipes a save.
  completedTopicIds: z.array(z.string()),
  unlockedBadges: z.record(z.string(), z.iso.datetime()),
  streak: streakSchema,
  interviews: z.array(interviewRecordSchema),
  /** Program tracks keyed by track key (Phase 7). Defaults keep older saves loading. */
  programTracks: z.record(z.string(), programTrackProgressSchema).default({}),
})

export type InterviewRecord = z.infer<typeof interviewRecordSchema>
export type StreakState = z.infer<typeof streakSchema>
export type ProgramTrackProgress = z.infer<typeof programTrackProgressSchema>
export type ProgressData = z.infer<typeof progressDataSchema>
