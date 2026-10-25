import { beforeEach, describe, expect, it } from "vitest"

import { XP_REWARDS } from "@/config/gamification"
import { INTERVIEW_CATEGORIES, INTERVIEW_LENGTHS } from "@/config/interview"
import { GENERIC_PROGRAM_MOCKS, PM_PROGRAMS } from "@/content/programs"
import { buildInterviewStartPrompt } from "@/lib/ai/prompts/interview-start"
import { buildEvaluation } from "@/lib/interview/evaluation"
import { awardInterviewRewards } from "@/lib/interview/results"
import { draftToSetup, EMPTY_DRAFT } from "@/lib/interview/wizard"
import {
  getMockStatuses,
  getProgramTrack,
  getTrackByKey,
  recommendedTopicsFor,
  trackKeyFor,
} from "@/lib/programs/track"
import { STORAGE_KEYS } from "@/lib/storage"
import { useInterviewStore } from "@/store/interview-store"
import { useProgressStore } from "@/store/progress-store"

import { evaluateRequest, evaluationAi } from "../results/fixtures"

describe("program content", () => {
  it.each([...PM_PROGRAMS, { id: "generic", mocks: GENERIC_PROGRAM_MOCKS }])(
    "$id has four valid mocks ending in a full loop",
    (program) => {
      expect(program.mocks).toHaveLength(4)
      expect(new Set(program.mocks.map((mock) => mock.id)).size).toBe(4)
      expect(program.mocks.at(-1)?.length).toBe("full")
      for (const mock of program.mocks) {
        expect(INTERVIEW_LENGTHS).toContain(mock.length)
        for (const category of mock.focusCategories) {
          expect(INTERVIEW_CATEGORIES).toContain(category)
        }
      }
    }
  )
})

describe("program tracks", () => {
  it("keys listed programs by id and typed-in ones by name", () => {
    expect(trackKeyFor({ id: "meta-rpm", name: "Meta RPM" })).toBe("meta-rpm")
    expect(trackKeyFor({ id: null, name: "Adobe Product Manager (APM)!" })).toBe(
      "custom:adobe-product-manager-apm"
    )
  })

  it("gives typed-in programs the general track", () => {
    const track = getProgramTrack({ id: null, name: "Adobe APM" })
    expect(track.name).toBe("Adobe APM")
    expect(track.mocks).toBe(GENERIC_PROGRAM_MOCKS)
    expect(track.careersUrl).toBeNull()
    expect(getTrackByKey(track.key, "Adobe APM").mocks).toBe(GENERIC_PROGRAM_MOCKS)
  })

  it("recommends fundamentals first, then each mock's levels once", () => {
    const topics = recommendedTopicsFor(getProgramTrack({ id: "google-apm", name: "" }).mocks)
    expect(topics[0]).toBe("fundamentals")
    expect(topics).toContain("product-sense")
    expect(topics).toContain("technical")
    expect(new Set(topics).size).toBe(topics.length)
  })

  it("unlocks mocks one at a time", () => {
    const mocks = GENERIC_PROGRAM_MOCKS
    expect(getMockStatuses(mocks, [])).toEqual(["available", "locked", "locked", "locked"])
    expect(getMockStatuses(mocks, ["product-sense"])).toEqual([
      "complete",
      "available",
      "locked",
      "locked",
    ])
  })

  it("adds the mock's theme to the interview prompt", () => {
    const setup = draftToSetup({
      ...EMPTY_DRAFT,
      path: "program",
      programId: "uber-apm",
      level: "fresher",
    })!
    const { user } = buildInterviewStartPrompt({ ...setup, programMockId: "marketplace" })
    expect(user).toContain('"Marketplace & metrics"')
    expect(user).toContain("metrics, analytics, strategy")
    expect(buildInterviewStartPrompt(setup).user).not.toContain("themed practice round")
  })
})

describe("program rewards", () => {
  beforeEach(async () => {
    await useProgressStore.persist.rehydrate()
    await useInterviewStore.persist.rehydrate()
    useInterviewStore.setState({ sessions: {} })
  })

  const progress = () => useProgressStore.getState()

  it("awards the mock bonus once", () => {
    const track = { key: "google-apm", name: "Google APM" }
    const mock = { id: "product-sense", title: "Product sense warm-up" }
    expect(progress().completeProgramMock(track, mock, "s1")).toBe(true)
    expect(progress().completeProgramMock(track, mock, "s2")).toBe(false)
    expect(progress().xp).toBe(XP_REWARDS.programMockCompleted)
    expect(progress().programTracks["google-apm"]).toEqual({
      name: "Google APM",
      completedMockIds: ["product-sense"],
      lastSessionId: "s1",
    })
  })

  it("unlocks the track badge when every mock is done", () => {
    const google = PM_PROGRAMS.find((program) => program.id === "google-apm")!
    for (const mock of google.mocks) {
      progress().completeProgramMock({ key: google.id, name: "Google APM" }, mock, "s")
    }
    expect(progress().unlockedBadges["program-google-apm"]).toBeDefined()
    expect(progress().unlockedBadges["program-meta-rpm"]).toBeUndefined()

    for (const mock of GENERIC_PROGRAM_MOCKS) {
      progress().completeProgramMock({ key: "custom:adobe-apm", name: "Adobe APM" }, mock, "s")
    }
    expect(progress().unlockedBadges["program-custom"]).toBeDefined()
  })

  it("records a program mock interview with its bonus and continues the track", () => {
    const setup = draftToSetup({
      ...EMPTY_DRAFT,
      path: "program",
      programId: "google-apm",
      level: "fresher",
    })!
    const id = useInterviewStore.getState().createSession(
      { ...setup, programMockId: "product-sense" },
      {
        targetLabel: "Google APM · Product sense warm-up",
        greeting: "Hi!",
        questions: evaluateRequest.turns.map((turn) => ({
          category: turn.category,
          question: turn.question,
          hint: "A hint.",
        })),
      }
    )
    const session = useInterviewStore.getState().sessions[id]!
    const rewards = awardInterviewRewards(session, buildEvaluation(evaluateRequest, evaluationAi))

    expect(rewards.xpEarned).toBe(XP_REWARDS.interviewCompleted + XP_REWARDS.programMockCompleted)
    expect(progress().programTracks["google-apm"]).toMatchObject({
      completedMockIds: ["product-sense"],
      lastSessionId: id,
    })
  })

  it("loads saves from before program tracks existed", async () => {
    localStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({
        state: {
          xp: 40,
          completedTopicIds: [],
          unlockedBadges: {},
          streak: { current: 0, longest: 0, lastActiveDate: null },
          interviews: [],
        },
        version: 1,
      })
    )
    await useProgressStore.persist.rehydrate()
    expect(progress().xp).toBe(40)
    expect(progress().programTracks).toEqual({})
  })
})
