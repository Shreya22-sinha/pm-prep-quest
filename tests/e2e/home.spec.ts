import { expect, test } from "@playwright/test"

test("home inspires and leads to the roadmap", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Start your PM journey today."
  )

  // The secondary hero link jumps to the "What a PM actually does" section.
  await page.getByRole("link", { name: "What does a PM do?" }).click()
  await expect(page).toHaveURL(/#what-pms-do$/)
  await expect(page.getByRole("heading", { name: "What a PM actually does" })).toBeInViewport()

  for (const title of [
    "Why this role matters",
    "Why people love being PMs",
    "You can do this",
    "Things that shouldn't stop you",
  ]) {
    const heading = page.getByRole("heading", { level: 2, name: title })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
  }

  const finalCta = page.getByRole("link", { name: "See your roadmap" })
  await finalCta.scrollIntoViewIfNeeded()
  await finalCta.click()
  await expect(page).toHaveURL(/\/roadmap$/)
})

test("primary call to action opens the roadmap", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "Start my journey" }).click()
  await expect(page).toHaveURL(/\/roadmap$/)
})

test("home fits a 360px phone screen without sideways scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto("/")
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
