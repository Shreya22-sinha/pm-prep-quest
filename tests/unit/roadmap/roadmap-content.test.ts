import { describe, expect, it } from "vitest"

import { getResourcesForTags, RESOURCES } from "@/content/resources"
import { TOPIC_LESSONS } from "@/content/topic-lessons"
import { ARENA_TOPIC_ID, getTopicHref, ROADMAP_TOPICS } from "@/content/topics"
import { getRoadmapProgressMessage, getTopicStatuses } from "@/lib/roadmap"

const lessonTopics = ROADMAP_TOPICS.filter((topic) => topic.id !== ARENA_TOPIC_ID)

describe("roadmap topics", () => {
  it("follows the spec's twelve levels in order", () => {
    expect(ROADMAP_TOPICS.map((topic) => topic.id)).toEqual([
      "fundamentals",
      "product-sense",
      "metrics",
      "rca",
      "guesstimates",
      "strategy",
      "growth",
      "gtm",
      "analytics",
      "technical",
      "behavioral",
      "mock-interviews",
    ])
  })

  it("sends the final level to the Interview Arena", () => {
    expect(getTopicHref("mock-interviews")).toBe("/interview")
    expect(getTopicHref("metrics")).toBe("/roadmap/metrics")
  })
})

describe("lessons", () => {
  it("exist for every level except Mock Interviews", () => {
    expect(Object.keys(TOPIC_LESSONS).sort()).toEqual(lessonTopics.map((t) => t.id).sort())
  })

  it.each(lessonTopics)("$title has a complete lesson", (topic) => {
    const lesson = TOPIC_LESSONS[topic.id as keyof typeof TOPIC_LESSONS]
    expect(lesson.summary.length).toBeGreaterThan(40)
    expect(lesson.whyAsked.length).toBeGreaterThan(40)
    expect(lesson.framework.steps.length).toBeGreaterThanOrEqual(3)
    expect(lesson.sampleQuestion.approach.length).toBeGreaterThanOrEqual(3)
  })

  it("uses the frameworks the spec names", () => {
    expect(TOPIC_LESSONS["product-sense"].framework.name).toBe("CIRCLES")
    expect(TOPIC_LESSONS.growth.framework.name).toMatch(/AARRR/)
  })
})

describe("resources", () => {
  it("have unique ids and secure official URLs", () => {
    expect(new Set(RESOURCES.map((resource) => resource.id)).size).toBe(RESOURCES.length)
    for (const resource of RESOURCES) {
      const url = new URL(resource.url)
      expect(url.protocol).toBe("https:")
      // Homepages only: no invented deep links to specific articles.
      expect(url.pathname === "/" || url.pathname === "").toBe(true)
    }
  })

  it.each(lessonTopics)("offer at least two resources for $title", (topic) => {
    expect(getResourcesForTags([topic.id]).length).toBeGreaterThanOrEqual(2)
  })

  it("ranks resources by how many tags they match", () => {
    const results = getResourcesForTags(["metrics", "analytics", "growth"])
    expect(results[0]?.id).toBe("lean-analytics")
  })
})

describe("roadmap status", () => {
  it("marks the first unfinished level as current", () => {
    const statuses = getTopicStatuses(["fundamentals", "metrics"])
    expect(statuses.fundamentals).toBe("complete")
    expect(statuses["product-sense"]).toBe("current")
    expect(statuses.metrics).toBe("complete")
    expect(statuses.rca).toBe("upcoming")
  })

  it("matches the spec's progress message", () => {
    expect(getRoadmapProgressMessage(3, 12)).toBe("3 of 12 levels complete — great pace!")
    expect(getRoadmapProgressMessage(0, 12)).toMatch(/starts here/)
    expect(getRoadmapProgressMessage(12, 12)).toMatch(/conquered/)
  })
})
