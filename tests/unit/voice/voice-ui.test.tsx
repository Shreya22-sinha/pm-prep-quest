import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { InterviewSession } from "@/components/interview/interview-session"
import { VoiceAnswerForm } from "@/components/interview/voice-answer-form"
import { ModeStep } from "@/components/interview/wizard-steps"
import { draftToSetup, EMPTY_DRAFT } from "@/lib/interview/wizard"
import { useInterviewStore } from "@/store/interview-store"
import { useProgressStore } from "@/store/progress-store"

import { FakeRecognition, installFakeSpeech, uninstallFakeSpeech } from "./fake-speech"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))

afterEach(() => {
  uninstallFakeSpeech()
})

describe("VoiceAnswerForm", () => {
  it("transcribes live, lets you edit, then submits", async () => {
    installFakeSpeech()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onListenStart = vi.fn()
    render(
      <VoiceAnswerForm
        label="Your answer"
        submitLabel="Submit answer"
        pending={false}
        onSubmit={onSubmit}
        onListenStart={onListenStart}
      />
    )

    expect(screen.getByText("Tap to start answering")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Start recording your answer" }))
    expect(onListenStart).toHaveBeenCalled()
    expect(screen.getByText("Listening… tap to stop")).toBeInTheDocument()

    act(() =>
      FakeRecognition.latest().hear(
        { text: "I would focus on", final: true },
        { text: "tourists", final: false }
      )
    )
    const transcript = screen.getByLabelText("Your answer")
    expect(transcript).toHaveValue("I would focus on tourists")
    expect(transcript).toHaveAttribute("readonly")
    expect(screen.getByRole("button", { name: "Submit answer" })).toBeDisabled()

    await user.click(screen.getByRole("button", { name: "Stop recording" }))
    expect(screen.getByText("Tap to add more")).toBeInTheDocument()
    expect(transcript).not.toHaveAttribute("readonly")

    await user.type(transcript, " visiting for a weekend")
    await user.click(screen.getByRole("button", { name: "Submit answer" }))
    expect(onSubmit).toHaveBeenCalledWith("I would focus on tourists visiting for a weekend")
  })

  it("adds a second recording after the first", async () => {
    installFakeSpeech()
    const user = userEvent.setup()
    render(
      <VoiceAnswerForm
        label="Your answer"
        submitLabel="Submit"
        pending={false}
        onSubmit={vi.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: "Start recording your answer" }))
    act(() => FakeRecognition.latest().hear({ text: "First part.", final: true }))
    await user.click(screen.getByRole("button", { name: "Stop recording" }))

    await user.click(screen.getByRole("button", { name: "Start recording your answer" }))
    act(() => FakeRecognition.latest().hear({ text: "Second part.", final: true }))
    // Browsers end sessions on their own after a pause; the words are kept.
    act(() => FakeRecognition.latest().stop())

    expect(screen.getByLabelText("Your answer")).toHaveValue("First part. Second part.")
  })

  it("explains a blocked microphone and still lets you type", async () => {
    installFakeSpeech()
    const user = userEvent.setup()
    render(
      <VoiceAnswerForm
        label="Your answer"
        submitLabel="Submit"
        pending={false}
        onSubmit={vi.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: "Start recording your answer" }))
    act(() => FakeRecognition.latest().fail("not-allowed"))

    expect(screen.getByRole("alert")).toHaveTextContent("Microphone access is blocked")
    await user.type(screen.getByLabelText("Your answer"), "Typed instead")
    expect(screen.getByLabelText("Your answer")).toHaveValue("Typed instead")
  })
})

function createVoiceSession() {
  const setup = draftToSetup({
    ...EMPTY_DRAFT,
    path: "program",
    programId: "google-apm",
    level: "fresher",
    mode: "voice",
    length: "quick",
  })!
  return useInterviewStore.getState().createSession(setup, {
    targetLabel: "Google APM",
    greeting: "Welcome!",
    questions: [
      {
        category: "metrics",
        question: "How would you measure the success of Google Maps?",
        hint: "Start with the goal.",
      },
    ],
  })
}

describe("voice interview", () => {
  beforeEach(async () => {
    await useInterviewStore.persist.rehydrate()
    await useProgressStore.persist.rehydrate()
    useInterviewStore.setState({ sessions: {} })
  })

  it("reads the greeting and question aloud and takes spoken answers", async () => {
    const synthesis = installFakeSpeech()
    const user = userEvent.setup()
    render(<InterviewSession id={createVoiceSession()} />)

    expect(synthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "Welcome! How would you measure the success of Google Maps?",
      })
    )
    expect(screen.getByRole("button", { name: "Start recording your answer" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Replay" }))
    expect(synthesis.speak).toHaveBeenCalledTimes(2)

    await user.click(screen.getByRole("button", { name: "Mute interviewer" }))
    expect(synthesis.cancel).toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Unmute interviewer" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })

  it("falls back to typing where speech recognition isn't supported", async () => {
    installFakeSpeech({ recognition: false })
    const user = userEvent.setup()
    const id = createVoiceSession()
    render(<InterviewSession id={id} />)

    expect(screen.getByText("Voice answers aren't available in this browser.")).toBeInTheDocument()
    expect(screen.getByLabelText("Your answer")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /recording/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Switch to written mode" }))
    expect(useInterviewStore.getState().sessions[id]?.setup.mode).toBe("written")
    expect(screen.queryByText(/aren't available in this browser/)).not.toBeInTheDocument()
  })
})

describe("wizard voice option", () => {
  const props = { draft: EMPTY_DRAFT, errors: {}, update: vi.fn() }

  it("is available where speech recognition is supported", () => {
    render(<ModeStep {...props} voiceSupported />)
    expect(screen.getByRole("radio", { name: /Voice/ })).toBeEnabled()
  })

  it("explains when this browser can't do voice", () => {
    render(<ModeStep {...props} voiceSupported={false} />)
    expect(screen.getByRole("radio", { name: /Voice/ })).toBeDisabled()
    expect(screen.getByText("Not available in this browser")).toBeInTheDocument()
    expect(screen.getByText(/Try Chrome, Edge or Safari/)).toBeInTheDocument()
  })
})
