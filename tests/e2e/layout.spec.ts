import { expect, test } from "@playwright/test"

test("home loads with the navbar and links to every section", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Build products millions use")

  const nav = page.getByRole("navigation", { name: "Main" })
  await nav.getByRole("link", { name: "Roadmap" }).click()
  await expect(page).toHaveURL(/\/roadmap$/)
  await expect(page.getByRole("heading", { level: 1, name: "Your PM Roadmap" })).toBeVisible()

  await nav.getByRole("link", { name: "Interview Arena" }).click()
  await expect(
    page.getByRole("heading", { level: 1, name: "Practise with a friendly AI interviewer" })
  ).toBeVisible()

  await nav.getByRole("link", { name: "My Progress" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "My Progress" })).toBeVisible()
})

test("theme toggle switches to dark and remembers it", async ({ page }) => {
  await page.goto("/")
  const html = page.locator("html")

  await page.getByRole("button", { name: "Change theme" }).click()
  await page.getByRole("menuitemradio", { name: "Dark" }).click()
  await expect(html).toHaveClass(/\bdark\b/)

  await page.reload()
  await expect(html).toHaveClass(/\bdark\b/)

  await page.getByRole("button", { name: "Change theme" }).click()
  await page.getByRole("menuitemradio", { name: "Light" }).click()
  await expect(html).not.toHaveClass(/\bdark\b/)
})

test("mobile menu opens and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto("/")

  await page.getByRole("button", { name: "Open menu" }).click()
  await page
    .getByRole("navigation", { name: "Mobile" })
    .getByRole("link", { name: "Roadmap" })
    .click()
  await expect(page).toHaveURL(/\/roadmap$/)
})

test("unknown pages show a friendly 404", async ({ page }) => {
  await page.goto("/does-not-exist")
  await expect(page.getByRole("heading", { name: "This page took a detour" })).toBeVisible()
})
