"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Dumbbell, Play } from "lucide-react"

import { PracticeDialog } from "@/components/results/practice-dialog"
import { ResultsSection } from "@/components/results/results-parts"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CATEGORY_TOPIC, INTERVIEW_CATEGORY_LABELS } from "@/config/interview"
import { getTopic, getTopicHref } from "@/content/topics"
import type { InterviewEvaluation } from "@/lib/interview/feedback-schema"
import type { InterviewSession, PracticeAttempt } from "@/lib/interview/session"
import { useInterviewStore } from "@/store/interview-store"
import { useProgressStore } from "@/store/progress-store"

export function PracticeSection({
  session,
  evaluation,
}: {
  session: InterviewSession
  evaluation: InterviewEvaluation
}) {
  const savePracticeAttempt = useInterviewStore((state) => state.savePracticeAttempt)
  const recordPractice = useProgressStore((state) => state.recordPractice)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const indexed = evaluation.practiceQuestions.map((question, index) => ({ question, index }))
  const openQuestion = openIndex === null ? null : (evaluation.practiceQuestions[openIndex] ?? null)

  const handleFeedback = (attempt: PracticeAttempt) => {
    if (openIndex === null) return
    const key = String(openIndex)
    // XP for the first attempt at each question only.
    if (!session.practice[key]) recordPractice("practiceQuestion")
    savePracticeAttempt(session.id, key, attempt)
  }

  return (
    <ResultsSection
      id="practice"
      title="Practice more"
      description="Fresh questions for the areas with the most room to grow. Each one is a quick, low-pressure rep."
      icon={Dumbbell}
    >
      {indexed.length === 0 ? (
        <p className="rounded-2xl bg-muted p-5">
          No extra practice questions this time. Try another interview to keep sharpening.
        </p>
      ) : (
        <div className="space-y-6">
          {evaluation.practiceCategories.map((category) => {
            const questions = indexed.filter((item) => item.question.category === category)
            if (questions.length === 0) return null
            const topic = getTopic(CATEGORY_TOPIC[category])
            return (
              <Card key={category} className="break-inside-avoid gap-0 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold">
                    {INTERVIEW_CATEGORY_LABELS[category]}
                  </h3>
                  <Link
                    href={getTopicHref(topic.id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline print:hidden"
                  >
                    Revisit the {topic.shortTitle} level
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <ol className="mt-4 space-y-3">
                  {questions.map(({ question, index }) => {
                    const attempt = session.practice[String(index)]
                    return (
                      <li
                        key={index}
                        className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center"
                      >
                        <p className="flex-1">{question.question}</p>
                        {attempt && (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-success">
                            <CheckCircle2 className="size-4" aria-hidden="true" />
                            Practised · {attempt.feedback.score}
                          </span>
                        )}
                        <Button
                          variant={attempt ? "outline" : "default"}
                          onClick={() => setOpenIndex(index)}
                          className="print:hidden"
                          aria-label={`${attempt ? "Review" : "Practise"}: ${question.question}`}
                        >
                          <Play data-icon="inline-start" aria-hidden="true" />
                          {attempt ? "Review" : "Practise"}
                        </Button>
                      </li>
                    )
                  })}
                </ol>
              </Card>
            )
          })}
        </div>
      )}

      <PracticeDialog
        key={openIndex ?? "closed"}
        question={openQuestion}
        level={session.setup.level}
        previousAttempt={openIndex === null ? undefined : session.practice[String(openIndex)]}
        onClose={() => setOpenIndex(null)}
        onFeedback={handleFeedback}
      />
    </ResultsSection>
  )
}
