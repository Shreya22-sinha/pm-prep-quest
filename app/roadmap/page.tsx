import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, MessagesSquare, Unlock } from "lucide-react"

import { RoadmapMap } from "@/components/roadmap/roadmap-map"
import { RoadmapProgress } from "@/components/roadmap/roadmap-progress"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "A friendly, level-by-level learning path covering every PM interview topic, with frameworks, sample questions and curated resources.",
}

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold tracking-wider text-primary uppercase">
          Your learning path
        </p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          Your PM Roadmap
        </h1>
        <p className="mt-4 text-lg text-pretty text-muted-foreground">
          Twelve friendly levels, from the basics to your first mock interview. Each one takes about
          half an hour, so go at your own pace.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-sm text-muted-foreground">
          <Unlock className="size-4" aria-hidden="true" />
          Every level is open. Jump to whatever you need.
        </p>
        <RoadmapProgress />
      </header>

      <RoadmapMap />

      <section
        aria-labelledby="arena-cta-title"
        className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-xl shadow-primary/20 sm:px-12"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-primary-foreground/15">
          <MessagesSquare className="size-7" aria-hidden="true" />
        </span>
        <div>
          <h2 id="arena-cta-title" className="font-heading text-3xl font-extrabold tracking-tight">
            Ready to test yourself?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-lg opacity-90">
            Put what you&apos;ve learned into practice with a friendly AI interviewer.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-12 bg-background px-6 text-base text-foreground hover:bg-background/90"
        >
          <Link href="/interview">
            Enter the Interview Arena
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
