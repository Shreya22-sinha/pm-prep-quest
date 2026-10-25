"use client"

import Link from "next/link"
import { Download, Dumbbell, Loader2, Map, RotateCcw, Sparkles, Trophy } from "lucide-react"

import { CategoryBars } from "@/components/results/category-bars"
import { ScoreRing } from "@/components/results/results-parts"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { INTERVIEW_LEVEL_LABELS } from "@/config/interview"
import { useStartInterview } from "@/hooks/use-start-interview"
import { getBadge } from "@/lib/gamification/badges"
import type { InterviewEvaluation } from "@/lib/interview/feedback-schema"
import { countAnswered, type InterviewSession } from "@/lib/interview/session"
import { scrollToSection } from "@/lib/scroll"

type ScoreSummaryProps = {
  session: InterviewSession
  evaluation: InterviewEvaluation
}

export function ScoreSummary({ session, evaluation }: ScoreSummaryProps) {
  const { start, starting, error } = useStartInterview()
  const answered = countAnswered(session)
  const rewards = session.rewards

  return (
    <Card className="gap-0 p-6 sm:p-10">
      <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:text-left">
        <ScoreRing score={evaluation.overallScore} />
        <div className="flex-1">
          <p className="flex items-center justify-center gap-2 text-sm font-bold tracking-wider text-primary uppercase md:justify-start">
            <Trophy className="size-4" aria-hidden="true" />
            Interview complete
          </p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {session.targetLabel}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {INTERVIEW_LEVEL_LABELS[session.setup.level]} · {answered} of {session.turns.length}{" "}
            questions answered
          </p>
          <p className="mt-4 text-lg leading-relaxed">{evaluation.summary}</p>

          {rewards && (rewards.xpEarned > 0 || rewards.badgeIds.length > 0) && (
            <ul
              aria-label="Rewards"
              className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start"
            >
              {rewards.xpEarned > 0 && (
                <li className="inline-flex items-center gap-1.5 rounded-full bg-celebrate px-3 py-1 text-sm font-extrabold text-celebrate-foreground">
                  <Sparkles className="size-4" aria-hidden="true" />+{rewards.xpEarned} XP earned
                </li>
              )}
              {rewards.badgeIds.map((badgeId) => {
                const badge = getBadge(badgeId)
                if (!badge) return null
                const Icon = badge.icon
                return (
                  <li
                    key={badgeId}
                    className="inline-flex items-center gap-1.5 rounded-full border border-celebrate/50 bg-celebrate/10 px-3 py-1 text-sm font-semibold"
                  >
                    <Icon className="size-4 text-celebrate-strong" aria-hidden="true" />
                    Badge: {badge.name}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {evaluation.categoryScores.length > 0 && (
        <div className="mt-10 border-t pt-8">
          <h2 className="font-heading text-lg font-bold">Scores by category</h2>
          <div className="mt-4">
            <CategoryBars scores={evaluation.categoryScores} />
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3 border-t pt-8 print:hidden">
        <Button
          size="lg"
          className="h-11 w-full px-5 sm:w-auto"
          onClick={() => void start(session.setup)}
          disabled={starting}
        >
          {starting ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
          ) : (
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
          )}
          {starting ? "Preparing new questions…" : "Retry interview"}
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11 w-full px-5 sm:w-auto">
          <a
            href="#practice"
            onClick={(event) => {
              event.preventDefault()
              scrollToSection("practice")
            }}
          >
            <Dumbbell data-icon="inline-start" aria-hidden="true" />
            Practise weak areas
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11 w-full px-5 sm:w-auto">
          <Link href="/roadmap">
            <Map data-icon="inline-start" aria-hidden="true" />
            Back to roadmap
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="h-11 w-full px-5 sm:w-auto"
          onClick={() => window.print()}
        >
          <Download data-icon="inline-start" aria-hidden="true" />
          Download as PDF
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </Card>
  )
}
