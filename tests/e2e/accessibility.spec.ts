import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

// Automated WCAG 2.1 AA checks (axe) on every page, in light and dark mode,
// plus a no-sideways-scrolling check at the 360px minimum width (spec 3 & 8).
// AI routes are mocked so the interview and results pages can be reached.

const PLAN = {
  targetLabel: "Google APM",
  greeting: "Welcome! Let's keep this relaxed.",
  questions: [
    {
      category: "product-design",
      question: "How would you improve Google Maps for tourists?",
      hint: "Pick a segment.",
    },
  ],
}

const EVALUATION = {
  overallScore: 75,
  categoryScores: [{ category: "product-design", score: 75 }],
  summary: "Thoughtful and user-focused. Nice work!",
  strengths: [{ questionNumber: 1, quote: "first-time visitors", why: "A clear segment." }],
  focusAreas: ["Add a success metric."],
  reviews: [
    {
      score: 75,
      verdict: "partial",
      whatWasGood: ["Clear segment"],
      whatWasMissing: ["Success metric"],
      modelAnswer: {
        framework: "CIRCLES",
        answer: "Clarify, segment, prioritise, solve, measure.",
      },
    },
  ],
  practiceCategories: ["product-design"],
  practiceQuestions: [{ category: "product-design", question: "Design a road trip planner." }],
  evaluatedAt: "2026-10-25T10:00:00.000Z",
}

async function expectAccessible(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // Next.js's development-only overlay isn't part of the app.
    .exclude("nextjs-portal")
    .analyze()
  const summary = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(" "))
        .join(" | ")}`
  )
  expect(summary, `Accessibility violations on ${label}`).toEqual([])
}

async function expectNoSidewaysScroll(page: Page, label: string) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow, `Horizontal overflow on ${label}`).toBeLessThanOrEqual(0)
}

/** Settles motion and lazy content so axe sees the final page. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    window.scrollTo(0, 0)
  })
  // Scroll-in reveals fade in for up to ~1.3s; let them finish before measuring contrast.
  await page.waitForTimeout(1_500)
}

const STATIC_PAGES = [
  { path: "/", ready: "Build products millions use." },
  { path: "/roadmap", ready: "Your PM Roadmap" },
  { path: "/roadmap/metrics", ready: "Product Metrics & Success Metrics" },
  { path: "/interview", ready: "Practise with a friendly AI interviewer" },
  { path: "/progress", ready: "My Progress" },
  { path: "/does-not-exist", ready: "This page took a detour" },
]

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme, reducedMotion: "reduce" })

    for (const { path, ready } of STATIC_PAGES) {
      test(`${path} is accessible`, async ({ page }) => {
        await page.goto(path)
        await expect(page.getByRole("heading", { level: 1 })).toContainText(ready)
        await settle(page)
        await expectAccessible(page, `${path} (${scheme})`)
      })
    }

    test("interview and results pages are accessible", async ({ page }) => {
      await page.route("**/api/interview/start", (route) => route.fulfill({ json: PLAN }))
      await page.route("**/api/interview/answer", (route) =>
        route.fulfill({ json: { followUp: null, encouragement: "Nice." } })
      )
      await page.route("**/api/interview/evaluate", (route) => route.fulfill({ json: EVALUATION }))

      await page.goto("/interview")
      await page.getByRole("radio", { name: /A PM program/ }).click()
      await page.getByRole("radio", { name: /^Google/ }).click()
      await expectAccessible(page, `wizard step 1 (${scheme})`)
      await page.getByRole("button", { name: "Continue" }).click()
      await page.getByRole("radio", { name: /Fresher/ }).click()
      await page.getByRole("button", { name: "Continue" }).click()
      await expectAccessible(page, `wizard step 3 (${scheme})`)
      await page.getByRole("button", { name: "Continue" }).click()
      await page.getByRole("button", { name: "Start interview" }).click()

      await expect(page.getByText(PLAN.greeting)).toBeVisible()
      await page.getByRole("button", { name: "Give me a hint" }).click()
      await expectAccessible(page, `interview session (${scheme})`)

      await page.getByLabel("Your answer").fill("I'd focus on first-time visitors.")
      await page.getByRole("button", { name: "Submit answer" }).click()
      await page.getByRole("button", { name: "Finish interview" }).click()
      await page.getByRole("button", { name: "Keep going" }).click()
      await expect(page.getByRole("heading", { name: "What you did great" })).toBeVisible()
      await settle(page)
      await expectAccessible(page, `results (${scheme})`)
    })
  })
}

test.describe("phone width (360px)", () => {
  test.use({ viewport: { width: 360, height: 740 } })

  for (const { path, ready } of STATIC_PAGES) {
    test(`${path} has no sideways scrolling`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole("heading", { level: 1 })).toContainText(ready)
      await settle(page)
      await expectNoSidewaysScroll(page, path)
    })
  }
})
