// @vitest-environment node
// Route handlers run on the server, so test them with Node's Request/FormData.
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AiError } from "@/lib/ai/errors"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/ai/client", () => ({ generateJson: vi.fn() }))

const { generateJson } = await import("@/lib/ai/client")
const startRoute = await import("@/app/api/interview/start/route")
const answerRoute = await import("@/app/api/interview/answer/route")
const parseRoute = await import("@/app/api/resume/parse/route")

const mockedGenerate = vi.mocked(generateJson)

let ip = 0
function post(body: unknown): Request {
  // A fresh IP per request keeps the per-IP rate limiter out of these tests.
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `10.0.0.${++ip}` },
    body: JSON.stringify(body),
  })
}

const validSetup = {
  path: "program",
  jobDescription: null,
  program: { id: "google-apm", name: "Google Associate Product Manager (APM)" },
  resumeText: null,
  level: "fresher",
  mode: "written",
  length: "quick",
}

const question = (n: number) => ({
  category: "metrics",
  question: `Question number ${n}: how would you measure success?`,
  hint: "Think about the user journey.",
})

describe("POST /api/interview/start", () => {
  beforeEach(() => {
    mockedGenerate.mockReset()
  })

  it("rejects an invalid setup without calling the AI", async () => {
    const response = await startRoute.POST(post({ ...validSetup, level: "wizard" }))
    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe("invalid_request")
    expect(mockedGenerate).not.toHaveBeenCalled()
  })

  it("returns exactly the requested number of questions", async () => {
    mockedGenerate.mockResolvedValue({
      targetLabel: "Google APM",
      greeting: "Welcome! Let's have a relaxed conversation.",
      questions: [question(1), question(2), question(3), question(4)],
    })
    const response = await startRoute.POST(post(validSetup))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.questions).toHaveLength(3)
    expect(body.targetLabel).toBe("Google APM")
  })

  it("labels program mocks with their theme", async () => {
    mockedGenerate.mockResolvedValue({
      targetLabel: "Google APM",
      greeting: "Welcome! Let's have a relaxed conversation.",
      questions: [question(1), question(2), question(3)],
    })
    const body = await (
      await startRoute.POST(post({ ...validSetup, programMockId: "analytical" }))
    ).json()
    expect(body.targetLabel).toBe("Google APM · Analytical thinking")
  })

  it("explains clearly when the API key is missing", async () => {
    mockedGenerate.mockRejectedValue(new AiError("not_configured", "missing"))
    const response = await startRoute.POST(post(validSetup))
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.error.code).toBe("ai_not_configured")
    expect(body.error.message).toContain("GROQ_API_KEY")
  })

  it("maps provider rate limits to a friendly 'busy' message", async () => {
    mockedGenerate.mockRejectedValue(new AiError("rate_limited", "429"))
    const response = await startRoute.POST(post(validSetup))
    expect((await response.json()).error.code).toBe("ai_busy")
  })
})

describe("POST /api/interview/answer", () => {
  beforeEach(() => {
    mockedGenerate.mockReset()
  })

  const answer = {
    level: "fresher",
    targetLabel: "Google APM",
    question: { category: "metrics", question: "How would you measure success of Stories?" },
    answer: "I'd look at daily active users.",
    followUpQuestion: null,
  }

  it("returns the interviewer's follow-up", async () => {
    mockedGenerate.mockResolvedValue({
      followUp: "Which user segment matters most?",
      encouragement: "Good start on the North Star.",
    })
    const body = await (await answerRoute.POST(post(answer))).json()
    expect(body).toEqual({
      followUp: "Which user segment matters most?",
      encouragement: "Good start on the North Star.",
    })
  })

  it("treats an empty follow-up as none", async () => {
    mockedGenerate.mockResolvedValue({ followUp: "  ", encouragement: "Great answer." })
    const body = await (await answerRoute.POST(post(answer))).json()
    expect(body.followUp).toBeNull()
  })

  it("never asks a second follow-up, and skips the AI call", async () => {
    const response = await answerRoute.POST(
      post({ ...answer, followUpQuestion: "Which segment matters most?" })
    )
    const body = await response.json()
    expect(body.followUp).toBeNull()
    expect(body.encouragement.length).toBeGreaterThan(0)
    expect(mockedGenerate).not.toHaveBeenCalled()
  })
})

describe("POST /api/resume/parse", () => {
  function upload(file: File): Request {
    const form = new FormData()
    form.append("file", file)
    return new Request("http://localhost/api", {
      method: "POST",
      headers: { "x-forwarded-for": `10.0.1.${++ip}` },
      body: form,
    })
  }

  it("rejects files that aren't PDFs", async () => {
    const response = await parseRoute.POST(
      upload(new File(["just text"], "resume.pdf", { type: "application/pdf" }))
    )
    expect(response.status).toBe(415)
    expect((await response.json()).error.code).toBe("unsupported_file")
  })

  it("rejects requests without a file", async () => {
    const response = await parseRoute.POST(post({}))
    expect(response.status).toBe(400)
  })
})
