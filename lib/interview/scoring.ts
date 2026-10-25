import type { InterviewCategory } from "@/config/interview"
import { MAX_PRACTICE_CATEGORIES, SCORE_BANDS, WEAK_CATEGORY_THRESHOLD } from "@/config/rubric"
import type { Verdict } from "@/lib/interview/feedback-schema"

// Scores are aggregated in code, not by the AI, so totals are always consistent
// with the per-question scores the candidate sees.

export function verdictForScore(score: number | null): Verdict {
  if (score === null) return "skipped"
  if (score >= SCORE_BANDS.strong) return "strong"
  if (score >= SCORE_BANDS.partial) return "partial"
  return "needs-work"
}

const average = (values: number[]) =>
  values.length === 0
    ? null
    : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)

type ScoredQuestion = { category: InterviewCategory; score: number | null }

export type ScoreSummary = {
  overallScore: number | null
  categoryScores: { category: InterviewCategory; score: number | null }[]
  /** Categories to practise: weak ones, or the lowest one if everything is strong. */
  practiceCategories: InterviewCategory[]
}

export function summariseScores(questions: ScoredQuestion[]): ScoreSummary {
  const byCategory = new Map<InterviewCategory, number[]>()
  for (const { category, score } of questions) {
    const scores = byCategory.get(category) ?? []
    if (score !== null) scores.push(score)
    byCategory.set(category, scores)
  }

  const categoryScores = [...byCategory].map(([category, scores]) => ({
    category,
    score: average(scores),
  }))

  // Skipped-only categories (null) count as the weakest.
  const ranked = [...categoryScores].sort((a, b) => (a.score ?? -1) - (b.score ?? -1))
  const weak = ranked.filter((item) => item.score === null || item.score < WEAK_CATEGORY_THRESHOLD)
  const practice = (weak.length > 0 ? weak : ranked.slice(0, 1))
    .slice(0, MAX_PRACTICE_CATEGORIES)
    .map((item) => item.category)

  return {
    overallScore: average(
      questions.flatMap((question) => (question.score === null ? [] : [question.score]))
    ),
    categoryScores,
    practiceCategories: practice,
  }
}
