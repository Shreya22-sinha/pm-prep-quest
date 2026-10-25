import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ProgramPlan } from "@/components/programs/program-plan"
import { ProgramTracks } from "@/components/progress/program-tracks"
import { draftToSetup, EMPTY_DRAFT, type WizardDraft } from "@/lib/interview/wizard"
import { useInterviewStore } from "@/store/interview-store"
import { useProgressStore } from "@/store/progress-store"

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => router }))

function createSession(draft: Partial<WizardDraft>) {
  const setup = draftToSetup({ ...EMPTY_DRAFT, level: "fresher", length: "quick", ...draft })!
  const id = useInterviewStore.getState().createSession(setup, {
    targetLabel: "Google APM",
    greeting: "Hi!",
    questions: [{ category: "metrics", question: "How would you measure Maps?", hint: "Goal." }],
  })
  return useInterviewStore.getState().sessions[id]!
}

describe("ProgramPlan", () => {
  beforeEach(async () => {
    await useProgressStore.persist.rehydrate()
    await useInterviewStore.persist.rehydrate()
    useInterviewStore.setState({ sessions: {} })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("is only shown for program interviews", () => {
    const session = createSession({
      path: "job",
      jobDescription: "Product Manager, Growth. ".repeat(5),
    })
    const { container } = render(<ProgramPlan session={session} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the plan with the first mock open and the rest locked", () => {
    const session = createSession({ path: "program", programId: "google-apm" })
    render(<ProgramPlan session={session} />)

    expect(
      screen.getByRole("heading", { name: "Your Google Associate Product Manager (APM) prep plan" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Official careers page/ })).toHaveAttribute(
      "href",
      "https://www.google.com/about/careers/applications/"
    )

    const track = screen.getByRole("region", { name: "Program track" })
    expect(within(track).getByText("0 of 4 mock interviews complete")).toBeInTheDocument()
    expect(
      within(track).getByRole("button", { name: "Start mock: Product sense warm-up" })
    ).toBeEnabled()
    expect(within(track).getByText("Complete “Product sense warm-up” to unlock")).toBeVisible()
    expect(within(track).queryByRole("button", { name: /Analytical thinking/ })).toBeNull()
  })

  it("unlocks the next mock as the track progresses", () => {
    const session = createSession({ path: "program", programId: "google-apm" })
    render(<ProgramPlan session={session} />)

    act(() => {
      useProgressStore
        .getState()
        .completeProgramMock(
          { key: "google-apm", name: "Google APM" },
          { id: "product-sense", title: "Product sense warm-up" },
          session.id
        )
    })

    expect(screen.getByText("1 of 4 mock interviews complete")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Practise again: Product sense warm-up" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Start mock: Analytical thinking" })).toBeEnabled()
  })

  it("starts a mock with the same setup, its theme and its length", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          targetLabel: "Google APM · Product sense warm-up",
          greeting: "Hi!",
          questions: [
            { category: "product-design", question: "Improve Google Maps.", hint: "Segment." },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    )
    const session = createSession({ path: "program", programId: "google-apm", length: "full" })
    render(<ProgramPlan session={session} />)

    await user.click(screen.getByRole("button", { name: "Start mock: Product sense warm-up" }))

    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))
    expect(body).toMatchObject({
      path: "program",
      program: { id: "google-apm" },
      programMockId: "product-sense",
      length: "quick",
      level: "fresher",
    })
    expect(router.push).toHaveBeenCalledWith(expect.stringMatching(/^\/interview\/session\//))
  })
})

describe("ProgramTracks on My Progress", () => {
  it("lists tracks with progress and a way to continue", () => {
    render(
      <ProgramTracks
        tracks={{
          "meta-rpm": {
            name: "Meta RPM",
            completedMockIds: ["product-sense"],
            lastSessionId: "abc",
          },
        }}
      />
    )
    expect(screen.getByText("Meta Rotational Product Manager (RPM)")).toBeInTheDocument()
    expect(screen.getByText("1 of 4 mock interviews complete")).toBeInTheDocument()
    expect(screen.getByText("Up next: Execution & metrics")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Continue track" })).toHaveAttribute(
      "href",
      "/interview/results/abc#program"
    )
  })

  it("is hidden until a track exists", () => {
    const { container } = render(<ProgramTracks tracks={{}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
