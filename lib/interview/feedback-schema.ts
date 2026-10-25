import { z } from "zod"

import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_LEVELS,
  INTERVIEW_PATHS,
  INTERVIEW_SETTINGS,
} from "@/config/interview"
import { EVALUATION_CONTEXT_CHARS } from "@/config/rubric"
import type { ResourceTag } from "@/content/resources"

// Shapes for results & feedback (spec 5.3 step 5), shared by the API routes
// (request validation, responses) and the browser (saved results).

export const VERDICTS = ["strong", "partial", "needs-work", "skipped"] as const
export type Verdict = (typeof VERDICTS)[number]

/** Resource tags the AI may attach to a skill, so we can suggest where to learn it. */
export const SKILL_TAGS = [
  "fundamentals",
  "product-sense",
  "metrics",
  "rca",
  "guesstimates",
  "strategy",
  "growth",
  "gtm",
  "analytics",
  "technical",
  "behavioral",
  "career",
] as const satisfies readonly ResourceTag[]

const category = z.enum(INTERVIEW_CATEGORIES)
const answer = z.string().max(INTERVIEW_SETTINGS.maxAnswerChars)

export const modelAnswerSchema = z.object({
  framework: z.string(),
  answer: z.string(),
})

export const questionReviewSchema = z.object({
  score: z.number().int().min(0).max(100).nullable(),
  verdict: z.enum(VERDICTS),
  whatWasGood: z.array(z.string()),
  whatWasMissing: z.array(z.string()),
  modelAnswer: modelAnswerSchema,
})

export const practiceQuestionSchema = z.object({
  category,
  question: z.string(),
})

export const interviewEvaluationSchema = z.object({
  /** Null when every question was skipped. */
  overallScore: z.number().int().min(0).max(100).nullable(),
  categoryScores: z.array(z.object({ category, score: z.number().int().nullable() })),
  summary: z.string(),
  strengths: z.array(
    z.object({ questionNumber: z.number().int().min(1), quote: z.string(), why: z.string() })
  ),
  focusAreas: z.array(z.string()),
  reviews: z.array(questionReviewSchema),
  practiceCategories: z.array(category),
  practiceQuestions: z.array(practiceQuestionSchema),
  evaluatedAt: z.iso.datetime(),
})

export type QuestionReview = z.infer<typeof questionReviewSchema>
export type PracticeQuestion = z.infer<typeof practiceQuestionSchema>
export type InterviewEvaluation = z.infer<typeof interviewEvaluationSchema>

const interviewContext = {
  level: z.enum(INTERVIEW_LEVELS),
  path: z.enum(INTERVIEW_PATHS),
  targetLabel: z.string().max(120),
  /** Job description excerpt or program name, for tailoring model answers. */
  context: z.string().max(EVALUATION_CONTEXT_CHARS).nullable(),
}

export const evaluateRequestSchema = z.object({
  ...interviewContext,
  turns: z
    .array(
      z.object({
        category,
        question: z.string().max(600),
        /** Null when the question was skipped. */
        answer: answer.nullable(),
        followUp: z.object({ question: z.string().max(600), answer: answer.nullable() }).nullable(),
      })
    )
    .min(1)
    .max(10),
})

export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>

export const practiceRequestSchema = z.object({
  level: z.enum(INTERVIEW_LEVELS),
  category,
  question: z.string().min(10).max(600),
  answer: answer.trim().min(1),
})

export type PracticeRequest = z.infer<typeof practiceRequestSchema>

export const practiceFeedbackSchema = z.object({
  score: z.number().int().min(0).max(100),
  verdict: z.enum(VERDICTS),
  whatWasGood: z.array(z.string()),
  whatWasMissing: z.array(z.string()),
  modelAnswer: modelAnswerSchema,
  encouragement: z.string(),
})

export type PracticeFeedback = z.infer<typeof practiceFeedbackSchema>

export const resumeFeedbackRequestSchema = z.object({
  ...interviewContext,
  resumeText: z.string().trim().min(1).max(INTERVIEW_SETTINGS.maxResumeChars),
})

export type ResumeFeedbackRequest = z.infer<typeof resumeFeedbackRequestSchema>

export const RESUME_GAP_AREAS = ["skills", "keywords", "impact", "other"] as const

export const resumeFeedbackSchema = z.object({
  strengths: z.array(z.string()),
  gaps: z.array(z.object({ area: z.enum(RESUME_GAP_AREAS), detail: z.string() })),
  rewrites: z.array(z.object({ before: z.string(), after: z.string(), why: z.string() })),
  skillsToAdd: z.array(z.object({ skill: z.string(), why: z.string(), tag: z.enum(SKILL_TAGS) })),
  projectIdeas: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      demonstrates: z.string(),
      howToStart: z.string(),
    })
  ),
})

export type ResumeFeedback = z.infer<typeof resumeFeedbackSchema>
