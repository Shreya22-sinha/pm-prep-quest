import { act, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { ProgressDashboard } from "@/components/progress/progress-dashboard"
import { BADGES } from "@/config/gamification"
import { useProgressStore } from "@/store/progress-store"

describe("ProgressDashboard", () => {
  beforeEach(async () => {
    await useProgressStore.persist.rehydrate()
  })

  it("welcomes a brand-new user with empty states", () => {
    render(<ProgressDashboard />)

    expect(screen.getByText("Your adventure starts now")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Curious Explorer" })).toBeInTheDocument()
    expect(screen.getByText("No interviews yet")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Enter the Interview Arena" })).toHaveAttribute(
      "href",
      "/interview"
    )
    expect(screen.getByText(`0 of ${BADGES.length} unlocked`)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Start over" })).not.toBeInTheDocument()
  })

  it("shows earned progress", () => {
    act(() => {
      const store = useProgressStore.getState()
      store.completeTopic("fundamentals")
      store.completeTopic("metrics")
      store.recordInterview({
        targetLabel: "Senior PM at Acme",
        path: "job",
        level: "experienced",
        mode: "written",
        questionCount: 8,
        overallScore: 64,
      })
    })
    render(<ProgressDashboard />)

    expect(screen.queryByText("Your adventure starts now")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Aspiring PM" })).toBeInTheDocument()
    // Two lessons plus Mock Interviews, which the recorded interview completes.
    expect(screen.getByText("3 of 12 complete. Great pace!")).toBeInTheDocument()

    const history = screen.getByRole("region", { name: "Interview history" })
    expect(within(history).getByText("Senior PM at Acme")).toBeInTheDocument()
    expect(within(history).getByText("Score 64 out of 100")).toBeInTheDocument()

    const badges = screen.getByRole("region", { name: "Badges" })
    expect(within(badges).getByText("Metrics Master").closest("li")).toHaveTextContent(/Earned/)
    expect(within(badges).getByText("RCA Detective").closest("li")).toHaveTextContent("Locked")

    expect(screen.getByRole("button", { name: "Start over" })).toBeInTheDocument()
  })
})
