"use client"

import { ROADMAP_TOPICS } from "@/content/topics"
import { useProgressHydrated } from "@/hooks/use-progress-hydrated"
import { getLoadingStatuses, getTopicStatuses } from "@/lib/roadmap"
import { useProgressStore } from "@/store/progress-store"

export function useTopicStatuses() {
  const hydrated = useProgressHydrated()
  const completedTopicIds = useProgressStore((state) => state.completedTopicIds)

  return {
    hydrated,
    statuses: hydrated ? getTopicStatuses(completedTopicIds) : getLoadingStatuses(),
    completedCount: hydrated
      ? ROADMAP_TOPICS.filter((topic) => completedTopicIds.includes(topic.id)).length
      : 0,
  }
}
