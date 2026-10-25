import { expect, test, type Page } from "@playwright/test"

// The AI routes are mocked at the network level so these tests never call
// Groq. Resume parsing uses the real server route with a generated PDF.

const PLAN = {
  targetLabel: "Google APM",
  greeting: "Welcome! Let's keep this relaxed and fun.",
  questions: [
    {
      category: "product-design",
      question: "How would you improve Google Maps for tourists?",
      hint: "Pick one user segment first.",
    },
    {
      category: "metrics",
      question: "How would you measure the success of Google Photos?",
      hint: "Start from the product's goal.",
    },
    {
      category: "behavioral",
      question: "Tell me about a time you influenced without authority.",
      hint: "Use STAR.",
    },
  ],
}

async function mockStart(page: Page) {
  let startBody: Record<string, unknown> | null = null
  await page.route("**/api/interview/start", async (route) => {
    startBody = route.request().postDataJSON()
    await route.fulfill({ json: PLAN })
  })
  return () => startBody
}

const MODEL_ANSWER = {
  framework: "CIRCLES",
  answer: "Clarify the goal, choose a segment, list needs, prioritise, brainstorm and decide.",
}

/** A finished evaluation for PLAN (question 2 skipped), as the evaluate route returns it. */
const EVALUATION = {
  overallScore: 73,
  categoryScores: [
    { category: "product-design", score: 82 },
    { category: "metrics", score: null },
    { category: "behavioral", score: 64 },
  ],
  summary: "You brought real user empathy and a clear story. Great foundation!",
  strengths: [{ questionNumber: 1, quote: "focus on first-time visitors", why: "Clear segment." }],
  focusAreas: ["Add a success metric to every product answer."],
  reviews: [
    {
      score: 82,
      verdict: "strong",
      whatWasGood: ["Clear segment"],
      whatWasMissing: ["Success metric"],
      modelAnswer: MODEL_ANSWER,
    },
    {
      score: null,
      verdict: "skipped",
      whatWasGood: [],
      whatWasMissing: ["Define the goal first"],
      modelAnswer: { ...MODEL_ANSWER, framework: "Goal → Signals → Metrics" },
    },
    {
      score: 64,
      verdict: "partial",
      whatWasGood: ["Used data"],
      whatWasMissing: ["Quantify the result"],
      modelAnswer: { ...MODEL_ANSWER, framework: "STAR" },
    },
  ],
  practiceCategories: ["metrics", "behavioral"],
  practiceQuestions: [
    { category: "metrics", question: "How would you measure success for Google Docs comments?" },
    { category: "behavioral", question: "Tell me about a time you changed someone's mind." },
  ],
  evaluatedAt: "2026-10-24T10:00:00.000Z",
}

const RESUME_FEEDBACK = {
  strengths: ["Clear ownership of a checkout redesign."],
  gaps: [{ area: "impact", detail: "Few bullets show measurable outcomes." }],
  rewrites: [
    {
      before: "Product analyst.",
      after: "Product analyst who [improved X by Y%].",
      why: "Outcome-focused.",
    },
    {
      before: "Led a checkout redesign.",
      after: "Led a checkout redesign used by [N] customers.",
      why: "Scale.",
    },
  ],
  skillsToAdd: [{ skill: "SQL", why: "Answer your own data questions.", tag: "analytics" }],
  projectIdeas: [1, 2, 3].map((n) => ({
    title: `Project idea ${n}`,
    description: "A small, useful side project.",
    demonstrates: "Product sense",
    howToStart: "Pick one problem you have.",
  })),
}

async function mockResults(page: Page) {
  let evaluateBody: Record<string, unknown> | null = null
  let resumeBody: Record<string, unknown> | null = null
  let evaluateCount = 0
  await page.route("**/api/interview/evaluate", async (route) => {
    evaluateCount += 1
    evaluateBody = route.request().postDataJSON()
    await route.fulfill({ json: EVALUATION })
  })
  await page.route("**/api/resume/feedback", async (route) => {
    resumeBody = route.request().postDataJSON()
    await route.fulfill({ json: RESUME_FEEDBACK })
  })
  await page.route("**/api/practice/evaluate", (route) =>
    route.fulfill({
      json: {
        score: 85,
        verdict: "strong",
        whatWasGood: ["Clear North Star"],
        whatWasMissing: [],
        modelAnswer: MODEL_ANSWER,
        encouragement: "You're getting the hang of this!",
      },
    })
  )
  return {
    getEvaluateBody: () => evaluateBody,
    getResumeBody: () => resumeBody,
    evaluateCalls: () => evaluateCount,
  }
}

