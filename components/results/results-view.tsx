"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Bot, PlayCircle } from "lucide-react"

import { SessionNotFound, SessionSkeleton } from "@/components/interview/interview-session"
import { ProgramPlan } from "@/components/programs/program-plan"
import { PraiseSection } from "@/components/results/praise-section"
import { PracticeSection } from "@/components/results/practice-section"
import { QuestionReview } from "@/components/results/question-review"
import { ResourcesSection } from "@/components/results/resources-section"
import { ResumeMakeover } from "@/components/results/resume-makeover"
import { ScoreSummary } from "@/components/results/score-summary"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useInterviewHydrated } from "@/hooks/use-interview-hydrated"
import { useOnceRequest } from "@/hooks/use-once-request"
import { useProgressHydrated } from "@/hooks/use-progress-hydrated"
import { apiPost } from "@/lib/api/client"
import { fireConfetti } from "@/lib/gamification/confetti"
import { interviewEvaluationSchema } from "@/lib/interview/feedback-schema"
import { awardInterviewRewards, buildEvaluateRequest } from "@/lib/interview/results"
import { findVisibleById, scrollToSection } from "@/lib/scroll"
import { useInterviewStore } from "@/store/interview-store"

const SECTIONS = [
  { id: "great", label: "What you did great" },
  { id: "review", label: "Question review" },
  { id: "practice", label: "Practice" },
  { id: "resources", label: "Resources" },
  { id: "program", label: "Program plan", programOnly: true },
  { id: "resume", label: "Resume makeover" },
]

/** Results render after saved data loads, so jump to a #section link once it exists. */
function useScrollToHash(ready: boolean) {
  useEffect(() => {
    if (!ready || !window.location.hash) return
    findVisibleById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView()
  }, [ready])
}

function Evaluating({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <Card className="items-center gap-0 p-10 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Bot className={error ? "size-8" : "size-8 motion-safe:animate-pulse"} aria-hidden="true" />
      </span>
      {error ? (
        <div role="alert">
          <h1 className="mt-6 font-heading text-2xl font-extrabold">
            We couldn&apos;t finish your feedback
          </h1>
          <p className="mt-2 max-w-md text-muted-foreground">{error}</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Your answers are safe. Nothing is lost.
          </p>
          <Button size="lg" className="mt-6 h-11 px-5" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : (
        <div role="status" aria-live="polite">
          <h1 className="mt-6 font-heading text-2xl font-extrabold">
            Your interviewer is reviewing your answers…
          </h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Scoring each answer, picking out your best moments and writing model answers. This
            usually takes 10–30 seconds.
          </p>
        </div>
      )}
    </Card>
  )
}

function NotFinished({ id }: { id: string }) {
  return (
    <Card className="items-center gap-0 p-10 text-center">
      <PlayCircle className="size-10 text-primary" aria-hidden="true" />
      <h1 className="mt-4 font-heading text-2xl font-extrabold">
        This interview isn&apos;t finished yet
      </h1>
      <p className="mt-2 text-muted-foreground">Finish it to see your score and feedback.</p>
      <Button asChild size="lg" className="mt-6 h-11 px-5">
        <Link href={`/interview/session/${id}`}>Continue interview</Link>
      </Button>
    </Card>
  )
}

export function ResultsView({ id }: { id: string }) {
  const interviewsReady = useInterviewHydrated()
  // Rewards are written to saved progress, so wait for it to load first.
  const progressReady = useProgressHydrated()
  const session = useInterviewStore((state) => state.sessions[id])
  const saveEvaluation = useInterviewStore((state) => state.saveEvaluation)

  const needsEvaluation =
    interviewsReady && progressReady && !!session?.completedAt && session.evaluation === null

  const { error, retry } = useOnceRequest(needsEvaluation ? `evaluate:${id}` : null, async () => {
    const current = useInterviewStore.getState().sessions[id]
    if (!current || current.evaluation) return
    const evaluation = await apiPost(
      "/api/interview/evaluate",
      buildEvaluateRequest(current),
      interviewEvaluationSchema
    )
    const rewards = awardInterviewRewards(current, evaluation)
    saveEvaluation(id, evaluation, rewards)
    if (evaluation.overallScore !== null) void fireConfetti()
  })

  useScrollToHash(Boolean(session?.evaluation))

  if (!interviewsReady || !progressReady) return <SessionSkeleton />
  if (!session) return <SessionNotFound />
  if (!session.completedAt) return <NotFinished id={id} />
  if (!session.evaluation) return <Evaluating error={error} onRetry={retry} />

  const evaluation = session.evaluation
  const isProgram = session.setup.path === "program"

  return (
    <div className="space-y-14">
      <ScoreSummary session={session} evaluation={evaluation} />

      <nav aria-label="Results sections" className="-mt-6 print:hidden">
        <ul className="flex flex-wrap gap-2">
          {SECTIONS.filter((section) => isProgram || !section.programOnly).map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToSection(section.id)
                }}
                className="inline-block rounded-full border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <PraiseSection evaluation={evaluation} />
      <QuestionReview session={session} evaluation={evaluation} />
      <PracticeSection session={session} evaluation={evaluation} />
      <ResourcesSection evaluation={evaluation} />
      <ProgramPlan session={session} />
      <ResumeMakeover session={session} />
    </div>
  )
}
