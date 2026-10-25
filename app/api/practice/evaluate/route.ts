import { generateJson } from "@/lib/ai/client"
import { buildPracticeEvaluatePrompt } from "@/lib/ai/prompts/practice-evaluate"
import { practiceFeedbackAiSchema } from "@/lib/ai/schemas"
import { createRateLimiter } from "@/lib/api/rate-limit"
import {
  aiErrorResponse,
  errorResponse,
  getClientKey,
  rateLimitedResponse,
  readJson,
} from "@/lib/api/server"
import { practiceRequestSchema, type PracticeFeedback } from "@/lib/interview/feedback-schema"
import { verdictForScore } from "@/lib/interview/scoring"

const rateLimit = createRateLimiter({ limit: 15, windowMs: 60_000 })

// POST /api/practice/evaluate: one practice question + answer → feedback and a model answer.
export async function POST(request: Request) {
  const limit = rateLimit(getClientKey(request))
  if (!limit.ok) return rateLimitedResponse(limit)

  const body = await readJson(request, practiceRequestSchema)
  if (!body) return errorResponse("invalid_request")

  try {
    const ai = await generateJson({
      name: "practice_feedback",
      ...buildPracticeEvaluatePrompt(body),
      schema: practiceFeedbackAiSchema,
      temperature: 0.4,
      maxTokens: 4_000,
    })
    const feedback: PracticeFeedback = { ...ai, verdict: verdictForScore(ai.score) }
    return Response.json(feedback)
  } catch (error) {
    return aiErrorResponse(error, "practice/evaluate")
  }
}
