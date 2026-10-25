import { expect, test, type Page } from "@playwright/test"

// Browsers in CI have no microphone, so these tests install a scripted stand-in
// for the Web Speech API before the page loads. The AI routes are mocked too.

async function installFakeSpeech(page: Page, { recognition }: { recognition: boolean }) {
  await page.addInitScript(
    ({ withRecognition }) => {
      const spoken: string[] = []
      Object.assign(window, { __spoken: spoken })

      class FakeUtterance {
        text: string
        onstart: (() => void) | null = null
        onend: (() => void) | null = null
        onerror: (() => void) | null = null
        constructor(text: string) {
          this.text = text
        }
      }
      const synthesis = {
        speak(utterance: FakeUtterance) {
          spoken.push(utterance.text)
          setTimeout(() => {
            utterance.onstart?.()
            utterance.onend?.()
          }, 10)
        },
        cancel() {},
        getVoices: () => [],
        addEventListener() {},
        removeEventListener() {},
      }
      Object.defineProperty(window, "speechSynthesis", { value: synthesis, configurable: true })
      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        value: FakeUtterance,
        configurable: true,
      })

      // Each recording session "hears" the next scripted phrase.
      const phrases = ["I would focus on first time visitors", "Visitors on short city breaks"]
      let session = 0
      class FakeRecognition {
        onresult: ((event: unknown) => void) | null = null
        onerror: ((event: unknown) => void) | null = null
        onend: (() => void) | null = null
        start() {
          const phrase = phrases[session++] ?? "More thoughts"
          setTimeout(() => {
            this.onresult?.({
              results: [Object.assign([{ transcript: phrase }], { isFinal: true })],
            })
          }, 50)
        }
        stop() {
          setTimeout(() => this.onend?.(), 20)
        }
        abort() {
          this.onend?.()
        }
      }
      const speechWindow = window as unknown as Record<string, unknown>
      if (withRecognition) {
        speechWindow.SpeechRecognition = FakeRecognition
        speechWindow.webkitSpeechRecognition = FakeRecognition
      } else {
        delete speechWindow.SpeechRecognition
        delete speechWindow.webkitSpeechRecognition
      }
    },
    { withRecognition: recognition }
  )
}

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
  overallScore: 78,
  categoryScores: [{ category: "product-design", score: 78 }],
  summary: "Clear, user-focused thinking, delivered out loud. Great work!",
  strengths: [{ questionNumber: 1, quote: "first time visitors", why: "A clear segment." }],
  focusAreas: ["Add a success metric."],
  reviews: [
    {
      score: 78,
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
  evaluatedAt: "2026-10-24T10:00:00.000Z",
}

async function chooseProgramAndLevel(page: Page) {
  await page.goto("/interview")
  await page.getByRole("radio", { name: /A PM program/ }).click()
  await page.getByRole("radio", { name: /^Google/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("radio", { name: /Fresher/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
}

test("a voice interview: spoken questions, spoken answers, editable transcript", async ({
  page,
}) => {
  await installFakeSpeech(page, { recognition: true })
  await page.route("**/api/interview/start", (route) => route.fulfill({ json: PLAN }))
  let answerBody: Record<string, unknown> | null = null
  await page.route("**/api/interview/answer", async (route) => {
    answerBody = route.request().postDataJSON()
    await route.fulfill({
      json: { followUp: "Which visitors would you start with?", encouragement: "Nice." },
    })
  })
  await page.route("**/api/interview/evaluate", (route) => route.fulfill({ json: EVALUATION }))

  await chooseProgramAndLevel(page)
  await page.getByRole("radio", { name: /Voice/ }).click()
  await expect(page.getByText(/built-in speech recognition/)).toBeVisible()
  await page.getByRole("radio", { name: /Quick/ }).click()
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page.getByText(/Voice · Quick/)).toBeVisible()
  await page.getByRole("button", { name: "Start interview" }).click()

  // The interviewer reads the greeting and the question.
  await expect(page.getByText("Voice interview")).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken))
    .toContain(`${PLAN.greeting} ${PLAN.questions[0]!.question}`)

  // Speak, stop, edit the transcript, submit.
  await page.getByRole("button", { name: "Start recording your answer" }).click()
  await expect(page.getByText("Listening… tap to stop")).toBeVisible()
  const transcript = page.getByRole("textbox", { name: "Your answer" })
  await expect(transcript).toHaveValue("I would focus on first time visitors")
  await page.getByRole("button", { name: "Stop recording" }).click()
  await expect(page.getByText("Tap to add more")).toBeVisible()
  await transcript.press("End")
  await transcript.pressSequentially(" to the city")
  await page.getByRole("button", { name: "Submit answer" }).click()
  await expect
    .poll(() => answerBody?.answer)
    .toBe("I would focus on first time visitors to the city")

  // The follow-up is read aloud and answered by voice too.
  await expect(page.getByText("Which visitors would you start with?")).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken))
    .toContain("Which visitors would you start with?")
  await page.getByRole("button", { name: "Start recording your answer" }).click()
  await expect(page.getByRole("textbox", { name: "Your follow-up answer" })).toHaveValue(
    "Visitors on short city breaks"
  )
  await page.getByRole("button", { name: "Stop recording" }).click()
  await page.getByRole("button", { name: "Submit follow-up" }).click()
  await page.getByRole("button", { name: "Finish interview" }).click()

  // Results celebrate the first voice interview.
  await page
    .getByRole("dialog", { name: "You've reached Aspiring PM!" })
    .getByRole("button", { name: "Keep going" })
    .click()
  await expect(page.getByText("Badge: Voice Warrior")).toBeVisible()
})

test("browsers without speech recognition get a friendly written fallback", async ({ page }) => {
  await installFakeSpeech(page, { recognition: false })
  await chooseProgramAndLevel(page)

  await expect(page.getByRole("radio", { name: /Voice/ })).toBeDisabled()
  await expect(page.getByText("Not available in this browser")).toBeVisible()
  await expect(page.getByRole("radio", { name: /Written/ })).toBeChecked()
})
