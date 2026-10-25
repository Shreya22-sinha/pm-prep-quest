import Link from "next/link"
import { ArrowRight, MessagesSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HIGH_SCORE_THRESHOLD } from "@/config/gamification"
import { INTERVIEW_LEVEL_LABELS, INTERVIEW_MODE_LABELS } from "@/config/interview"
import { formatDate, pluralize } from "@/lib/format"
import type { InterviewRecord } from "@/lib/gamification/schema"
import { cn } from "@/lib/utils"

function scoreClassName(score: number): string {
  if (score >= HIGH_SCORE_THRESHOLD) return "bg-success/15 text-success"
  if (score >= 50) return "bg-primary/10 text-primary"
  return "bg-celebrate/20 text-celebrate-strong"
}

export function InterviewHistory({ interviews }: { interviews: InterviewRecord[] }) {
  return (
    <Card role="region" aria-labelledby="interviews-title" className="gap-0 p-6">
      <h2 id="interviews-title" className="font-heading text-xl font-bold">
        Interview history
      </h2>

      {interviews.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MessagesSquare className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-4 font-heading text-lg font-bold">No interviews yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Your mock interview scores will show up here, so you can see yourself improve.
          </p>
          <Button asChild className="mt-6 h-10 px-4">
            <Link href="/interview">
              Enter the Interview Arena
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            {pluralize(interviews.length, "interview")} completed. Every one makes you sharper.
          </p>
          <ol className="mt-6 space-y-3">
            {interviews.map((interview) => (
              <li key={interview.id} className="flex items-center gap-4 rounded-2xl border p-4">
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-xl font-heading text-lg font-extrabold",
                    scoreClassName(interview.overallScore)
                  )}
                >
                  <span aria-hidden="true">{Math.round(interview.overallScore)}</span>
                  <span className="sr-only">
                    Score {Math.round(interview.overallScore)} out of 100
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/interview/results/${interview.id}`}
                    className="font-semibold break-words hover:text-primary hover:underline"
                  >
                    {interview.targetLabel}
                    <span className="sr-only"> (view results)</span>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(interview.completedAt)} · {INTERVIEW_LEVEL_LABELS[interview.level]}{" "}
                    · {INTERVIEW_MODE_LABELS[interview.mode]} ·{" "}
                    {pluralize(interview.questionCount, "question")}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-celebrate-strong">
                  +{interview.xpEarned} XP
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </Card>
  )
}
