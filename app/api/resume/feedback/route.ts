import { generateJson } from "@/lib/ai/client"
import { buildResumeFeedbackPrompt } from "@/lib/ai/prompts/resume-feedback"
import { resumeFeedbackAiSchema } from "@/lib/ai/schemas"
import { createRateLimiter } from "@/lib/api/rate-limit"
import {
  aiErrorResponse,
  errorResponse,
  getClientKey,
  rateLimitedResponse,
  readJson,
} from "@/lib/api/server"
import { resumeFeedbackRequestSchema, type ResumeFeedback } from "@/lib/interview/feedback-schema"

const rateLimit = createRateLimiter({ limit: 6, windowMs: 60_000 })

// POST /api/resume/feedback: resume + target → resume makeover. Resume text is never logged.
export async function POST(request: Request) {
  const limit = rateLimit(getClientKey(request))
  if (!limit.ok) return rateLimitedResponse(limit)

  const body = await readJson(request, resumeFeedbackRequestSchema)
  if (!body) return errorResponse("invalid_request")

  try {
    const feedback: ResumeFeedback = await generateJson({
      name: "resume_feedback",
      ...buildResumeFeedbackPrompt(body),
      schema: resumeFeedbackAiSchema,
      temperature: 0.5,
      maxTokens: 6_000,
    })
    return Response.json(feedback)
  } catch (error) {
    return aiErrorResponse(error, "resume/feedback")
  }
}
