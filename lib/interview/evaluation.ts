import { PRACTICE_QUESTIONS_PER_CATEGORY } from "@/config/rubric"
import type { InterviewEvaluationAi } from "@/lib/ai/schemas"
import type { EvaluateRequest, InterviewEvaluation } from "@/lib/interview/feedback-schema"
import { summariseScores, verdictForScore } from "@/lib/interview/scoring"

/** Every question has exactly one review, and every answered question has a score. */
export function isEvaluationComplete(request: EvaluateRequest, ai: InterviewEvaluationAi): boolean {
  return request.turns.every((turn, index) => {
    const reviews = ai.reviews.filter((review) => review.questionNumber === index + 1)
    return reviews.length === 1 && (turn.answer === null || reviews[0]?.score !== null)
  })
}

/** Turns the AI's review into the saved evaluation, computing scores and verdicts in code. */
export function buildEvaluation(
  request: EvaluateRequest,
  ai: InterviewEvaluationAi,
  now = new Date()
): InterviewEvaluation {
  const reviews = request.turns.map((turn, index) => {
    const review = ai.reviews.find((item) => item.questionNumber === index + 1)
    if (!review) throw new Error(`Missing review for question ${index + 1}`)
    // Skipped questions are never scored, whatever the model said.
    const score = turn.answer === null ? null : review.score
    return {
      score,
      verdict: verdictForScore(score),
      whatWasGood: turn.answer === null ? [] : review.whatWasGood,
      whatWasMissing: review.whatWasMissing,
      modelAnswer: review.modelAnswer,
    }
  })

  const summary = summariseScores(
    request.turns.map((turn, index) => ({
      category: turn.category,
      score: reviews[index]?.score ?? null,
    }))
  )

  const practiceQuestions = summary.practiceCategories.flatMap((category) =>
    ai.practiceQuestions
      .filter((question) => question.category === category)
      .slice(0, PRACTICE_QUESTIONS_PER_CATEGORY.max)
  )

  return {
    overallScore: summary.overallScore,
    categoryScores: summary.categoryScores,
    summary: ai.summary,
    strengths: ai.strengths.filter(
      (strength) => request.turns[strength.questionNumber - 1]?.answer != null
    ),
    focusAreas: ai.focusAreas,
    reviews,
    practiceCategories: summary.practiceCategories,
    practiceQuestions,
    evaluatedAt: now.toISOString(),
  }
}
