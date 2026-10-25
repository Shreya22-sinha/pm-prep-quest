import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { CompleteTopicCard } from "@/components/roadmap/complete-topic-card"
import { RoadmapMap } from "@/components/roadmap/roadmap-map"
import { RoadmapProgress } from "@/components/roadmap/roadmap-progress"
import { XP_REWARDS } from "@/config/gamification"
import { getTopic } from "@/content/topics"
import { useProgressStore } from "@/store/progress-store"

describe("roadmap UI", () => {
  beforeEach(async () => {
    await useProgressStore.persist.rehydrate()
  })

  it("draws all twelve levels with the first one up next", () => {
    render(<RoadmapMap />)
    const map = screen.getByRole("list", { name: "Roadmap levels" })
    const links = within(map).getAllByRole("link")

    expect(links).toHaveLength(12)
    expect(links[0]).toHaveAccessibleName("Level 1: PM Fundamentals, Up next")
    expect(links[0]).toHaveAttribute("href", "/roadmap/fundamentals")
    expect(links[1]).toHaveAccessibleName("Level 2: Product Design & Product Sense, Not started")
    expect(links[11]).toHaveAttribute("href", "/interview")
  })

  it("moves 'up next' forward as levels are completed", () => {
    act(() => {
      useProgressStore.getState().completeTopic("fundamentals")
    })
    render(<RoadmapMap />)
    render(<RoadmapProgress />)

    expect(screen.getByRole("link", { name: "Level 1: PM Fundamentals, Complete" })).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Level 2: Product Design & Product Sense, Up next" })
    ).toBeVisible()
    expect(screen.getByText("1 of 12 levels complete — great start!")).toBeInTheDocument()
  })

  it("marks a level complete once, awarding XP", async () => {
    const user = userEvent.setup()
    render(
      <CompleteTopicCard topicId="rca" estimatedMinutes={30} nextTopic={getTopic("guesstimates")} />
    )

    await user.click(
      screen.getByRole("button", { name: `Mark as complete · +${XP_REWARDS.topicCompleted} XP` })
    )

    expect(screen.getByText("Level complete. Nice work!")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Mark as complete/ })).not.toBeInTheDocument()
    expect(useProgressStore.getState().xp).toBe(XP_REWARDS.topicCompleted)
    expect(screen.getByRole("link", { name: "Next: Guesstimates" })).toHaveAttribute(
      "href",
      "/roadmap/guesstimates"
    )
  })

  it("completes the Mock Interviews level when an interview is finished", () => {
    act(() => {
      useProgressStore.getState().recordInterview({
        targetLabel: "Google APM",
        path: "program",
        level: "fresher",
        mode: "written",
        questionCount: 3,
        overallScore: 70,
      })
    })
    expect(useProgressStore.getState().completedTopicIds).toContain("mock-interviews")
  })
})
