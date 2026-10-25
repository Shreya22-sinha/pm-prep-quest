import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { InterviewSession } from "@/components/interview/interview-session"
import { XP_REWARDS } from "@/config/gamification"
import { draftToSetup, EMPTY_DRAFT } from "@/lib/interview/wizard"
import { useInterviewStore } from "@/store/interview-store"
import { useProgressStore } from "@/store/progress-store"

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => router }))

function mockAnswerResponse(body: object, status = 200) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  )
}

function createSession() {
  const setup = draftToSetup({
    ...EMPTY_DRAFT,
    path: "program",
    programId: "google-apm",
    level: "fresher",
    length: "quick",
  })!
  return useInterviewStore.getState().createSession(setup, {
    targetLabel: "Google APM",
    greeting: "Welcome! Let's keep this relaxed.",
    questions: [
      {
        category: "metrics",
        question: "How would you measure the success of Google Maps?",
        hint: "Start with the goal.",
      },
      {
        category: "behavioral",
        question: "Tell me about a time you led without authority.",
        hint: "Use STAR.",
      },
    ],
  })
}

describe("InterviewSession", () => {
  beforeEach(async () => {
    await useInterviewStore.persist.rehydrate()
    await useProgressStore.persist.rehydrate()
    useInterviewStore.setState({ sessions: {} })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("shows a friendly message for an unknown interview", () => {
    render(<InterviewSession id="nope" />)
    expect(screen.getByText("We couldn't find that interview")).toBeInTheDocument()
  })

  it("runs a question with a hint, a follow-up and encouragement", async () => {
    const user = userEvent.setup()
    const id = createSession()
    render(<InterviewSession id={id} />)

    expect(screen.getByText("Welcome! Let's keep this relaxed.")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "How would you measure the success of Google Maps?" })
    ).toHaveFocus()

    await user.click(screen.getByRole("button", { name: "Give me a hint" }))
    expect(screen.getByRole("note")).toHaveTextContent("Start with the goal.")

    mockAnswerResponse({ followUp: "Which users matter most?", encouragement: "Nice start." })
    await user.type(screen.getByLabelText("Your answer"), "Trips started per week.")
    await user.click(screen.getByRole("button", { name: "Submit answer" }))

    expect(await screen.findByText("Which users matter most?")).toBeInTheDocument()

    await user.type(screen.getByLabelText("Your follow-up answer"), "Daily commuters.")
    await user.click(screen.getByRole("button", { name: "Submit follow-up" }))

    expect(useProgressStore.getState().xp).toBe(XP_REWARDS.followUpAnswered)
    await user.click(screen.getByRole("button", { name: "Next question" }))
    expect(
      screen.getByRole("heading", { name: "Tell me about a time you led without authority." })
    ).toBeInTheDocument()
  })

  it("offers to retry or continue when the AI can't be reached", async () => {
    const user = userEvent.setup()
    const id = createSession()
    render(<InterviewSession id={id} />)

    mockAnswerResponse({ error: { code: "ai_not_configured", message: "ignored" } }, 503)
    await user.type(screen.getByLabelText("Your answer"), "My answer.")
    await user.click(screen.getByRole("button", { name: "Submit answer" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("GROQ_API_KEY")
    await user.click(screen.getByRole("button", { name: "Continue without feedback" }))
    expect(screen.getByRole("button", { name: "Next question" })).toBeInTheDocument()
  })

  it("can skip and finish, then goes to the results", async () => {
    const user = userEvent.setup()
    const id = createSession()
    render(<InterviewSession id={id} />)

    await user.click(screen.getByRole("button", { name: "Skip question" }))
    await user.click(screen.getByRole("button", { name: "Next question" }))
    await user.click(screen.getByRole("button", { name: "Skip question" }))
    await user.click(screen.getByRole("button", { name: "Finish interview" }))

    expect(useInterviewStore.getState().sessions[id]?.completedAt).not.toBeNull()
    expect(router.push).toHaveBeenCalledWith(`/interview/results/${id}`)
  })
})
