import { z } from "zod"

import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_LENGTHS,
  INTERVIEW_LEVELS,
  INTERVIEW_MODES,
  INTERVIEW_PATHS,
  INTERVIEW_SETTINGS,
} from "@/config/interview"

// Shared by the browser (wizard validation, saved sessions) and the API
// routes (request validation). AI output schemas live in lib/ai/schemas.ts.

const { maxAnswerChars, maxJobDescriptionChars, maxResumeChars, minJobDescriptionChars } =
  INTERVIEW_SETTINGS

export const interviewSetupSchema = z
  .object({
    path: z.enum(INTERVIEW_PATHS),
    jobDescription: z.string().trim().max(maxJobDescriptionChars).nullable(),
    program: z
      .object({
        /** Null for a custom program the user typed in. */
        id: z.string().nullable(),
        name: z.string().trim().min(2).max(120),
      })
      .nullable(),
    resumeText: z.string().trim().max(maxResumeChars).nullable(),
    level: z.enum(INTERVIEW_LEVELS),
    mode: z.enum(INTERVIEW_MODES),
    length: z.enum(INTERVIEW_LENGTHS),
    /** Set when this interview is one of a program track's themed mocks (Phase 7). */
    programMockId: z.string().max(80).nullable().default(null),
  })
  .superRefine((setup, ctx) => {
    if (setup.path === "job" && (setup.jobDescription?.length ?? 0) < minJobDescriptionChars) {
      ctx.addIssue({
        code: "custom",
        path: ["jobDescription"],
        message: `Paste the job description (at least ${minJobDescriptionChars} characters).`,
      })
    }
    if (setup.path === "program" && !setup.program) {
      ctx.addIssue({
        code: "custom",
        path: ["program"],
        message: "Choose a program or type one in.",
      })
    }
  })

export type InterviewSetup = z.infer<typeof interviewSetupSchema>

export const interviewQuestionSchema = z.object({
  category: z.enum(INTERVIEW_CATEGORIES),
  question: z.string().trim().min(10).max(600),
  hint: z.string().trim().min(5).max(400),
})

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>

export const answerRequestSchema = z.object({
  level: z.enum(INTERVIEW_LEVELS),
  targetLabel: z.string().max(120),
  question: interviewQuestionSchema.pick({ category: true, question: true }),
  answer: z.string().trim().min(1).max(maxAnswerChars),
  /** Present when this request answers a follow-up, so no further follow-up is asked. */
  followUpQuestion: z.string().max(600).nullable(),
})

export type AnswerRequest = z.infer<typeof answerRequestSchema>

export const answerResponseSchema = z.object({
  followUp: z.string().nullable(),
  encouragement: z.string(),
})

export type AnswerResponse = z.infer<typeof answerResponseSchema>

export const startResponseSchema = z.object({
  targetLabel: z.string(),
  greeting: z.string(),
  questions: z.array(interviewQuestionSchema).min(1),
})

export type StartResponse = z.infer<typeof startResponseSchema>

export const resumeParseResponseSchema = z.object({
  text: z.string(),
  truncated: z.boolean(),
  pages: z.number().int().nonnegative(),
})

export type ResumeParseResponse = z.infer<typeof resumeParseResponseSchema>
