import { INTERVIEW_CATEGORY_LABELS, type InterviewCategory } from "@/config/interview"
import { CATEGORY_RUBRIC, RUBRIC_DIMENSIONS, SCORE_BANDS } from "@/config/rubric"

/** The scoring rubric as prompt text, limited to the categories being scored. */
export function rubricText(categories: readonly InterviewCategory[]): string {
  const dimensions = Object.entries(RUBRIC_DIMENSIONS)
    .map(([name, description]) => `- ${name}: ${description}`)
    .join("\n")

  const perCategory = [...new Set(categories)]
    .map((category) => {
      const rubric = CATEGORY_RUBRIC[category]
      return `- ${category} (${INTERVIEW_CATEGORY_LABELS[category]}): focus on ${rubric.focus.join(", ")}. A strong answer ${rubric.lookFor.charAt(0).toLowerCase()}${rubric.lookFor.slice(1)}`
    })
    .join("\n")

  return `Scoring rubric (score each answered question 0–100):
Dimensions:
${dimensions}

What a strong answer looks like, by category:
${perCategory}

Score bands: ${SCORE_BANDS.strong}+ = strong, ${SCORE_BANDS.partial}–${SCORE_BANDS.strong - 1} = partially there, below ${SCORE_BANDS.partial} = needs work.
Calibrate to the candidate's level: judge them against what a good candidate at that level would say, not against a perfect senior answer. Be fair and consistent; don't inflate scores.`
}
