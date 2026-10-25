"use client"

import { useState } from "react"
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react"

import { AnswerForm } from "@/components/interview/answer-form"
import { ModelAnswer } from "@/components/results/model-answer"
import { VerdictBadge } from "@/components/results/results-parts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { INTERVIEW_CATEGORY_LABELS, type InterviewLevel } from "@/config/interview"
import { XP_REWARDS } from "@/config/gamification"
import { ApiRequestError, apiPost } from "@/lib/api/client"
import {
  practiceFeedbackSchema,
  type PracticeQuestion,
  type PracticeRequest,
} from "@/lib/interview/feedback-schema"
import type { PracticeAttempt } from "@/lib/interview/session"

type PracticeDialogProps = {
  question: PracticeQuestion | null
  level: InterviewLevel
  previousAttempt: PracticeAttempt | undefined
  onClose: () => void
  onFeedback: (attempt: PracticeAttempt) => void
}

/** Single-question practice mode with AI feedback (spec 5.3 step 5.4). */
export function PracticeDialog({
  question,
  level,
  previousAttempt,
  onClose,
  onFeedback,
}: PracticeDialogProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(!previousAttempt)

  const submit = async (answer: string) => {
    if (!question) return
    setPending(true)
    setError(null)
    const request: PracticeRequest = {
      level,
      category: question.category,
      question: question.question,
      answer,
    }
    try {
      const feedback = await apiPost("/api/practice/evaluate", request, practiceFeedbackSchema)
      onFeedback({ answer, feedback, practisedAt: new Date().toISOString() })
      setShowForm(false)
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : "Something went wrong.")
    } finally {
      setPending(false)
    }
  }

  const attempt = showForm ? undefined : previousAttempt

  return (
    <Dialog open={question !== null} onOpenChange={(open) => !open && onClose()}>
      {question && (
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <Badge variant="secondary" className="w-fit">
              Practice · {INTERVIEW_CATEGORY_LABELS[question.category]}
            </Badge>
            <DialogTitle className="font-heading text-xl leading-snug font-bold">
              {question.question}
            </DialogTitle>
            <DialogDescription>
              {attempt
                ? "Here's your feedback. Every attempt makes the next one easier."
                : `Answer like you would in the interview. First attempt earns +${XP_REWARDS.practiceQuestion} XP.`}
            </DialogDescription>
          </DialogHeader>

          {attempt ? (
            <div aria-live="polite">
              <div className="flex flex-wrap items-center gap-2">
                <VerdictBadge verdict={attempt.feedback.verdict} score={attempt.feedback.score} />
              </div>
              <p className="mt-3 flex gap-2 rounded-2xl bg-celebrate/15 p-3">
                <Sparkles
                  className="mt-0.5 size-4 shrink-0 text-celebrate-strong"
                  aria-hidden="true"
                />
                {attempt.feedback.encouragement}
              </p>
              {attempt.feedback.whatWasGood.length > 0 && (
                <>
                  <h3 className="mt-4 text-sm font-bold">What was good</h3>
                  <ul className="mt-2 space-y-1.5">
                    {attempt.feedback.whatWasGood.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-success"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {attempt.feedback.whatWasMissing.length > 0 && (
                <>
                  <h3 className="mt-4 text-sm font-bold">To make it even stronger</h3>
                  <ul className="mt-2 space-y-1.5">
                    {attempt.feedback.whatWasMissing.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Sparkles
                          className="mt-0.5 size-4 shrink-0 text-celebrate-strong"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <ModelAnswer modelAnswer={attempt.feedback.modelAnswer} />
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(true)}>
                  <RotateCcw data-icon="inline-start" aria-hidden="true" />
                  Try again
                </Button>
                <Button onClick={onClose}>Done</Button>
              </div>
            </div>
          ) : (
            <div>
              <AnswerForm
                label="Your answer"
                submitLabel="Get feedback"
                pending={pending}
                onSubmit={(answer) => void submit(answer)}
                initialAnswer={previousAttempt?.answer}
              />
              {error && (
                <p role="alert" className="mt-3 text-sm font-medium text-destructive">
                  {error}
                </p>
              )}
              <p aria-live="polite" className="sr-only">
                {pending ? "Your coach is reading your answer." : ""}
              </p>
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  )
}
