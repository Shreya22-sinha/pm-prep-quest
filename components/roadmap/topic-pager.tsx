import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { getTopicHref, getTopicIndex, type RoadmapTopic } from "@/content/topics"

function PagerLink({ topic, direction }: { topic: RoadmapTopic; direction: "previous" | "next" }) {
  const isNext = direction === "next"
  return (
    <Link
      href={getTopicHref(topic.id)}
      className={`group flex flex-1 flex-col rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${isNext ? "items-end text-right" : ""}`}
    >
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        {!isNext && <ArrowLeft className="size-4" aria-hidden="true" />}
        {isNext ? "Next level" : "Previous level"}
        {isNext && <ArrowRight className="size-4" aria-hidden="true" />}
      </span>
      <span className="mt-1 font-heading font-bold group-hover:text-primary">
        Level {getTopicIndex(topic.id) + 1}: {topic.shortTitle}
      </span>
    </Link>
  )
}

export function TopicPager({
  previous,
  next,
}: {
  previous: RoadmapTopic | null
  next: RoadmapTopic | null
}) {
  return (
    <nav
      aria-label="Level navigation"
      className="mt-16 flex flex-col gap-3 border-t pt-8 sm:flex-row"
    >
      {previous ? <PagerLink topic={previous} direction="previous" /> : <span className="flex-1" />}
      {next && <PagerLink topic={next} direction="next" />}
    </nav>
  )
}
