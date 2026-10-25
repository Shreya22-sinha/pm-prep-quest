import { INTERVIEW_CATEGORY_LABELS, INTERVIEW_LEVEL_DETAILS } from "@/config/interview"
import { rubricText } from "@/lib/ai/prompts/rubric"
import { INTERVIEWER_PERSONA, SAFETY_RULES, tagged } from "@/lib/ai/prompts/shared"
import type { PracticeRequest } from "@/lib/interview/feedback-schema"

export function buildPracticeEvaluatePrompt(request: PracticeRequest): {
  system: string
  user: string
} {
  const system = `${INTERVIEWER_PERSONA}

Your task: give feedback on a single practice answer. This is practice, so be especially encouraging.
Candidate level: ${INTERVIEW_LEVEL_DETAILS[request.level].promptGuidance}

${rubricText([request.category])}

Return:
- "score": 0–100 using the rubric.
- "whatWasGood": up to 4 specific strengths.
- "whatWasMissing": up to 4 specific, actionable improvements, framed as learning moments.
- "modelAnswer": "framework" (just the framework's short name, e.g. "CIRCLES", "STAR", "North Star metric") and a concise model "answer" (about 120–250 words).
- "encouragement": one warm sentence to keep them going.
${SAFETY_RULES}`

  const user = `Category: ${INTERVIEW_CATEGORY_LABELS[request.category]}

${tagged("question", request.question)}

${tagged("answer", request.answer)}`

  return { system, user }
}
