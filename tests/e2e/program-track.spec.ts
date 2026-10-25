import { expect, test, type Page } from "@playwright/test"

// The AI routes are mocked so these tests never call Groq.

type SetupBody = { programMockId?: string | null; length?: string }

const question = {
  category: "product-design",
  question: "How would you improve Google Maps for tourists?",
  hint: "Pick a segment.",
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

async function mockAi(page: Page) {
  const starts: SetupBody[] = []
  await page.route("**/api/interview/start", async (route) => {
    const body = route.request().postDataJSON() as SetupBody
    starts.push(body)
    await route.fulfill({
      json: {
        targetLabel: body.programMockId ? "Google APM · Product sense warm-up" : "Google APM",
        greeting: "Welcome!",
        questions: [question],
      },
    })
  })
  await page.route("**/api/interview/answer", (route) =>
    route.fulfill({ json: { followUp: null, encouragement: "Nice." } })
  )
  await page.route("**/api/interview/evaluate", (route) => route.fulfill({ json: EVALUATION }))
  return starts
}

async function answerAndFinish(page: Page) {
  await page.getByLabel("Your answer").fill("I'd focus on first-time visitors.")
  await page.getByRole("button", { name: "Submit answer" }).click()
  await page.getByRole("button", { name: "Finish interview" }).click()
  await expect(page).toHaveURL(/\/interview\/results\//)
}

test("a program interview unlocks a themed track, one mock at a time", async ({ page }) => {
  const starts = await mockAi(page)

  // A regular Google APM interview.
  await page.goto("/interview")
  await page.getByRole("radio", { name: /A PM program/ }).click()
  await page.getByRole("radio", { name: /^Google/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("radio", { name: /Fresher/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("radio", { name: /Quick/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("button", { name: "Start interview" }).click()
  await answerAndFinish(page)
  await page.getByRole("button", { name: "Keep going" }).click()

  // The results include the program's prep plan with the first mock open.
  const plan = page.getByRole("region", {
    name: "Your Google Associate Product Manager (APM) prep plan",
  })
  await expect(plan.getByText("What it typically emphasises")).toBeVisible()
  await expect(plan.getByText("0 of 4 mock interviews complete")).toBeVisible()
  await expect(plan.getByText("Complete “Product sense warm-up” to unlock")).toBeVisible()

  // Mock 1: themed, and shorter (Quick) per its definition.
  await plan.getByRole("button", { name: "Start mock: Product sense warm-up" }).click()
  await expect(page).toHaveURL(/\/interview\/session\//)
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Google APM · Product sense warm-up"
  )
  expect(starts.at(-1)).toMatchObject({ programMockId: "product-sense", length: "quick" })
  await answerAndFinish(page)

  // Mock 1 complete: +100 interview XP + 50 mock bonus; mock 2 unlocked.
  await expect(page.getByText("+150 XP earned")).toBeVisible()
  await expect(plan.getByText("1 of 4 mock interviews complete")).toBeVisible()
  await expect(plan.getByRole("button", { name: "Start mock: Analytical thinking" })).toBeVisible()

  // The first results page is still mounted (hidden) by Next.js, with the same
  // section ids: in-page links must scroll the visible copy.
  await page
    .getByRole("navigation", { name: "Results sections" })
    .getByRole("link", { name: "Question review" })
    .click()
  await expect(page.getByRole("heading", { name: "Question-by-question review" })).toBeInViewport()

  // My Progress shows the track and links back to it.
  await page.goto("/progress")
  const tracks = page.getByRole("region", { name: "Program tracks" })
  await expect(tracks.getByText("1 of 4 mock interviews complete")).toBeVisible()
  await expect(tracks.getByText("Up next: Analytical thinking")).toBeVisible()
  await tracks.getByRole("link", { name: "Continue track" }).click()
  await expect(page).toHaveURL(/\/interview\/results\/[\w-]+#program$/)
  await expect(
    plan.getByRole("button", { name: "Start mock: Analytical thinking" })
  ).toBeInViewport()
})
