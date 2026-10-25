import Link from "next/link"
import { ArrowRight, CheckCircle2, Circle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getTopicHref, ROADMAP_TOPICS } from "@/content/topics"
import { cn } from "@/lib/utils"

export function TopicProgress({ completedTopicIds }: { completedTopicIds: string[] }) {
  const completed = new Set(completedTopicIds)
  const done = ROADMAP_TOPICS.filter((topic) => completed.has(topic.id)).length
  const percent = Math.round((done / ROADMAP_TOPICS.length) * 100)

  return (
    <Card role="region" aria-labelledby="topics-title" className="gap-0 p-6">
      <h2 id="topics-title" className="font-heading text-xl font-bold">
        Roadmap levels
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {done} of {ROADMAP_TOPICS.length} complete
        {done === 0 ? ". Your first level is waiting!" : ". Great pace!"}
      </p>
      <Progress value={percent} aria-label="Roadmap completion" className="mt-4 h-2.5" />

      <ol className="mt-6 space-y-2">
        {ROADMAP_TOPICS.map((topic, index) => {
          const isDone = completed.has(topic.id)
          return (
            <li key={topic.id} className="flex items-center gap-3 text-sm">
              {isDone ? (
                <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              )}
              <Link
                href={getTopicHref(topic.id)}
                className={cn(
                  "rounded hover:text-primary hover:underline",
                  isDone ? "font-semibold" : "text-muted-foreground"
                )}
              >
                {index + 1}. {topic.title}
                <span className="sr-only">{isDone ? " (complete)" : " (not started)"}</span>
              </Link>
            </li>
          )
        })}
      </ol>

      <Button asChild variant="outline" className="mt-6 h-10 self-start px-4">
        <Link href="/roadmap">
          {done === 0 ? "Start the roadmap" : "Continue the roadmap"}
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </Button>
    </Card>
  )
}
