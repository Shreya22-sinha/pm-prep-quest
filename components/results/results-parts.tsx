import { useId } from "react"
import type { LucideIcon } from "lucide-react"

import { VERDICT_LABELS } from "@/config/rubric"
import type { Verdict } from "@/lib/interview/feedback-schema"
import { cn } from "@/lib/utils"

const VERDICT_STYLES: Record<Verdict, string> = {
  strong: "bg-success/15 text-success",
  partial: "bg-primary/10 text-primary",
  "needs-work": "bg-celebrate/20 text-celebrate-strong",
  skipped: "bg-muted text-muted-foreground",
}

export function VerdictBadge({ verdict, score }: { verdict: Verdict; score: number | null }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        VERDICT_STYLES[verdict]
      )}
    >
      {VERDICT_LABELS[verdict]}
      {score !== null && <span className="font-semibold">· {score}/100</span>}
    </span>
  )
}

type ResultsSectionProps = {
  id: string
  title: string
  description?: string
  icon: LucideIcon
  children: React.ReactNode
}

export function ResultsSection({
  id,
  title,
  description,
  icon: Icon,
  children,
}: ResultsSectionProps) {
  // `id` is a stable anchor for #links; the heading id is unique per instance,
  // because hidden copies of earlier results pages stay in the document.
  const titleId = `${id}-title-${useId()}`
  return (
    <section id={id} aria-labelledby={titleId} className="scroll-mt-20">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary print:hidden">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id={titleId} className="font-heading text-2xl font-extrabold tracking-tight">
            {title}
          </h2>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

/** Overall score as a ring. The number is the content; the ring is decoration. */
export function ScoreRing({ score }: { score: number | null }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const filled = score === null ? 0 : (score / 100) * circumference

  return (
    <div
      role="img"
      aria-label={
        score === null
          ? "No score: every question was skipped"
          : `Overall score ${score} out of 100`
      }
      className="relative grid size-36 shrink-0 place-items-center"
    >
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 size-full -rotate-90"
        aria-hidden="true"
      >
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="stroke-primary"
        />
      </svg>
      <span className="text-center" aria-hidden="true">
        <span className="block font-heading text-4xl font-extrabold">{score ?? "—"}</span>
        <span className="text-xs font-semibold text-muted-foreground">out of 100</span>
      </span>
    </div>
  )
}
