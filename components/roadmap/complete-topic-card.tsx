"use client"

import { useId } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { XP_REWARDS } from "@/config/gamification"
import { getTopicHref, type RoadmapTopic, type TopicId } from "@/content/topics"
import { useProgressHydrated } from "@/hooks/use-progress-hydrated"
import { useProgressStore } from "@/store/progress-store"

type CompleteTopicCardProps = {
  topicId: TopicId
  estimatedMinutes: number
  nextTopic: RoadmapTopic | null
}

export function CompleteTopicCard({
  topicId,
  estimatedMinutes,
  nextTopic,
}: CompleteTopicCardProps) {
  // Unique per instance: earlier lesson pages stay mounted (hidden) after navigating.
  const titleId = useId()
  const hydrated = useProgressHydrated()
  const isComplete = useProgressStore((state) => state.completedTopicIds.includes(topicId))
  const completeTopic = useProgressStore((state) => state.completeTopic)

  const nextLink = nextTopic && (
    <Button asChild variant={isComplete ? "default" : "outline"} className="mt-3 h-10 w-full">
      <Link href={getTopicHref(nextTopic.id)}>
        Next: {nextTopic.shortTitle}
        <ArrowRight data-icon="inline-end" aria-hidden="true" />
      </Link>
    </Button>
  )

  return (
    <Card role="region" aria-labelledby={titleId} className="gap-0 p-6">
      <h2 id={titleId} className="font-heading text-lg font-bold">
        Your progress
      </h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="size-4" aria-hidden="true" />
        About {estimatedMinutes} minutes, including the resources
      </p>

      <div className="mt-5" aria-live="polite">
        {!hydrated ? (
          <Skeleton className="h-11 w-full rounded-lg" />
        ) : isComplete ? (
          <p className="flex items-center gap-2 rounded-xl bg-success/10 p-3 font-semibold text-success">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            Level complete. Nice work!
          </p>
        ) : (
          <Button
            size="lg"
            className="h-11 w-full text-base"
            onClick={() => completeTopic(topicId)}
          >
            <Sparkles data-icon="inline-start" aria-hidden="true" />
            Mark as complete · +{XP_REWARDS.topicCompleted} XP
          </Button>
        )}
      </div>

      {nextLink}
    </Card>
  )
}
