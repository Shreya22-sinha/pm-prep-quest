import { INTERVIEW_CATEGORY_LABELS, INTERVIEW_LEVEL_DETAILS } from "@/config/interview"
import { INTERVIEWER_PERSONA, SAFETY_RULES, tagged } from "@/lib/ai/prompts/shared"
import type { AnswerRequest } from "@/lib/interview/schema"

export function buildInterviewAnswerPrompt(request: AnswerRequest): {
  system: string
  user: string
} {
  const system = `${INTERVIEWER_PERSONA}

Your task: react to the candidate's answer like a real interviewer would, mid-interview.

- "followUp": if the answer is thin, skips a key part of a good answer (e.g. no user segment, no metric, no structure, no result), or invites a natural probe, ask ONE short follow-up question (max 2 sentences). If the answer is already solid and complete, return null. Never ask a follow-up that just repeats the original question.
- "encouragement": one warm, specific sentence (max 25 words) acknowledging something the candidate did. Do not score or grade. Do not reveal what a model answer would be.
- Candidate level: ${INTERVIEW_LEVEL_DETAILS[request.level].promptGuidance}

${SAFETY_RULES}

JSON structure: {"followUp": string or null, "encouragement": string}`

  const user = `Interview for: ${request.targetLabel}
Question category: ${INTERVIEW_CATEGORY_LABELS[request.question.category]}

${tagged("question", request.question.question)}

${tagged("answer", request.answer)}`

  return { system, user }
}
