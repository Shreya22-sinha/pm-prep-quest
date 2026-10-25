"use client"

import { useId } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  GraduationCap,
  Loader2,
  Lock,
  Play,
  RotateCcw,
} from "lucide-react"

import { ResultsSection } from "@/components/results/results-parts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  INTERVIEW_CATEGORY_LABELS,
  INTERVIEW_LENGTH_DETAILS,
  type InterviewCategory,
} from "@/config/interview"
import { PROGRAM_DISCLAIMER, type ProgramMock } from "@/content/programs"
import { getResourcesForTags } from "@/content/resources"
import { getTopic, getTopicHref } from "@/content/topics"
import { useStartInterview } from "@/hooks/use-start-interview"
import type { InterviewSession } from "@/lib/interview/session"
import {
  getMockStatuses,
  getProgramTrack,
  isCustomTrackKey,
  type MockStatus,
} from "@/lib/programs/track"
import { cn } from "@/lib/utils"
import { useProgressStore } from "@/store/progress-store"

const MAX_RESOURCES = 3

function categoriesLabel(categories: readonly InterviewCategory[]): string {
  return categories.map((category) => INTERVIEW_CATEGORY_LABELS[category]).join(", ")
}

function StatusIcon({ status, number }: { status: MockStatus; number: number }) {
  if (status === "complete") {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
        <CheckCircle2 className="size-5" aria-hidden="true" />
      </span>
    )
  }
  if (status === "locked") {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
        <Lock className="size-4" aria-hidden="true" />
      </span>
    )
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-heading font-bold text-primary-foreground ring-4 ring-primary/20">
      {number}
    </span>
  )
}

const STATUS_TEXT: Record<MockStatus, string> = {
  complete: "Complete",
  available: "Ready to start",
  locked: "Locked",
}

