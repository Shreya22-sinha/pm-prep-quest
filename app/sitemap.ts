import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { TOPIC_LESSONS } from "@/content/topic-lessons"

// Public pages only. Interview sessions and results live in each visitor's
// browser and are never listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/roadmap", "/interview", "/progress"].map((path) => ({
    url: `${siteConfig.url}${path}`,
  }))
  const lessons = Object.keys(TOPIC_LESSONS).map((topic) => ({
    url: `${siteConfig.url}/roadmap/${topic}`,
  }))
  return [...pages, ...lessons]
}
