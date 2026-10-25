"use client"

import { Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROADMAP_TOPICS } from "@/content/topics"
import { useProgressStore } from "@/store/progress-store"

// Development-only panel for previewing XP toasts, level-ups and badges before
// the roadmap and interviews exist. ProgressDashboard only renders it in development.
export function DevTools() {
  const completedTopicIds = useProgressStore((state) => state.completedTopicIds)
  const completeTopic = useProgressStore((state) => state.completeTopic)
  const recordInterview = useProgressStore((state) => state.recordInterview)
  const awardXp = useProgressStore((state) => state.awardXp)

  const nextTopic = ROADMAP_TOPICS.find((topic) => !completedTopicIds.includes(topic.id))

  return (
    <section aria-labelledby="dev-tools-title" className="rounded-2xl border-2 border-dashed p-5">
      <h2 id="dev-tools-title" className="flex items-center gap-2 font-heading font-bold">
        <Wrench className="size-4" aria-hidden="true" />
        Developer tools
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Only visible while developing. Use these to preview celebrations.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => awardXp(40, "Test XP")}>
          Award 40 XP
        </Button>
        <Button
          variant="outline"
          disabled={!nextTopic}
          onClick={() => nextTopic && completeTopic(nextTopic.id)}
        >
          Complete next level
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            recordInterview({
              targetLabel: "Sample: Associate PM program",
              path: "program",
              level: "fresher",
              mode: "voice",
              questionCount: 5,
              overallScore: 85,
            })
          }
        >
          Log sample interview
        </Button>
      </div>
    </section>
  )
}
