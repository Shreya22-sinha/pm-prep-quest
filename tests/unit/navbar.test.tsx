import { act, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Navbar } from "@/components/layout/navbar"
import { useProgressStore } from "@/store/progress-store"

vi.mock("next/navigation", () => ({
  usePathname: () => "/roadmap",
}))

describe("Navbar", () => {
  beforeEach(async () => {
    await useProgressStore.persist.rehydrate()
  })

  it("shows every main navigation link", () => {
    render(<Navbar />)
    const nav = screen.getByRole("navigation", { name: "Main" })

    for (const label of ["Home", "Roadmap", "Interview Arena", "My Progress"]) {
      expect(within(nav).getByRole("link", { name: label })).toBeInTheDocument()
    }
  })

  it("marks the current page", () => {
    render(<Navbar />)
    const nav = screen.getByRole("navigation", { name: "Main" })

    expect(within(nav).getByRole("link", { name: "Roadmap" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(within(nav).getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current")
  })

  it("shows the theme toggle", () => {
    render(<Navbar />)
    expect(screen.getByRole("button", { name: "Change theme" })).toBeInTheDocument()
  })

  it("shows live level and XP in the XP pill", () => {
    render(<Navbar />)
    expect(
      // Whitespace-tolerant: jsdom and browsers space inline text slightly differently.
      screen.getByRole("link", {
        name: /^Lv 1\s*·\s*0 XP\s*\(Level 1, Curious Explorer\)\. View my progress$/,
      })
    ).toHaveAttribute("href", "/progress")

    act(() => useProgressStore.getState().awardXp(120, "Test"))
    expect(
      screen.getByRole("link", {
        name: /^Lv 2\s*·\s*120 XP\s*\(Level 2, Aspiring PM\)\. View my progress$/,
      })
    ).toBeInTheDocument()
  })
})
