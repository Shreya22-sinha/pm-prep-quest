import { ROADMAP_TOPICS, type TopicId } from "@/content/topics"

/** "loading" is used until saved progress is read, so the map never flashes the wrong state. */
export type TopicStatus = "complete" | "current" | "upcoming" | "loading"

export function getTopicStatuses(
  completedTopicIds: readonly string[]
): Record<TopicId, TopicStatus> {
  const completed = new Set(completedTopicIds)
  // "Current" is the first unfinished level. Locks on later levels are purely
  // visual: every level stays open (spec 5.2).
  const currentId = ROADMAP_TOPICS.find((topic) => !completed.has(topic.id))?.id
  return Object.fromEntries(
    ROADMAP_TOPICS.map((topic) => [
      topic.id,
      completed.has(topic.id) ? "complete" : topic.id === currentId ? "current" : "upcoming",
    ])
  ) as Record<TopicId, TopicStatus>
}

export function getLoadingStatuses(): Record<TopicId, TopicStatus> {
  return Object.fromEntries(ROADMAP_TOPICS.map((topic) => [topic.id, "loading"])) as Record<
    TopicId,
    TopicStatus
  >
}

/** Friendly progress line, e.g. "3 of 12 levels complete — great pace!" */
export function getRoadmapProgressMessage(completed: number, total: number): string {
  const count = `${completed} of ${total} levels complete`
  if (completed === 0) return `${count}. Your adventure starts here!`
  if (completed >= total) return `${count}. You've conquered the roadmap!`
  if (completed <= 2) return `${count} — great start!`
  if (completed >= total - 2) return `${count} — almost there!`
  return `${count} — great pace!`
}
