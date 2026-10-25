import { INTERVIEW_LENGTH_DETAILS } from "@/config/interview"
import { generateJson } from "@/lib/ai/client"
import { buildInterviewStartPrompt } from "@/lib/ai/prompts/interview-start"
import { interviewPlanAiSchema } from "@/lib/ai/schemas"
import { createRateLimiter } from "@/lib/api/rate-limit"
import {
  aiErrorResponse,
  errorResponse,
  getClientKey,
  rateLimitedResponse,
  readJson,
} from "@/lib/api/server"
import { interviewSetupSchema, type StartResponse } from "@/lib/interview/schema"
import { getMock, getProgramTrack } from "@/lib/programs/track"

const rateLimit = createRateLimiter({ limit: 6, windowMs: 60_000 })

// POST /api/interview/start: interview setup → greeting + tailored question plan.
export async function POST(request: Request) {
  const limit = rateLimit(getClientKey(request))
  if (!limit.ok) return rateLimitedResponse(limit)

  const setup = await readJson(request, interviewSetupSchema)
  if (!setup) return errorResponse("invalid_request")

  const questionCount = INTERVIEW_LENGTH_DETAILS[setup.length].questionCount

  try {
    const plan = await generateJson({
      name: "interview_plan",
      ...buildInterviewStartPrompt(setup),
      schema: interviewPlanAiSchema,
      isAcceptable: (data) => data.questions.length >= questionCount,
      temperature: 0.8,
    })
    // Program mocks are labelled with their theme, e.g. "Google APM · Analytical thinking".
    const mock =
      setup.program && setup.programMockId
        ? getMock(getProgramTrack(setup.program), setup.programMockId)
        : undefined
    const body: StartResponse = {
      targetLabel: mock ? `${plan.targetLabel} · ${mock.title}` : plan.targetLabel,
      greeting: plan.greeting,
      questions: plan.questions.slice(0, questionCount),
    }
    return Response.json(body)
  } catch (error) {
    return aiErrorResponse(error, "interview/start")
  }
}
