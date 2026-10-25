import { Lightbulb, PartyPopper, Quote } from "lucide-react"

import { ResultsSection } from "@/components/results/results-parts"
import { Card } from "@/components/ui/card"
import type { InterviewEvaluation } from "@/lib/interview/feedback-schema"

export function PraiseSection({ evaluation }: { evaluation: InterviewEvaluation }) {
  return (
    <ResultsSection
      id="great"
      title="What you did great"
      description="Real moments from your answers worth being proud of."
      icon={PartyPopper}
    >
      {evaluation.strengths.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {evaluation.strengths.map((strength, index) => (
            <li key={index}>
              <Card className="h-full break-inside-avoid gap-0 border-l-4 border-l-success p-5">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Question {strength.questionNumber}
                </p>
                <blockquote className="mt-2 flex gap-2 font-medium">
                  <Quote className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span>“{strength.quote}”</span>
                </blockquote>
                <p className="mt-2 text-muted-foreground">{strength.why}</p>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-muted p-5">
          You showed up and practised, and that&apos;s the hardest step. Answer a question or two
          next time and we&apos;ll show you exactly what you nailed.
        </p>
      )}

      {evaluation.focusAreas.length > 0 && (
        <div className="mt-6 break-inside-avoid rounded-2xl bg-celebrate/15 p-5">
          <h3 className="flex items-center gap-2 font-heading font-bold">
            <Lightbulb className="size-5 text-celebrate-strong" aria-hidden="true" />
            Your next learning moments
          </h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            {evaluation.focusAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      )}
    </ResultsSection>
  )
}
