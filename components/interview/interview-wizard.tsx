"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Loader2, PlayCircle, Sparkles } from "lucide-react"

import type { ResumeUpload } from "@/components/interview/resume-input"
import { WizardProgress } from "@/components/interview/wizard-progress"
import { LevelStep, ModeStep, PathStep, StepHeading } from "@/components/interview/wizard-steps"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  INTERVIEW_LENGTH_DETAILS,
  INTERVIEW_LEVEL_LABELS,
  INTERVIEW_MODE_LABELS,
} from "@/config/interview"
import { useInterviewHydrated } from "@/hooks/use-interview-hydrated"
import { useSpeechRecognitionSupported } from "@/hooks/use-speech-support"
import { useStartInterview } from "@/hooks/use-start-interview"
import {
  draftToSetup,
  EMPTY_DRAFT,
  validateStep,
  WIZARD_STEPS,
  type DraftErrors,
  type WizardDraft,
} from "@/lib/interview/wizard"
import { selectUnfinishedSession, useInterviewStore } from "@/store/interview-store"

function UnfinishedBanner() {
  const hydrated = useInterviewHydrated()
  const session = useInterviewStore(selectUnfinishedSession)
  const deleteSession = useInterviewStore((state) => state.deleteSession)
  if (!hydrated || !session) return null

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center">
      <PlayCircle className="size-8 shrink-0 text-primary" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-heading font-bold">You have an interview in progress</p>
        <p className="text-sm text-muted-foreground">
          {session.targetLabel} · question {session.currentIndex + 1} of {session.turns.length}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => deleteSession(session.id)}>
          Discard
        </Button>
        <Button asChild>
          <Link href={`/interview/session/${session.id}`}>Continue</Link>
        </Button>
      </div>
    </div>
  )
}

function ReviewStep({ draft, onEdit }: { draft: WizardDraft; onEdit: (step: number) => void }) {
  const setup = draftToSetup(draft)
  const length = INTERVIEW_LENGTH_DETAILS[draft.length]
  const rows: { label: string; value: string; step: number }[] = [
    {
      label: "Preparing for",
      value: setup?.program?.name ?? (draft.path === "job" ? "A specific job" : "Not chosen"),
      step: 0,
    },
    {
      label: "Resume",
      value: draft.resumeText.trim() ? "Added" : "Not added (resume feedback will be skipped)",
      step: 0,
    },
    { label: "Level", value: draft.level ? INTERVIEW_LEVEL_LABELS[draft.level] : "—", step: 1 },
    {
      label: "Style",
      value: `${INTERVIEW_MODE_LABELS[draft.mode]} · ${length.label} (${length.questionCount} questions, ${length.minutes})`,
      step: 2,
    },
  ]

  return (
    <div>
      <StepHeading
        title="Ready when you are"
        description="Check your choices, then meet your interviewer."
      />
      <dl className="divide-y rounded-2xl border bg-card">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-4 p-4">
            <dt className="w-32 shrink-0 text-sm text-muted-foreground">{row.label}</dt>
            <dd className="flex-1 font-medium">{row.value}</dd>
            <Button variant="link" className="h-auto px-0" onClick={() => onEdit(row.step)}>
              Edit<span className="sr-only"> {row.label.toLowerCase()}</span>
            </Button>
          </div>
        ))}
      </dl>
      <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        Take your time. There&apos;s a hint for every question, and you can skip any you&apos;re not
        ready for.
      </p>
    </div>
  )
}

export function InterviewWizard() {
  const { start: startInterview, starting, error: startError, clearError } = useStartInterview()
  const voiceSupported = useSpeechRecognitionSupported()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<WizardDraft>(EMPTY_DRAFT)
  const [resumeUpload, setResumeUpload] = useState<ResumeUpload | null>(null)
  const [errors, setErrors] = useState<DraftErrors>({})
  const isFirstRender = useRef(true)

  // Move focus to each new step's heading so keyboard and screen reader users follow along.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    document.getElementById("wizard-step-title")?.focus()
  }, [step])

  const update = (changes: Partial<WizardDraft>) => {
    setDraft((current) => ({ ...current, ...changes }))
    setErrors({})
  }

  const goTo = (target: number) => {
    clearError()
    setStep(target)
  }

  const next = () => {
    const stepErrors = validateStep(step, draft, { voiceSupported })
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length === 0) goTo(step + 1)
  }

  const start = async () => {
    const setup = draftToSetup(draft)
    if (!setup) {
      goTo(0)
      return
    }
    await startInterview(setup)
  }

  const isLastStep = step === WIZARD_STEPS.length - 1

  return (
    <div>
      <UnfinishedBanner />
      <WizardProgress steps={WIZARD_STEPS} current={step} />

      <Card className="mt-6 gap-0 p-6 sm:p-8">
        {step === 0 && (
          <PathStep
            draft={draft}
            errors={errors}
            update={update}
            resumeUpload={resumeUpload}
            onResumeChange={(text, upload) => {
              setResumeUpload(upload)
              update({ resumeText: text })
            }}
          />
        )}
        {step === 1 && <LevelStep draft={draft} errors={errors} update={update} />}
        {step === 2 && (
          <ModeStep draft={draft} errors={errors} update={update} voiceSupported={voiceSupported} />
        )}
        {isLastStep && <ReviewStep draft={draft} onEdit={goTo} />}

        {startError && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive"
          >
            {startError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
          {step > 0 ? (
            <Button variant="ghost" size="lg" onClick={() => goTo(step - 1)} disabled={starting}>
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              Back
            </Button>
          ) : (
            <span />
          )}
          {isLastStep ? (
            <Button size="lg" className="h-11 px-5 text-base" onClick={start} disabled={starting}>
              {starting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                  Preparing your questions…
                </>
              ) : (
                <>
                  Start interview
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </>
              )}
            </Button>
          ) : (
            <Button size="lg" className="h-11 px-5 text-base" onClick={next}>
              Continue
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          )}
        </div>
        <p aria-live="polite" className="sr-only">
          {starting
            ? "Your interviewer is preparing your questions. This can take a few seconds."
            : ""}
        </p>
      </Card>
    </div>
  )
}
