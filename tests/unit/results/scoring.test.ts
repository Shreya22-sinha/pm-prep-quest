import { describe, expect, it } from "vitest"

import { toProviderJsonSchema } from "@/lib/ai/json-schema"
import { buildInterviewEvaluatePrompt } from "@/lib/ai/prompts/interview-evaluate"
import { rubricText } from "@/lib/ai/prompts/rubric"
import { interviewEvaluationAiSchema, resumeFeedbackAiSchema } from "@/lib/ai/schemas"
import { buildEvaluation, isEvaluationComplete } from "@/lib/interview/evaluation"
import { summariseScores, verdictForScore } from "@/lib/interview/scoring"

import { evaluateRequest, evaluationAi, resumeFeedback } from "./fixtures"

describe("verdictForScore", () => {
  it("uses the configured bands", () => {
    expect(verdictForScore(80)).toBe("strong")
    expect(verdictForScore(79)).toBe("partial")
    expect(verdictForScore(50)).toBe("partial")
    expect(verdictForScore(49)).toBe("needs-work")
    expect(verdictForScore(null)).toBe("skipped")
  })
})

describe("summariseScores", () => {
  it("averages per category and overall, ignoring skipped questions", () => {
    const summary = summariseScores([
      { category: "metrics", score: 60 },
      { category: "metrics", score: 81 },
      { category: "behavioral", score: null },
      { category: "strategy", score: 90 },
    ])
    expect(summary.overallScore).toBe(77)
    expect(summary.categoryScores).toEqual([
      { category: "metrics", score: 71 },
      { category: "behavioral", score: null },
      { category: "strategy", score: 90 },
    ])
    // Skipped-only first, then weak ones; strong categories don't need practice.
    expect(summary.practiceCategories).toEqual(["behavioral"])
  })

  it("still suggests the lowest category when everything is strong", () => {
    const summary = summariseScores([
      { category: "metrics", score: 85 },
      { category: "strategy", score: 92 },
    ])
    expect(summary.practiceCategories).toEqual(["metrics"])
  })

  it("has no overall score when every question was skipped", () => {
    expect(summariseScores([{ category: "rca", score: null }]).overallScore).toBeNull()
  })
})

describe("buildEvaluation", () => {
  const evaluation = buildEvaluation(
    evaluateRequest,
    evaluationAi,
    new Date("2026-10-24T10:00:00Z")
  )

  it("never scores a skipped question, whatever the AI said", () => {
    expect(evaluation.reviews[1]).toMatchObject({
      score: null,
      verdict: "skipped",
      whatWasGood: [],
    })
    expect(evaluation.reviews[1]?.whatWasMissing).toEqual(["Define the goal first"])
  })

  it("computes the overall and verdicts in code", () => {
    expect(evaluation.overallScore).toBe(73)
    expect(evaluation.reviews.map((review) => review.verdict)).toEqual([
      "strong",
      "skipped",
      "partial",
    ])
  })

  it("drops praise for skipped questions", () => {
    expect(evaluation.strengths.map((strength) => strength.questionNumber)).toEqual([1])
  })

  it("keeps practice questions for the weak categories only", () => {
    expect(evaluation.practiceCategories).toEqual(["metrics", "behavioral"])
    expect(evaluation.practiceQuestions.map((question) => question.category)).toEqual([
      "metrics",
      "metrics",
      "metrics",
      "behavioral",
      "behavioral",
      "behavioral",
    ])
  })

  it("detects incomplete AI reviews so they get retried", () => {
    expect(isEvaluationComplete(evaluateRequest, evaluationAi)).toBe(true)
    expect(
      isEvaluationComplete(evaluateRequest, {
        ...evaluationAi,
        reviews: evaluationAi.reviews.slice(0, 2),
      })
    ).toBe(false)
    expect(
      isEvaluationComplete(evaluateRequest, {
        ...evaluationAi,
        reviews: evaluationAi.reviews.map((review) =>
          review.questionNumber === 1 ? { ...review, score: null } : review
        ),
      })
    ).toBe(false)
  })
})

describe("evaluation prompts and schemas", () => {
  it("passes the rubric for the categories being scored", () => {
    const text = rubricText(["metrics", "metrics", "behavioral"])
    expect(text).toContain("metrics (Metrics): focus on structure, metrics, userFocus")
    expect(text).toContain("behavioral (Behavioral)")
    expect(text).not.toContain("guesstimate (")
    expect(text).toContain("80+ = strong")
  })

  it("marks skipped questions in the transcript", () => {
    const { system, user } = buildInterviewEvaluatePrompt(evaluateRequest)
    expect(system).toContain("lead with what went well")
    expect(user).toContain("The candidate skipped this question.")
    expect(user).toContain("Interviewer follow-up: Which tourists first?")
  })

  it("produces strict provider schemas", () => {
    const schema = JSON.stringify(toProviderJsonSchema(interviewEvaluationAiSchema))
    expect(schema).not.toMatch(/maxItems|minimum/)
    expect(schema).toContain('"additionalProperties":false')
    expect(resumeFeedbackAiSchema.safeParse(resumeFeedback).success).toBe(true)
  })
})
