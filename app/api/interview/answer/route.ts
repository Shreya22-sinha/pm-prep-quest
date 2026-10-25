import { ENCOURAGEMENTS, INTERVIEW_SETTINGS } from "@/config/interview"
import { generateJson } from "@/lib/ai/client"
import { buildInterviewAnswerPrompt } from "@/lib/ai/prompts/interview-answer"
import { answerReactionAiSchema } from "@/lib/ai/schemas"
import { createRateLimiter } from "@/lib/api/rate-limit"
import {
  aiErrorResponse,
  errorResponse,
  getClientKey,
  rateLimitedResponse,
  readJson,
} from "@/lib/api/server"
import { answerRequestSchema, type AnswerResponse } from "@/lib/interview/schema"

const rateLimit = createRateLimiter({ limit: 30, windowMs: 60_000 })

function randomEncouragement(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)] ?? ENCOURAGEMENTS[0]
}

// POST /api/interview/answer: an answer → optional follow-up + a short encouraging reaction.
export async function POST(request: Request) {
  const limit = rateLimit(getClientKey(request))
  if (!limit.ok) return rateLimitedResponse(limit)

  const answer = await readJson(request, answerRequestSchema)
  if (!answer) return errorResponse("invalid_request")

  // Follow-ups are capped per question, so answers to a follow-up skip the AI call.
  const canFollowUp =
    answer.followUpQuestion === null && INTERVIEW_SETTINGS.followUpsPerQuestion > 0
  if (!canFollowUp) {
    const body: AnswerResponse = { followUp: null, encouragement: randomEncouragement() }
    return Response.json(body)
  }

  try {
    const reaction = await generateJson({
      name: "answer_reaction",
      ...buildInterviewAnswerPrompt(answer),
      schema: answerReactionAiSchema,
      temperature: 0.6,
      maxTokens: 1_000,
    })
    const body: AnswerResponse = {
      followUp: reaction.followUp?.trim() || null,
      encouragement: reaction.encouragement,
    }
    return Response.json(body)
  } catch (error) {
    return aiErrorResponse(error, "interview/answer")
  }
}
