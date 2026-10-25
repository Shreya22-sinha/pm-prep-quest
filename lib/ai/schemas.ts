import { z } from "zod"

import { INTERVIEW_CATEGORIES } from "@/config/interview"
import { RESUME_GAP_AREAS, SKILL_TAGS } from "@/lib/interview/feedback-schema"
import { interviewQuestionSchema } from "@/lib/interview/schema"

// Shapes the AI must return. Each response is validated against these before
// the UI sees it (spec section 6).

export const interviewPlanAiSchema = z.object({
  /** Short label for the history, e.g. "Senior PM at Acme" or "Google APM". */
  targetLabel: z.string().trim().min(2).max(80),
  greeting: z.string().trim().min(10).max(600),
  questions: z.array(interviewQuestionSchema).min(1).max(10),
})

export type InterviewPlanAi = z.infer<typeof interviewPlanAiSchema>

export const answerReactionAiSchema = z.object({
  /** One short follow-up question, or null when the answer doesn't need one. */
  followUp: z.string().trim().max(400).nullable(),
  /** One warm sentence about the answer. Never a score. */
  encouragement: z.string().trim().min(3).max(240),
})

export type AnswerReactionAi = z.infer<typeof answerReactionAiSchema>

// Limits are generous ceilings: real model output varies, and a too-strict limit
// turns a good answer into a failed request. Prompts ask for the shorter target.
const feedbackList = z.array(z.string().trim().min(3).max(600)).max(6)

const modelAnswerAiSchema = z.object({
  /** e.g. "CIRCLES", "STAR", "AARRR" or "Structured RCA". */
  framework: z.string().trim().min(2).max(200),
  answer: z.string().trim().min(40).max(5000),
})

export const interviewEvaluationAiSchema = z.object({
  /** A warm 1–2 sentence overview, leading with what went well. */
  summary: z.string().trim().min(10).max(500),
  strengths: z
    .array(
      z.object({
        questionNumber: z.number().int().min(1),
        /** A short, exact quote from the candidate's answer. */
        quote: z.string().trim().min(3).max(300),
        why: z.string().trim().min(5).max(300),
      })
    )
    .max(8),
  /** 1–3 "learning moments", phrased kindly. */
  focusAreas: z.array(z.string().trim().min(5).max(250)).min(1).max(3),
  reviews: z.array(
    z.object({
      questionNumber: z.number().int().min(1),
      /** Null only for skipped questions. */
      score: z.number().int().min(0).max(100).nullable(),
      whatWasGood: feedbackList,
      whatWasMissing: feedbackList,
      modelAnswer: modelAnswerAiSchema,
    })
  ),
  practiceQuestions: z
    .array(
      z.object({
        category: z.enum(INTERVIEW_CATEGORIES),
        question: z.string().trim().min(10).max(600),
      })
    )
    .max(15),
})

export type InterviewEvaluationAi = z.infer<typeof interviewEvaluationAiSchema>

export const practiceFeedbackAiSchema = z.object({
  score: z.number().int().min(0).max(100),
  whatWasGood: feedbackList,
  whatWasMissing: feedbackList,
  modelAnswer: modelAnswerAiSchema,
  encouragement: z.string().trim().min(3).max(240),
})

export const resumeFeedbackAiSchema = z.object({
  strengths: z.array(z.string().trim().min(5).max(300)).min(1).max(5),
  gaps: z
    .array(
      z.object({
        area: z.enum(RESUME_GAP_AREAS),
        detail: z.string().trim().min(5).max(400),
      })
    )
    .min(1)
    .max(6),
  rewrites: z
    .array(
      z.object({
        /** Copied exactly from the resume. */
        before: z.string().trim().min(5).max(500),
        after: z.string().trim().min(5).max(500),
        why: z.string().trim().min(5).max(300),
      })
    )
    .min(2)
    .max(4),
  skillsToAdd: z
    .array(
      z.object({
        skill: z.string().trim().min(2).max(80),
        why: z.string().trim().min(5).max(300),
        tag: z.enum(SKILL_TAGS),
      })
    )
    .min(1)
    .max(5),
  projectIdeas: z
    .array(
      z.object({
        title: z.string().trim().min(3).max(100),
        description: z.string().trim().min(10).max(300),
        demonstrates: z.string().trim().min(5).max(300),
        howToStart: z.string().trim().min(5).max(400),
      })
    )
    .length(3),
})
