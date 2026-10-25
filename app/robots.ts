import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal, browser-only pages; there is nothing useful to index.
      disallow: ["/interview/session/", "/interview/results/", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
