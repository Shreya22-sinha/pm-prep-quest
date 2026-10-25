import { z } from "zod"

import {
  interviewEvaluationSchema,
  practiceFeedbackSchema,
  resumeFeedbackSchema,
} from "@/lib/interview/feedback-schema"
import { interviewQuestionSchema, interviewSetupSchema } from "@/lib/interview/schema"

// A mock interview saved in the browser: the setup, the AI's question plan and
// everything the candidate did, so a reload never loses progress.

export const TURN_STATUSES = ["answering", "follow-up", "done"] as const
export type TurnStatus = (typeof TURN_STATUSES)[number]

export const interviewTurnSchema = z.object({
  question: interviewQuestionSchema,
  status: z.enum(TURN_STATUSES),
  hintUsed: z.boolean(),
  answer: z.string().nullable(),
  skipped: z.boolean(),
  followUp: z
    .object({
      question: z.string(),
      answer: z.string().nullable(),
      skipped: z.boolean(),
    })
    .nullable(),
  /** The interviewer's short reaction, shown once the question is done. */
  encouragement: z.string().nullable(),
})

export const practiceAttemptSchema = z.object({
  answer: z.string(),
  feedback: practiceFeedbackSchema,
  practisedAt: z.iso.datetime(),
})

export const interviewRewardsSchema = z.object({
  xpEarned: z.number().int().nonnegative(),
  badgeIds: z.array(z.string()),
})

export const interviewSessionSchema = z.object({
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  completedAt: z.iso.datetime().nullable(),
  setup: interviewSetupSchema,
  targetLabel: z.string(),
  greeting: z.string(),
  turns: z.array(interviewTurnSchema).min(1),
  currentIndex: z.number().int().nonnegative(),
  // Results (Phase 5). Defaults keep sessions saved before then loading.
  evaluation: interviewEvaluationSchema.nullable().default(null),
  resumeFeedback: resumeFeedbackSchema.nullable().default(null),
  /** Set once XP has been awarded, so it is never awarded twice. */
  rewards: interviewRewardsSchema.nullable().default(null),
  /** Practice attempts keyed by the practice question's index. */
  practice: z.record(z.string(), practiceAttemptSchema).default({}),
})

export type InterviewTurn = z.infer<typeof interviewTurnSchema>
export type InterviewSession = z.infer<typeof interviewSessionSchema>
export type PracticeAttempt = z.infer<typeof practiceAttemptSchema>
export type InterviewRewards = z.infer<typeof interviewRewardsSchema>

export function newTurn(question: InterviewTurn["question"]): InterviewTurn {
  return {
    question,
    status: "answering",
    hintUsed: false,
    answer: null,
    skipped: false,
    followUp: null,
    encouragement: null,
  }
}

export function isSessionComplete(session: InterviewSession): boolean {
  return session.completedAt !== null
}

export function countAnswered(session: InterviewSession): number {
  return session.turns.filter((turn) => turn.answer !== null).length
}
