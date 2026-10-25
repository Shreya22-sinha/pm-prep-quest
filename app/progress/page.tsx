import type { Metadata } from "next"

import { ProgressDashboard } from "@/components/progress/progress-dashboard"

export const metadata: Metadata = {
  title: "My Progress",
  description: "Your level, XP, badges, streak and interview history.",
}

export default function ProgressPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          My Progress
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Every step counts. Here&apos;s how far you&apos;ve come.
        </p>
      </header>
      <ProgressDashboard />
    </div>
  )
}
