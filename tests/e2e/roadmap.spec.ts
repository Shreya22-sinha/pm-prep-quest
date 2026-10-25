import { expect, test } from "@playwright/test"

test("learn a level, mark it complete and see the map update", async ({ page }) => {
  await page.goto("/roadmap")
  await expect(page.getByRole("heading", { level: 1, name: "Your PM Roadmap" })).toBeVisible()
  await expect(page.getByText("0 of 12 levels complete. Your adventure starts here!")).toBeVisible()

  // Open level 1 from the map.
  await page.getByRole("link", { name: "Level 1: PM Fundamentals, Up next" }).click()
  await expect(page).toHaveURL(/\/roadmap\/fundamentals$/)
  await expect(page.getByRole("heading", { level: 1, name: "PM Fundamentals" })).toBeVisible()

  for (const section of [
    "What it is",
    "Why interviewers ask it",
    "Framework: The product lifecycle",
    "Try a sample question",
    "Curated resources",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible()
  }

  // Resources open their official sites in a new tab.
  const firstResource = page
    .getByRole("region", { name: "Curated resources" })
    .getByRole("link")
    .first()
  await expect(firstResource).toHaveAttribute("target", "_blank")
  await expect(firstResource).toHaveAttribute("href", /^https:\/\//)

  // Complete it.
  await page.getByRole("button", { name: /Mark as complete/ }).click()
  await expect(page.getByText("+50 XP")).toBeVisible()
  await expect(page.getByText("Level complete. Nice work!")).toBeVisible()

  // Back on the map, level 2 is now up next.
  await page.getByRole("link", { name: "Roadmap", exact: true }).first().click()
  await expect(page.getByText("1 of 12 levels complete — great start!")).toBeVisible()
  await expect(page.getByRole("link", { name: "Level 1: PM Fundamentals, Complete" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Level 2: Product Design & Product Sense, Up next" })
  ).toBeVisible()
})

test("locked-looking levels are still open, and the last level leads to the Arena", async ({
  page,
}) => {
  await page.goto("/roadmap")
  await page.getByRole("link", { name: /^Level 10: Technical Basics for PMs/ }).click()
  await expect(
    page.getByRole("heading", { level: 1, name: "Technical Basics for PMs" })
  ).toBeVisible()

  await page.goto("/roadmap")
  await expect(page.getByRole("link", { name: /^Level 12: Mock Interviews/ })).toHaveAttribute(
    "href",
    "/interview"
  )
  await page.getByRole("link", { name: "Enter the Interview Arena" }).click()
  await expect(page).toHaveURL(/\/interview$/)
})

test("unknown levels show the friendly 404", async ({ page }) => {
  await page.goto("/roadmap/not-a-level")
  await expect(page.getByRole("heading", { name: "This page took a detour" })).toBeVisible()
})