/** Program-specific prep plan and unlockable program mocks (spec 5.3 step 5.6). */
export function ProgramPlan({ session }: { session: InterviewSession }) {
  const program = session.setup.program
  const trackTitleId = useId()
  const { start, starting, error } = useStartInterview()
  const completedTopicIds = useProgressStore((state) => state.completedTopicIds)
  const unlockedBadges = useProgressStore((state) => state.unlockedBadges)
  const trackProgress = useProgressStore((state) =>
    program ? state.programTracks[getProgramTrack(program).key] : undefined
  )

  if (session.setup.path !== "program" || !program) return null

  const track = getProgramTrack(program)
  const completedMockIds = trackProgress?.completedMockIds ?? []
  const statuses = getMockStatuses(track.mocks, completedMockIds)
  const done = statuses.filter((status) => status === "complete").length
  const badgeId = isCustomTrackKey(track.key) ? "program-custom" : `program-${track.key}`
  const badgeUnlocked = Boolean(unlockedBadges[badgeId])
  const focusAreas =
    track.focusAreas.length > 0
      ? track.focusAreas
      : [...new Set(track.mocks.flatMap((mock) => mock.focusCategories))].map(
          (category) => INTERVIEW_CATEGORY_LABELS[category]
        )
  const resources = getResourcesForTags(track.recommendedTopicIds).slice(0, MAX_RESOURCES)

  const startMock = (mock: ProgramMock) =>
    void start({ ...session.setup, programMockId: mock.id, length: mock.length })

  return (
    <ResultsSection
      id="program"
      title={`Your ${track.name} prep plan`}
      description="A step-by-step plan for this program, with themed mock interviews to unlock one at a time."
      icon={GraduationCap}
    >
      <div className="space-y-6">
        <Card className="break-inside-avoid gap-0 p-6">
          <h3 className="font-heading text-lg font-bold">What it typically emphasises</h3>
          <p className="mt-1 text-muted-foreground">
            {track.description ??
              "We don't have details for this program, so this plan covers the skills most PM programs commonly look for."}
          </p>
          <ul aria-label="Focus areas" className="mt-4 flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <li key={area}>
                <Badge variant="secondary">{area}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            {PROGRAM_DISCLAIMER}
            {track.careersUrl && (
              <>
                {" "}
                <a
                  href={track.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  Official careers page
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </>
            )}
          </p>
        </Card>

        <Card className="gap-0 p-6" role="region" aria-labelledby={trackTitleId}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 id={trackTitleId} className="font-heading text-lg font-bold">
              Program track
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                badgeUnlocked
                  ? "bg-celebrate text-celebrate-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <GraduationCap className="size-3.5" aria-hidden="true" />
              {badgeUnlocked ? "Track badge earned!" : "Finish the track to earn its badge"}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium">
            {done} of {track.mocks.length} mock interviews complete
          </p>
          <Progress
            value={Math.round((done / track.mocks.length) * 100)}
            aria-label="Program track progress"
            className="mt-2 h-2.5"
          />

          <ol className="mt-6 space-y-3">
            {track.mocks.map((mock, index) => {
              const status = statuses[index] ?? "locked"
              const isThisInterview = session.setup.programMockId === mock.id
              const previous = track.mocks[index - 1]
              return (
                <li
                  key={mock.id}
                  className={cn(
                    "flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center",
                    status === "available" && "border-primary/40 bg-primary/5",
                    // Locked rows stay readable (no opacity): only the frame says "locked".
                    status === "locked" && "border-dashed bg-muted/40"
                  )}
                >
                  <StatusIcon status={status} number={index + 1} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-heading font-bold">
                      {mock.title}
                      {isThisInterview && <Badge variant="outline">This interview</Badge>}
                      <span className="sr-only">({STATUS_TEXT[status]})</span>
                    </p>
                    <p className="text-sm">{mock.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {categoriesLabel(mock.focusCategories)} ·{" "}
                      {INTERVIEW_LENGTH_DETAILS[mock.length].questionCount} questions
                    </p>
                  </div>
                  <div className="shrink-0 print:hidden">
                    {status === "available" && (
                      <Button
                        onClick={() => startMock(mock)}
                        disabled={starting}
                        aria-label={`Start mock: ${mock.title}`}
                      >
                        {starting ? (
                          <Loader2
                            data-icon="inline-start"
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Play data-icon="inline-start" aria-hidden="true" />
                        )}
                        Start mock
                      </Button>
                    )}
                    {status === "complete" && (
                      <Button
                        variant="outline"
                        onClick={() => startMock(mock)}
                        disabled={starting}
                        aria-label={`Practise again: ${mock.title}`}
                      >
                        <RotateCcw data-icon="inline-start" aria-hidden="true" />
                        Practise again
                      </Button>
                    )}
                    {status === "locked" && previous && (
                      <p className="max-w-48 text-xs text-muted-foreground">
                        Complete “{previous.title}” to unlock
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="break-inside-avoid gap-0 p-6">
            <h3 className="font-heading text-lg font-bold">Recommended roadmap levels</h3>
            <ul className="mt-3 space-y-2">
              {track.recommendedTopicIds.map((topicId) => {
                const topic = getTopic(topicId)
                const complete = completedTopicIds.includes(topicId)
                return (
                  <li key={topicId} className="flex items-center gap-2">
                    {complete ? (
                      <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <Circle
                        className="size-4 shrink-0 text-muted-foreground/60"
                        aria-hidden="true"
                      />
                    )}
                    <Link
                      href={getTopicHref(topicId)}
                      className="hover:text-primary hover:underline"
                    >
                      {topic.title}
                      <span className="sr-only">{complete ? " (complete)" : " (not started)"}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Card>
          <Card className="break-inside-avoid gap-0 p-6">
            <h3 className="font-heading text-lg font-bold">Recommended resources</h3>
            <ul className="mt-3 space-y-3">
              {resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {resource.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </ResultsSection>
  )
}
