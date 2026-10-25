import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ResultsView } from "@/components/results/results-view"
import { XP_REWARDS } from "@/config/gamification"
import { buildEvaluation } from "@/lib/interview/evaluation"
import { buildEvaluateRequest, awardInterviewRewards } from "@/lib/interview/results"
import { draftToSetup, EMPTY_DRAFT } from "@/lib/interview/wizard"
import { useInterviewStore } from "@/store/interview-store"
import { useProgressStore } from "@/store/progress-store"

import { evaluateRequest, evaluationAi, resumeFeedback } from "./fixtures"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))

const evaluation = buildEvaluation(evaluateRequest, evaluationAi)

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

/** Routes fetch calls to canned API responses. */
function mockApi(responses: Record<string, unknown>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    const match = Object.entries(responses).find(([path]) => url.endsWith(path))
    if (!match) throw new Error(`Unexpected request to ${url}`)
    return jsonResponse(match[1])
  })
}

/** A finished interview matching the fixtures, optionally with a resume. */
function createFinishedSession(withResume: boolean) {
  const store = useInterviewStore.getState()
  const setup = draftToSetup({
    ...EMPTY_DRAFT,
    path: "program",
    programId: "google-apm",
    level: "fresher",
    length: "quick",
    resumeText: withResume ? "Worked on checkout redesign.\nDid user interviews." : "",
  })!
  const id = store.createSession(setup, {
    targetLabel: "Google APM",
    greeting: "Welcome!",
    questions: evaluateRequest.turns.map((turn) => ({
      category: turn.category,
      question: turn.question,
      hint: "A gentle hint.",
    })),
  })
  evaluateRequest.turns.forEach((turn, index) => {
    if (turn.answer === null) store.skipQuestion(id, index)
    else store.recordAnswer(id, index, turn.answer, { followUp: null, encouragement: "Nice." })
    store.advance(id)
  })
  return id
}

describe("ResultsView", () => {
  beforeEach(async () => {
    await useInterviewStore.persist.rehydrate()
    await useProgressStore.persist.rehydrate()
    useInterviewStore.setState({ sessions: {} })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("evaluates a finished interview, awards XP once and shows every section", async () => {
    const fetchMock = mockApi({ "/api/interview/evaluate": evaluation })
    const id = createFinishedSession(false)
    render(<ResultsView id={id} />)

    expect(await screen.findByRole("img", { name: "Overall score 73 out of 100" })).toBeVisible()
    expect(screen.getByText(evaluationAi.summary)).toBeInTheDocument()
    expect(screen.getByText(`+${XP_REWARDS.interviewCompleted} XP earned`)).toBeInTheDocument()

    const praise = screen.getByRole("region", { name: "What you did great" })
    expect(within(praise).getByText("“focus on first-time visitors”")).toBeInTheDocument()

    const review = screen.getByRole("region", { name: "Question-by-question review" })
    expect(within(review).getByText("Strong")).toBeInTheDocument()
    expect(within(review).getAllByText("Skipped").length).toBeGreaterThan(0)

    expect(screen.getByRole("region", { name: "Practice more" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Resume makeover" })).toHaveTextContent(
      "Add your resume next time"
    )

    // The interview is now in the progress history, and level 12 is complete.
    const progress = useProgressStore.getState()
    expect(progress.interviews.map((interview) => interview.id)).toEqual([id])
    expect(progress.completedTopicIds).toContain("mock-interviews")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("lets you practise a weak-area question for +20 XP", async () => {
    const user = userEvent.setup()
    mockApi({
      "/api/interview/evaluate": evaluation,
      "/api/practice/evaluate": {
        score: 85,
        verdict: "strong",
        whatWasGood: ["Clear North Star"],
        whatWasMissing: [],
        modelAnswer: { framework: "North Star", answer: "Start from the goal of the product." },
        encouragement: "You're getting the hang of this!",
      },
    })
    const id = createFinishedSession(false)
    render(<ResultsView id={id} />)

    const xpBefore = (await screen.findByText(/XP earned/)) && useProgressStore.getState().xp
    await user.click(screen.getAllByRole("button", { name: /^Practise:/ })[0]!)
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Your answer"), "Daily active comments.")
    await user.click(within(dialog).getByRole("button", { name: "Get feedback" }))

    expect(await within(dialog).findByText("You're getting the hang of this!")).toBeVisible()
    expect(useProgressStore.getState().xp).toBe(xpBefore + XP_REWARDS.practiceQuestion)
  })

  it("adds a resume makeover when a resume was provided", async () => {
    mockApi({ "/api/interview/evaluate": evaluation, "/api/resume/feedback": resumeFeedback })
    const id = createFinishedSession(true)
    render(<ResultsView id={id} />)

    const makeover = await screen.findByRole("region", { name: "Resume makeover" })
    expect(
      await within(makeover).findByText("Clear ownership of a checkout redesign.")
    ).toBeVisible()
    expect(
      within(makeover).getByText("Led a checkout redesign that lifted conversion by [X%].")
    ).toBeVisible()
    expect(within(makeover).getAllByRole("listitem").length).toBeGreaterThan(3)
  })
})

describe("result helpers", () => {
  beforeEach(async () => {
    await useInterviewStore.persist.rehydrate()
    await useProgressStore.persist.rehydrate()
    useInterviewStore.setState({ sessions: {} })
  })

  it("sends skipped questions as null answers", () => {
    const id = createFinishedSession(false)
    const request = buildEvaluateRequest(useInterviewStore.getState().sessions[id]!)
    expect(request.turns.map((turn) => turn.answer === null)).toEqual([false, true, false])
    expect(request.context).toContain("Google")
  })

  it("awards XP and badges only once per interview", () => {
    const id = createFinishedSession(false)
    const session = useInterviewStore.getState().sessions[id]!
    const first = awardInterviewRewards(session, evaluation)
    const second = awardInterviewRewards(session, evaluation)

    expect(first.xpEarned).toBe(XP_REWARDS.interviewCompleted)
    expect(first.badgeIds).toContain("first-interview")
    expect(second.badgeIds).toEqual([])
    expect(useProgressStore.getState().interviews).toHaveLength(1)
  })

  it("awards nothing when every question was skipped", () => {
    const id = createFinishedSession(false)
    const session = useInterviewStore.getState().sessions[id]!
    expect(awardInterviewRewards(session, { ...evaluation, overallScore: null })).toEqual({
      xpEarned: 0,
      badgeIds: [],
    })
  })
})
