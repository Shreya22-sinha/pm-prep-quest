import { generateJson } from "@/lib/ai/client"
import { buildInterviewEvaluatePrompt } from "@/lib/ai/prompts/interview-evaluate"
import { interviewEvaluationAiSchema } from "@/lib/ai/schemas"
import { createRateLimiter } from "@/lib/api/rate-limit"
import {
  aiErrorResponse,
  errorResponse,
  getClientKey,
  rateLimitedResponse,
  readJson,
} from "@/lib/api/server"
import { buildEvaluation, isEvaluationComplete } from "@/lib/interview/evaluation"
import { evaluateRequestSchema } from "@/lib/interview/feedback-schema"

const rateLimit = createRateLimiter({ limit: 6, windowMs: 60_000 })

// POST /api/interview/evaluate: full transcript → scores, praise, reviews, model answers, practice.
export async function POST(request: Request) {
  const limit = rateLimit(getClientKey(request))
  if (!limit.ok) return rateLimitedResponse(limit)

  const body = await readJson(request, evaluateRequestSchema)
  if (!body) return errorResponse("invalid_request")

  try {
    const ai = await generateJson({
      name: "interview_evaluation",
      ...buildInterviewEvaluatePrompt(body),
      schema: interviewEvaluationAiSchema,
      isAcceptable: (data) => isEvaluationComplete(body, data),
      temperature: 0.4,
      maxTokens: 16_000,
    })
    return Response.json(buildEvaluation(body, ai))
  } catch (error) {
    return aiErrorResponse(error, "interview/evaluate")
  }
}
