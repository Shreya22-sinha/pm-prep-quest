import { expect, test } from "@playwright/test"

test("the skip link moves keyboard focus to the main content", async ({ page }) => {
  await page.goto("/roadmap")
  await page.keyboard.press("Tab")
  const skipLink = page.getByRole("link", { name: "Skip to content" })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeVisible()

  await page.keyboard.press("Enter")
  await expect(page.locator("main#main-content")).toBeFocused()
})

test("every page has a title and description for search and sharing", async ({ page }) => {
  for (const [path, title] of [
    ["/", "PM Prep Quest — Your path to a PM role"],
    ["/roadmap", "Roadmap · PM Prep Quest"],
    ["/roadmap/rca", "Root Cause Analysis · PM Prep Quest"],
    ["/interview", "Interview Arena · PM Prep Quest"],
    ["/progress", "My Progress · PM Prep Quest"],
  ] as const) {
    await page.goto(path)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /opengraph-image/
    )
  }
})

test("the sitemap, robots file and share image are served", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text()
  expect(sitemap).toContain("/roadmap/metrics</loc>")
  expect(sitemap).not.toContain("/interview/results")

  const robots = await (await request.get("/robots.txt")).text()
  expect(robots).toContain("Disallow: /interview/results/")
  expect(robots).toContain("Sitemap:")

  const image = await request.get("/opengraph-image")
  expect(image.ok()).toBe(true)
  expect(image.headers()["content-type"]).toContain("image/png")
})
