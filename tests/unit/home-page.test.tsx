import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import HomePage from "@/app/(marketing)/page"
import { homeContent } from "@/content/home"

describe("Home page", () => {
  it("renders exactly one main heading", () => {
    render(<HomePage />)
    const h1s = screen.getAllByRole("heading", { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent(homeContent.hero.headline)
  })

  it("renders every section as a labelled region", () => {
    render(<HomePage />)
    for (const title of [
      homeContent.whatPmsDo.title,
      homeContent.whyItMatters.title,
      homeContent.benefits.title,
      homeContent.youCanDoThis.title,
      homeContent.mythBusters.title,
      homeContent.finalCta.title,
    ]) {
      expect(screen.getByRole("region", { name: title })).toBeInTheDocument()
    }
  })

  it("links both calls to action to the roadmap", () => {
    render(<HomePage />)
    expect(screen.getByRole("link", { name: homeContent.hero.primaryCta.label })).toHaveAttribute(
      "href",
      "/roadmap"
    )
    expect(screen.getByRole("link", { name: homeContent.finalCta.cta.label })).toHaveAttribute(
      "href",
      "/roadmap"
    )
  })

  it("hides the decorative hero illustration from screen readers", () => {
    render(<HomePage />)
    const previewLabel = screen.getByText(homeContent.hero.preview.label)
    expect(previewLabel.closest('[aria-hidden="true"]')).not.toBeNull()
  })
})
