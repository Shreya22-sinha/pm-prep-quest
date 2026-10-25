import { expect, test } from "@playwright/test"

// Uses the development-only tools on /progress (the e2e suite runs against `next dev`)
// to earn XP until the roadmap and interviews exist.

test("earning XP celebrates, levels up and is remembered", async ({ page }) => {
  await page.goto("/progress")

  await expect(page.getByText("Your adventure starts now")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Curious Explorer" })).toBeVisible()
  await expect(page.getByText("No interviews yet")).toBeVisible()

  // Completing a level: +50 XP toast and a badge.
  await page.getByRole("button", { name: "Complete next level" }).click()
  await expect(page.getByText("+50 XP")).toBeVisible()
  await expect(page.getByText("Badge unlocked: First Steps")).toBeVisible()
  await expect(
    page.getByRole("link", { name: /Lv 1 · 50 XP \(Level 1, Curious Explorer\)/ })
  ).toBeVisible()

  // A high-scoring interview pushes past 100 XP: level-up dialog.
  await page.getByRole("button", { name: "Log sample interview" }).click()
  const dialog = page.getByRole("dialog", { name: "You've reached Aspiring PM!" })
  await expect(dialog).toBeVisible()
  await dialog.getByRole("button", { name: "Keep going" }).click()
  await expect(dialog).toBeHidden()

  await expect(page.getByRole("heading", { name: "Aspiring PM" })).toBeVisible()
  await expect(page.getByText("Sample: Associate PM program")).toBeVisible()

  // Progress survives a reload.
  await page.reload()
  await expect(page.getByRole("heading", { name: "Aspiring PM" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: /Lv 2 · 200 XP \(Level 2, Aspiring PM\)/ })
  ).toBeVisible()

  // Start over, with confirmation.
  await page.getByRole("button", { name: "Start over" }).click()
  await page.getByRole("button", { name: "Yes, start over" }).click()
  await expect(page.getByText("Your adventure starts now")).toBeVisible()
  await expect(
    page.getByRole("link", { name: /Lv 1 · 0 XP \(Level 1, Curious Explorer\)/ })
  ).toBeVisible()
})
