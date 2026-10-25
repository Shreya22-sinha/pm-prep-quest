// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AiError } from "@/lib/ai/errors"

import { evaluateRequest, evaluationAi, resumeFeedback } from "./fixtures"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/ai/client", () => ({ generateJson: vi.fn() }))

const { generateJson } = await import("@/lib/ai/client")
const evaluateRoute = await import("@/app/api/interview/evaluate/route")
const practiceRoute = await import("@/app/api/practice/evaluate/route")
const resumeRoute = await import("@/app/api/resume/feedback/route")

const mockedGenerate = vi.mocked(generateJson)

let ip = 0
function post(body: unknown): Request {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `10.1.0.${++ip}` },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  mockedGenerate.mockReset()
})

describe("POST /api/interview/evaluate", () => {
  it("rejects a transcript without questions", async () => {
    const response = await evaluateRoute.POST(post({ ...evaluateRequest, turns: [] }))
    expect(response.status).toBe(400)
  })

  it("returns scores computed from the AI review", async () => {
    mockedGenerate.mockResolvedValue(evaluationAi)
    const body = await (await evaluateRoute.POST(post(evaluateRequest))).json()

    expect(body.overallScore).toBe(73)
    expect(body.reviews).toHaveLength(3)
    expect(body.reviews[1].verdict).toBe("skipped")
  })

  it("asks the AI client to retry incomplete reviews", async () => {
    mockedGenerate.mockResolvedValue(evaluationAi)
    await evaluateRoute.POST(post(evaluateRequest))

    const options = mockedGenerate.mock.calls[0]![0] as {
      isAcceptable: (data: typeof evaluationAi) => boolean
    }
    expect(options.isAcceptable(evaluationAi)).toBe(true)
    expect(options.isAcceptable({ ...evaluationAi, reviews: [] })).toBe(false)
  })

  it("explains when the AI is busy", async () => {
    mockedGenerate.mockRejectedValue(new AiError("rate_limited", "429"))
    const body = await (await evaluateRoute.POST(post(evaluateRequest))).json()
    expect(body.error.code).toBe("ai_busy")
  })
})

describe("POST /api/practice/evaluate", () => {
  const request = {
    level: "fresher",
    category: "metrics",
    question: "What is the North Star metric for YouTube Shorts?",
    answer: "Daily watch time per active user.",
  }

  it("adds a verdict from the score", async () => {
    mockedGenerate.mockResolvedValue({
      score: 76,
      whatWasGood: ["Clear metric"],
      whatWasMissing: ["Guardrails"],
      modelAnswer: { framework: "North Star", answer: "Start from the goal…" },
      encouragement: "Nice thinking!",
    })
    const body = await (await practiceRoute.POST(post(request))).json()
    expect(body).toMatchObject({ score: 76, verdict: "partial", encouragement: "Nice thinking!" })
  })

  it("rejects an empty answer", async () => {
    const response = await practiceRoute.POST(post({ ...request, answer: "   " }))
    expect(response.status).toBe(400)
    expect(mockedGenerate).not.toHaveBeenCalled()
  })
})

describe("POST /api/resume/feedback", () => {
  const request = {
    level: "fresher",
    path: "job",
    targetLabel: "PM at Acme",
    context: "Product Manager at Acme, owning onboarding.",
    resumeText: "Worked on checkout redesign.\nDid user interviews.",
  }

  it("returns the makeover", async () => {
    mockedGenerate.mockResolvedValue(resumeFeedback)
    const body = await (await resumeRoute.POST(post(request))).json()
    expect(body.projectIdeas).toHaveLength(3)
    expect(body.rewrites[0].before).toBe("Worked on checkout redesign.")
  })

  it("needs resume text", async () => {
    const response = await resumeRoute.POST(post({ ...request, resumeText: "" }))
    expect(response.status).toBe(400)
  })
})