async function makeResumePdf(page: Page): Promise<Buffer> {
  const pdfPage = await page.context().newPage()
  await pdfPage.setContent(
    "<h1>Jane Doe</h1><p>Product analyst. Led a checkout redesign used by thousands of customers.</p>"
  )
  const pdf = await pdfPage.pdf()
  await pdfPage.close()
  return pdf
}

async function completeWizard(page: Page) {
  await page.goto("/interview")
  await page.getByRole("radio", { name: /A PM program/ }).click()
  await page.getByRole("radio", { name: /^Google/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("radio", { name: /Fresher/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("radio", { name: /Quick/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
}

test("set up, complete and review a written mock interview", async ({ page }) => {
  const getStartBody = await mockStart(page)
  const { getEvaluateBody, getResumeBody } = await mockResults(page)
  let answerCalls = 0
  await page.route("**/api/interview/answer", async (route) => {
    answerCalls += 1
    await route.fulfill({
      json:
        answerCalls === 1
          ? { followUp: "Which tourists would you start with?", encouragement: "Nice framing." }
          : { followUp: null, encouragement: "Great story, well structured." },
    })
  })

  await page.goto("/interview")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("friendly AI interviewer")

  // Step 1: program path, Google, and a real PDF resume.
  await page.getByRole("radio", { name: /A PM program/ }).click()
  await page.getByRole("radio", { name: /^Google/ }).click()
  await page.locator('input[type="file"]').setInputFiles({
    name: "jane-doe-resume.pdf",
    mimeType: "application/pdf",
    buffer: await makeResumePdf(page),
  })
  // Generous timeout: the dev server compiles the PDF route on its first request.
  await expect(page.getByText("jane-doe-resume.pdf")).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/Resume loaded · 1 page/)).toBeVisible()
  await page.getByRole("button", { name: "Continue" }).click()

  // Steps 2–4.
  await page.getByRole("radio", { name: /Fresher/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  // Chromium supports speech recognition, so voice is offered; this test stays written.
  await expect(page.getByRole("radio", { name: /Voice/ })).toBeEnabled()
  await page.getByRole("radio", { name: /Quick/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page.getByText("Google Associate Product Manager (APM)")).toBeVisible()
  await page.getByRole("button", { name: "Start interview" }).click()

  // The resume text extracted on the server was sent to the AI.
  await expect(page).toHaveURL(/\/interview\/session\/[\w-]+$/)
  expect(String(getStartBody()?.resumeText)).toContain("Jane Doe")

  // Question 1: hint, answer, follow-up.
  await expect(page.getByText(PLAN.greeting)).toBeVisible()
  await expect(page.getByText("Question 1 of 3").first()).toBeVisible()
  await page.getByRole("button", { name: "Give me a hint" }).click()
  await expect(page.getByText("Pick one user segment first.")).toBeVisible()
  await page.getByLabel("Your answer").fill("Focus on first-time visitors and plan their day.")
  await page.getByRole("button", { name: "Submit answer" }).click()
  await expect(page.getByText("Which tourists would you start with?")).toBeVisible()
  await page.getByLabel("Your follow-up answer").fill("First-time visitors on short trips.")
  await page.getByRole("button", { name: "Submit follow-up" }).click()
  await expect(page.getByText("+10 XP")).toBeVisible()
  await page.getByRole("button", { name: "Next question" }).click()

  // Question 2: skip. Question 3: answer.
  await page.getByRole("button", { name: "Skip question" }).click()
  await page.getByRole("button", { name: "Next question" }).click()
  await page.getByLabel("Your answer").fill("I aligned the team on user data.")
  await page.getByRole("button", { name: "Submit answer" }).click()
  await expect(page.getByText("Great story, well structured.")).toBeVisible()
  await page.getByRole("button", { name: "Finish interview" }).click()

  // Results: evaluation, praise, review, practice and resume makeover.
  await expect(page).toHaveURL(/\/interview\/results\/[\w-]+$/)
  // Reaching 100 XP unlocks level 2: close the celebration first.
  await page
    .getByRole("dialog", { name: "You've reached Aspiring PM!" })
    .getByRole("button", { name: "Keep going" })
    .click()
  await expect(page.getByRole("img", { name: "Overall score 73 out of 100" })).toBeVisible()
  await expect(page.getByText("2 of 3 questions answered")).toBeVisible()
  await expect(page.getByText("+100 XP earned")).toBeVisible()
  expect(String(getEvaluateBody()?.turns)).not.toBe("undefined")

  await expect(page.getByText("“focus on first-time visitors”")).toBeVisible()
  const review = page.getByRole("region", { name: "Question-by-question review" })
  await review.getByRole("button", { name: "Show model answer" }).first().click()
  await expect(review.getByText("Model answer · CIRCLES")).toBeVisible()

  await page
    .getByRole("button", { name: /^Practise:/ })
    .first()
    .click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Your answer").fill("Comments per active doc per week.")
  await dialog.getByRole("button", { name: "Get feedback" }).click()
  await expect(dialog.getByText("You're getting the hang of this!")).toBeVisible()
  await dialog.getByRole("button", { name: "Done" }).click()
  await expect(page.getByText("Practised · 85")).toBeVisible()

  const makeover = page.getByRole("region", { name: "Resume makeover" })
  await expect(makeover.getByText("Clear ownership of a checkout redesign.")).toBeVisible()
  expect(String(getResumeBody()?.resumeText)).toContain("Jane Doe")

  // 10 (follow-up) + 100 (interview) + 20 (practice) XP; level 2 starts at 100.
  await expect(
    page.getByRole("link", { name: /Lv 2 · 130 XP \(Level 2, Aspiring PM\)/ })
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Download as PDF" })).toBeVisible()
})

test("finished interviews reopen on their saved results without a new evaluation", async ({
  page,
}) => {
  await mockStart(page)
  const { evaluateCalls } = await mockResults(page)
  await page.route("**/api/interview/answer", (route) =>
    route.fulfill({ json: { followUp: null, encouragement: "Nice." } })
  )
  await completeWizard(page)
  await page.getByRole("button", { name: "Start interview" }).click()
  for (let index = 0; index < PLAN.questions.length; index++) {
    await page.getByLabel("Your answer").fill(`My answer to question ${index + 1}.`)
    await page.getByRole("button", { name: "Submit answer" }).click()
    await page
      .getByRole("button", {
        name: index === PLAN.questions.length - 1 ? "Finish interview" : "Next question",
      })
      .click()
  }
  await expect(page).toHaveURL(/\/interview\/results\//)
  await page
    .getByRole("dialog", { name: "You've reached Aspiring PM!" })
    .getByRole("button", { name: "Keep going" })
    .click()
  await expect(page.getByRole("heading", { name: "What you did great" })).toBeVisible()
  const resultsUrl = page.url()

  // Visiting the session again redirects to the saved results.
  await page.goto(resultsUrl.replace("/results/", "/session/"))
  await expect(page).toHaveURL(resultsUrl)
  await expect(page.getByRole("heading", { name: "What you did great" })).toBeVisible()
  expect(evaluateCalls()).toBe(1)
})

test("an unfinished interview can be resumed after leaving", async ({ page }) => {
  await mockStart(page)
  await completeWizard(page)
  await page.getByRole("button", { name: "Start interview" }).click()
  await expect(page).toHaveURL(/\/interview\/session\//)
  await expect(page.getByText("Question 1 of 3").first()).toBeVisible()

  await page.getByRole("link", { name: "Save & exit" }).click()
  await expect(page.getByText("You have an interview in progress")).toBeVisible()
  await page.getByRole("link", { name: "Continue" }).click()
  await expect(page.getByRole("heading", { name: PLAN.questions[0]!.question })).toBeVisible()
})

test("the wizard explains what's missing", async ({ page }) => {
  await page.goto("/interview")
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page.getByText("Choose a job or a PM program to get started.")).toBeVisible()

  await page.getByRole("radio", { name: /A specific job/ }).click()
  await page.getByRole("textbox", { name: "Job description" }).fill("Too short")
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page.getByText(/at least 80 characters/)).toBeVisible()
})

test("an unknown interview shows a friendly message", async ({ page }) => {
  await page.goto("/interview/session/does-not-exist")
  await expect(page.getByText("We couldn't find that interview")).toBeVisible()
})
