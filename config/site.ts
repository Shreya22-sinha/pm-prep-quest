export const siteConfig = {
  name: "PM Prep Quest",
  /** Public address, used for share previews and the sitemap. Set NEXT_PUBLIC_SITE_URL when deploying. */
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
  description:
    "Your friendly, gamified path from curious about Product Management to interview-ready.",
  nav: [
    { label: "Home", href: "/" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Interview Arena", href: "/interview" },
    { label: "My Progress", href: "/progress" },
  ],
} as const

export type NavItem = (typeof siteConfig.nav)[number]
