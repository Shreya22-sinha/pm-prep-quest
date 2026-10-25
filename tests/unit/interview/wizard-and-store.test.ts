import { beforeEach, describe, expect, it } from "vitest"

import { SKIP_MESSAGE } from "@/config/interview"
import type { StartResponse } from "@/lib/interview/schema"
import {
  CUSTOM_PROGRAM_ID,
  draftToSetup,
  EMPTY_DRAFT,
  validateStep,
  type WizardDraft,
} from "@/lib/interview/wizard"
import { STORAGE_KEYS } from "@/lib/storage"
import { useInterviewStore } from "@/store/interview-store"

const jobDraft: WizardDraft = {
  ...EMPTY_DRAFT,
  path: "job",
  jobDescription: "Product Manager, Growth. ".repeat(5),
  level: "intermediate",
}

describe("wizard validation", () => {
  it("asks for a path first", () => {
    expect(validateStep(0, EMPTY_DRAFT).path).toBeDefined()
  })

  it("needs a real job description for the job path", () => {
    expect(validateStep(0, { ...jobDraft, jobDescription: "PM role" }).jobDescription).toMatch(
      /at least 80/
    )
    expect(validateStep(0, jobDraft)).toEqual({})
  })

  it("needs a program, and a name for a custom one", () => {
    const programDraft: WizardDraft = { ...EMPTY_DRAFT, path: "program" }
    expect(validateStep(0, programDraft).programId).toBeDefined()
    expect(
      validateStep(0, { ...programDraft, programId: CUSTOM_PROGRAM_ID }).customProgram
    ).toBeDefined()
    expect(
      validateStep(0, { ...programDraft, programId: CUSTOM_PROGRAM_ID, customProgram: "Adobe APM" })
    ).toEqual({})
  })

  it("requires a level, and voice only where the browser supports it", () => {
    expect(validateStep(1, EMPTY_DRAFT).level).toBeDefined()
    const voiceDraft: WizardDraft = { ...jobDraft, mode: "voice" }
    expect(validateStep(2, voiceDraft, { voiceSupported: false }).mode).toMatch(/aren't available/)
    expect(validateStep(2, voiceDraft, { voiceSupported: true })).toEqual({})
    expect(draftToSetup(voiceDraft)?.mode).toBe("voice")
  })

  it("builds a validated setup from a complete draft", () => {
    expect(draftToSetup(jobDraft)).toMatchObject({
      path: "job",
      program: null,
      resumeText: null,
      level: "intermediate",
      length: "standard",
    })
    expect(
      draftToSetup({ ...EMPTY_DRAFT, path: "program", programId: "meta-rpm", level: "fresher" })
        ?.program
    ).toEqual({ id: "meta-rpm", name: "Meta Rotational Product Manager (RPM)" })
    expect(draftToSetup(EMPTY_DRAFT)).toBeNull()
  })
})

const plan: StartResponse = {
  targetLabel: "Growth PM at Acme",
  greeting: "Welcome! Let's have a relaxed chat.",
  questions: [
    { category: "growth", question: "How would you grow weekly users?", hint: "Use AARRR." },
    { category: "behavioral", question: "Tell me about a conflict.", hint: "Use STAR." },
  ],
}

describe("interview store", () => {
  beforeEach(async () => {
    await useInterviewStore.persist.rehydrate()
    useInterviewStore.setState({ sessions: {} })
  })

  const store = () => useInterviewStore.getState()

  it("runs a whole interview: follow-up, skip, completion", () => {
    const setup = draftToSetup(jobDraft)!
    const id = store().createSession(setup, plan)

    store().markHintUsed(id, 0)
    store().recordAnswer(id, 0, "Focus on activation.", {
      followUp: "Which stage is weakest?",
      encouragement: "Nice.",
    })
    let session = store().sessions[id]!
    expect(session.turns[0]).toMatchObject({ status: "follow-up", hintUsed: true })

    store().recordFollowUp(id, 0, "Retention after week one.", "Great detail!")
    session = store().sessions[id]!
    expect(session.turns[0]).toMatchObject({ status: "done", encouragement: "Great detail!" })
    expect(session.turns[0]!.followUp).toMatchObject({ answer: "Retention after week one." })

    store().advance(id)
    store().skipQuestion(id, 1)
    expect(store().sessions[id]!.turns[1]).toMatchObject({
      skipped: true,
      encouragement: SKIP_MESSAGE,
    })

    store().advance(id)
    expect(store().sessions[id]!.completedAt).not.toBeNull()
  })

  it("keeps valid saved sessions and drops broken ones", async () => {
    const id = store().createSession(draftToSetup(jobDraft)!, plan)
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.interviews)!)
    saved.state.sessions.broken = { id: "broken", turns: "nope" }
    localStorage.setItem(STORAGE_KEYS.interviews, JSON.stringify(saved))

    useInterviewStore.setState({ sessions: {} })
    localStorage.setItem(STORAGE_KEYS.interviews, JSON.stringify(saved))
    await useInterviewStore.persist.rehydrate()

    expect(Object.keys(store().sessions)).toEqual([id])
  })
})
