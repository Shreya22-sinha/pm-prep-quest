import { CheckCircle2, ListChecks, Sparkles } from "lucide-react"

import { ModelAnswer } from "@/components/results/model-answer"
import { ResultsSection, VerdictBadge } from "@/components/results/results-parts"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { INTERVIEW_CATEGORY_LABELS } from "@/config/interview"
import type { InterviewEvaluation } from "@/lib/interview/feedback-schema"
import type { InterviewSession } from "@/lib/interview/session"

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: "good" | "missing"
}) {
  if (items.length === 0) return null
  const Icon = tone === "good" ? CheckCircle2 : Sparkles
  return (
    <div>
      <h4 className="text-sm font-bold">{title}</h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Icon
              className={
                tone === "good"
                  ? "mt-0.5 size-4 shrink-0 text-success"
                  : "mt-0.5 size-4 shrink-0 text-celebrate-strong"
              }
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function QuestionReview({
  session,
  evaluation,
}: {
  session: InterviewSession
  evaluation: InterviewEvaluation
}) {
  return (
    <ResultsSection
      id="review"
      title="Question-by-question review"
      description="What worked, what to add next time, and a model answer for each question."
      icon={ListChecks}
    >
      <ol className="space-y-5">
        {session.turns.map((turn, index) => {
          const review = evaluation.reviews[index]
          if (!review) return null
          return (
            <li key={index}>
              <Card className="break-inside-avoid gap-0 p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-muted-foreground">
                    Question {index + 1}
                  </span>
                  <Badge variant="secondary">
                    {INTERVIEW_CATEGORY_LABELS[turn.question.category]}
                  </Badge>
                  <VerdictBadge verdict={review.verdict} score={review.score} />
                </div>
                <h3 className="mt-3 font-heading text-lg leading-snug font-bold">
                  {turn.question.question}
                </h3>

                <div className="mt-4 rounded-2xl bg-muted p-4">
                  <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Your answer
                  </p>
                  {turn.skipped ? (
                    <p className="mt-1 text-muted-foreground italic">Skipped</p>
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap">{turn.answer}</p>
                  )}
                  {turn.followUp && (
                    <div className="mt-3 border-l-4 border-primary/30 pl-3">
                      <p className="text-sm font-semibold text-primary">
                        Follow-up: {turn.followUp.question}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {turn.followUp.answer ?? (
                          <span className="text-muted-foreground italic">Skipped</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <FeedbackList title="What was good" items={review.whatWasGood} tone="good" />
                  <FeedbackList
                    title={turn.skipped ? "What a great answer covers" : "To make it even stronger"}
                    items={review.whatWasMissing}
                    tone="missing"
                  />
                </div>

                <ModelAnswer modelAnswer={review.modelAnswer} defaultOpen={turn.skipped} />
              </Card>
            </li>
          )
        })}
      </ol>
    </ResultsSection>
  )
}
