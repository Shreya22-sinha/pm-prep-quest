"use client"

import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ROADMAP_TOPICS } from "@/content/topics"
import { useTopicStatuses } from "@/hooks/use-topic-statuses"
import { getRoadmapProgressMessage } from "@/lib/roadmap"

export function RoadmapProgress() {
  const { hydrated, completedCount } = useTopicStatuses()
  const total = ROADMAP_TOPICS.length

  if (!hydrated) {
    return (
      <div aria-hidden="true" className="mx-auto mt-8 max-w-md space-y-3">
        <Skeleton className="mx-auto h-5 w-64" />
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <p className="text-center font-semibold" aria-live="polite">
        {getRoadmapProgressMessage(completedCount, total)}
      </p>
      <Progress
        value={Math.round((completedCount / total) * 100)}
        aria-label="Roadmap progress"
        className="mt-3 h-3"
      />
    </div>
  )
}
