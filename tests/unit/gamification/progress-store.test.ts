import { beforeEach, describe, expect, it } from "vitest"

import { XP_REWARDS } from "@/config/gamification"
import { STORAGE_KEYS } from "@/lib/storage"
import { useProgressStore, type NewInterview } from "@/store/progress-store"

const store = () => useProgressStore.getState()

const interview: NewInterview = {
  targetLabel: "Google APM",
  path: "program",
  level: "fresher",
  mode: "written",
  questionCount: 5,
  overallScore: 72,
}

describe("progress store", () => {
  beforeEach(async () => {
    await useProgressStore.persist.rehydrate()
  })

  it("completes a topic once, with XP and a toast", () => {
    expect(store().completeTopic("fundamentals")).toBe(true)
    expect(store().completeTopic("fundamentals")).toBe(false)

    expect(store().xp).toBe(XP_REWARDS.topicCompleted)
    expect(store().completedTopicIds).toEqual(["fundamentals"])
    expect(store().toastEvents.some((event) => event.type === "xp")).toBe(true)
  })

  it("adds the high-score bonus to interview XP", () => {
    const normal = store().recordInterview(interview)
    const great = store().recordInterview({ ...interview, overallScore: 90 })

    expect(normal.xpEarned).toBe(XP_REWARDS.interviewCompleted)
    expect(great.xpEarned).toBe(XP_REWARDS.interviewCompleted + XP_REWARDS.interviewHighScoreBonus)
    expect(store().interviews.map((item) => item.id)).toEqual([great.id, normal.id])
    expect(store().unlockedBadges["high-flyer"]).toBeDefined()
  })

  it("queues a level-up separately from toasts", () => {
    store().recordInterview({ ...interview, overallScore: 90 })
    expect(store().pendingLevelUp).toBe(2)
    expect(store().toastEvents.some((event) => (event.type as string) === "level-up")).toBe(false)

    store().clearLevelUp()
    expect(store().pendingLevelUp).toBeNull()
  })

  it("saves progress to storage and restores it", async () => {
    store().completeTopic("rca")
    const savedJson = localStorage.getItem(STORAGE_KEYS.progress) ?? "{}"
    const saved = JSON.parse(savedJson)
    expect(saved.state.completedTopicIds).toEqual(["rca"])
    expect(saved.state.toastEvents).toBeUndefined()

    // Simulate a fresh page load: empty memory, saved copy still on disk.
    useProgressStore.setState({ xp: 0, completedTopicIds: [] })
    localStorage.setItem(STORAGE_KEYS.progress, savedJson)
    await useProgressStore.persist.rehydrate()
    expect(store().completedTopicIds).toEqual(["rca"])
    expect(store().xp).toBe(XP_REWARDS.topicCompleted)
  })

  it("starts fresh instead of crashing on a corrupted save", async () => {
    localStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({ state: { xp: "lots", interviews: "nope" }, version: 1 })
    )
    await useProgressStore.persist.rehydrate()
    expect(store().xp).toBe(0)
    expect(store().interviews).toEqual([])
  })

  it("drops unknown topic ids from old saves", async () => {
    localStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({
        state: {
          xp: 50,
          completedTopicIds: ["metrics", "retired-topic"],
          unlockedBadges: {},
          streak: { current: 0, longest: 0, lastActiveDate: null },
          interviews: [],
        },
        version: 1,
      })
    )
    await useProgressStore.persist.rehydrate()
    expect(store().completedTopicIds).toEqual(["metrics"])
  })

  it("resets everything", () => {
    store().completeTopic("fundamentals")
    store().resetProgress()
    expect(store().xp).toBe(0)
    expect(store().completedTopicIds).toEqual([])
    expect(store().unlockedBadges).toEqual({})
  })
})
