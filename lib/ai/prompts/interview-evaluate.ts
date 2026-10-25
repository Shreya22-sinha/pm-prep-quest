import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_CATEGORY_LABELS,
  INTERVIEW_LEVEL_DETAILS,
} from "@/config/interview"
import { PRACTICE_QUESTIONS_PER_CATEGORY } from "@/config/rubric"
import { rubricText } from "@/lib/ai/prompts/rubric"
import { INTERVIEWER_PERSONA, SAFETY_RULES, tagged } from "@/lib/ai/prompts/shared"
import type { EvaluateRequest } from "@/lib/interview/feedback-schema"

export function buildInterviewEvaluatePrompt(request: EvaluateRequest): {
  system: string
  user: string
} {
  const system = `${INTERVIEWER_PERSONA}

Your task: review a finished mock interview and give detailed, encouraging feedback.

Tone: lead with what went well. Frame gaps as "learning moments", never failures. Be specific and kind, never harsh.
Candidate level: ${INTERVIEW_LEVEL_DETAILS[request.level].promptGuidance}

${rubricText(request.turns.map((turn) => turn.category))}

Return:
- "summary": 1–2 warm sentences about the interview overall, starting with a genuine positive.
- "strengths": specific things the candidate did well. Each has the questionNumber, a short EXACT quote from their answer, and why it was good. Skip questions with no real strength. Empty if every question was skipped.
- "focusAreas": 1–3 kind, actionable learning moments for the whole interview.
- "reviews": exactly one entry per question, in order, with "questionNumber" matching the question. For each:
  - "score": 0–100 using the rubric, or null ONLY if the question was skipped.
  - "whatWasGood": up to 4 specific points (empty if skipped).
  - "whatWasMissing": up to 4 specific, actionable points (for skipped questions: what a good answer would cover).
  - "modelAnswer": "framework" (just the framework's short name, e.g. CIRCLES, STAR, AARRR) and "answer" (a concise, well-structured model answer of about 120–250 words, at the candidate's level). Use short paragraphs or numbered steps.
- "practiceQuestions": for the 1–3 categories where the candidate was weakest (lowest scores or skipped), ${PRACTICE_QUESTIONS_PER_CATEGORY.min}–${PRACTICE_QUESTIONS_PER_CATEGORY.max} NEW questions each, similar in style to the interview's questions but not copies. Each question must stand on its own. Categories must be from: ${INTERVIEW_CATEGORIES.join(", ")}.
${SAFETY_RULES}`

  const transcript = request.turns
    .map((turn, index) => {
      const lines = [
        `Question ${index + 1} (category: ${turn.category}, ${INTERVIEW_CATEGORY_LABELS[turn.category]}):`,
        tagged("question", turn.question),
        turn.answer === null
          ? "The candidate skipped this question."
          : tagged("answer", turn.answer),
      ]
      if (turn.followUp) {
        lines.push(
          `Interviewer follow-up: ${turn.followUp.question}`,
          turn.followUp.answer === null
            ? "The candidate skipped the follow-up."
            : tagged("answer", turn.followUp.answer)
        )
      }
      return lines.join("\n")
    })
    .join("\n\n")

  const user = `Interview for: ${request.targetLabel} (${request.path === "job" ? "job" : "PM program"})
${request.context ? `Context:\n${tagged(request.path === "job" ? "job_description" : "program", request.context)}\n` : ""}
Transcript (${request.turns.length} questions):

${transcript}`

  return { system, user }
}
