"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Lightbulb, MicOff, Save, SearchX, Timer, Volume2, VolumeX } from "lucide-react"

import { AnswerForm } from "@/components/interview/answer-form"
import { InterviewerBubble } from "@/components/interview/interviewer-bubble"
import { SoftTimer } from "@/components/interview/soft-timer"
import { VoiceAnswerForm } from "@/components/interview/voice-answer-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ENCOURAGEMENTS,
  INTERVIEW_CATEGORY_LABELS,
  INTERVIEW_LEVEL_LABELS,
  INTERVIEW_MODE_LABELS,
} from "@/config/interview"
import { SUPPORTED_BROWSERS_HINT } from "@/config/voice"
import { useInterviewHydrated } from "@/hooks/use-interview-hydrated"
import { useSpeechRecognitionSupported } from "@/hooks/use-speech-support"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { ApiRequestError, apiPost } from "@/lib/api/client"
import { answerResponseSchema, type AnswerRequest } from "@/lib/interview/schema"
import type { InterviewSession as Session } from "@/lib/interview/session"
import { useInterviewStore } from "@/store/interview-store"
import { useProgressStore } from "@/store/progress-store"

function pickEncouragement(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)] ?? ENCOURAGEMENTS[0]
}

export function SessionSkeleton() {
  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Loading your interview…</span>
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export function SessionNotFound() {
  return (
    <Card className="items-center gap-0 p-10 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="mt-4 font-heading text-2xl font-extrabold">
        We couldn&apos;t find that interview
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        It may have been started in another browser, or cleared from this one. Interviews are saved
        on the device you use.
      </p>
      <Button asChild size="lg" className="mt-6 h-11 px-5">
        <Link href="/interview">Start a new interview</Link>
      </Button>
    </Card>
  )
}

function RedirectToResults({ id }: { id: string }) {
  const router = useRouter()
  useEffect(() => {
    router.replace(`/interview/results/${id}`)
  }, [router, id])
  return <SessionSkeleton />
}

function ActiveInterview({ session }: { session: Session }) {
  const router = useRouter()
  const index = session.currentIndex
  const turn = session.turns[index]
  const total = session.turns.length

  const markHintUsed = useInterviewStore((state) => state.markHintUsed)
  const recordAnswer = useInterviewStore((state) => state.recordAnswer)
  const recordFollowUp = useInterviewStore((state) => state.recordFollowUp)
  const skipQuestion = useInterviewStore((state) => state.skipQuestion)
  const advance = useInterviewStore((state) => state.advance)
  const recordPractice = useProgressStore((state) => state.recordPractice)
  const setMode = useInterviewStore((state) => state.setMode)

  // Voice mode: the interviewer reads questions aloud; answers are spoken when supported.
  const voiceMode = session.setup.mode === "voice"
  const recognitionSupported = useSpeechRecognitionSupported()
  const { speak, cancel: stopSpeaking, speaking, supported: canSynthesise } = useSpeechSynthesis()
  const [voiceOn, setVoiceOn] = useState(true)
  const interviewerSpeaks = voiceMode && canSynthesise && voiceOn
  const textToSpeak =
    turn?.status === "answering"
      ? index === 0
        ? `${session.greeting} ${turn.question.question}`
        : turn.question.question
      : turn?.status === "follow-up"
        ? (turn.followUp?.question ?? "")
        : ""

  useEffect(() => {
    if (interviewerSpeaks && textToSpeak) speak(textToSpeak)
  }, [interviewerSpeaks, textToSpeak, speak])

  const [pending, setPending] = useState(false)
  const [failedAnswer, setFailedAnswer] = useState<{ answer: string; message: string } | null>(null)
  const [showTimer, setShowTimer] = useState(false)
  const questionRef = useRef<HTMLHeadingElement>(null)
  // Unique per instance: an earlier interview's page can stay mounted (hidden).
  const questionId = useId()
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  // New question: move focus to it so keyboard and screen reader users start there.
  useEffect(() => {
    questionRef.current?.focus()
  }, [index])

  useEffect(() => {
    if (turn?.status === "done") nextButtonRef.current?.focus()
  }, [turn?.status])

  if (!turn) return <SessionNotFound />

  const submitAnswer = async (answer: string) => {
    setPending(true)
    setFailedAnswer(null)
    const request: AnswerRequest = {
      level: session.setup.level,
      targetLabel: session.targetLabel,
      question: { category: turn.question.category, question: turn.question.question },
      answer,
      followUpQuestion: null,
    }
    try {
      const reaction = await apiPost("/api/interview/answer", request, answerResponseSchema)
      recordAnswer(session.id, index, answer, reaction)
    } catch (error) {
      setFailedAnswer({
        answer,
        message: error instanceof ApiRequestError ? error.message : "Something went wrong.",
      })
    } finally {
      setPending(false)
    }
  }

  const continueWithoutReaction = () => {
    if (!failedAnswer) return
    recordAnswer(session.id, index, failedAnswer.answer, {
      followUp: null,
      encouragement: pickEncouragement(),
    })
    setFailedAnswer(null)
  }

  const isLast = index === total - 1
  const answersBySpeech = voiceMode && recognitionSupported

  /** The voice or written answer form, depending on the interview's mode and the browser. */
  const answerForm = (props: {
    key: string
    label: string
    submitLabel: string
    pending: boolean
    onSubmit: (answer: string) => void
    skip: { label: string; onSkip: () => void }
  }) => {
    const { key, ...rest } = props
    return answersBySpeech ? (
      <VoiceAnswerForm key={key} {...rest} onListenStart={stopSpeaking} />
    ) : (
      <AnswerForm key={key} {...rest} />
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-bold">
            <span className="sr-only">Mock interview: </span>
            {session.targetLabel}
          </h1>
          <p className="text-sm text-muted-foreground">
            {INTERVIEW_LEVEL_LABELS[session.setup.level]} ·{" "}
            {INTERVIEW_MODE_LABELS[session.setup.mode]} interview
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/interview">
            <Save data-icon="inline-start" aria-hidden="true" />
            Save &amp; exit
          </Link>
        </Button>
        <div className="w-full">
          <div className="flex justify-between text-sm font-medium">
            <span>
              Question {index + 1} of {total}
            </span>
            <span className="hidden text-muted-foreground sm:inline">
              Your progress saves automatically
            </span>
          </div>
          <Progress
            value={Math.round((index / total) * 100)}
            aria-label="Interview progress"
            className="mt-2 h-2.5"
          />
        </div>
      </header>

      {index === 0 && turn.status === "answering" && (
        <InterviewerBubble>{session.greeting}</InterviewerBubble>
      )}

      <Card role="region" aria-labelledby={questionId} className="gap-0 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge>{INTERVIEW_CATEGORY_LABELS[turn.question.category]}</Badge>
            <span className="text-sm text-muted-foreground">
              Question {index + 1} of {total}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {voiceMode && canSynthesise && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!textToSpeak}
                  onClick={() => speak(textToSpeak)}
                >
                  <Volume2 data-icon="inline-start" aria-hidden="true" />
                  {speaking ? "Speaking…" : "Replay"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={!voiceOn}
                  onClick={() => {
                    if (voiceOn) stopSpeaking()
                    setVoiceOn((value) => !value)
                  }}
                >
                  {voiceOn ? (
                    <VolumeX data-icon="inline-start" aria-hidden="true" />
                  ) : (
                    <Volume2 data-icon="inline-start" aria-hidden="true" />
                  )}
                  {voiceOn ? "Mute interviewer" : "Unmute interviewer"}
                </Button>
              </>
            )}
            {turn.status !== "done" && (
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={showTimer}
                onClick={() => setShowTimer((value) => !value)}
              >
                <Timer data-icon="inline-start" aria-hidden="true" />
                {showTimer ? "Hide timer" : "Show timer"}
              </Button>
            )}
          </div>
        </div>

        <div aria-live="polite">
          <h2
            id={questionId}
            ref={questionRef}
            tabIndex={-1}
            className="mt-4 font-heading text-2xl leading-snug font-bold text-balance focus:outline-none"
          >
            {turn.question.question}
          </h2>
        </div>

        {showTimer && turn.status !== "done" && (
          <div className="mt-3">
            <SoftTimer key={index} />
          </div>
        )}

        {turn.status !== "done" && (
          <div className="mt-5">
            {turn.hintUsed ? (
              <p className="flex gap-3 rounded-2xl bg-celebrate/15 p-4" role="note">
                <Lightbulb
                  className="mt-0.5 size-5 shrink-0 text-celebrate-strong"
                  aria-hidden="true"
                />
                <span>
                  <span className="font-bold">Hint: </span>
                  {turn.question.hint}
                </span>
              </p>
            ) : (
              <Button variant="outline" onClick={() => markHintUsed(session.id, index)}>
                <Lightbulb data-icon="inline-start" aria-hidden="true" />
                Give me a hint
              </Button>
            )}
          </div>
        )}
      </Card>

      {voiceMode && !recognitionSupported && turn.status !== "done" && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-celebrate/40 bg-celebrate/10 p-5 sm:flex-row sm:items-center"
        >
          <MicOff className="size-6 shrink-0 text-celebrate-strong" aria-hidden="true" />
          <p className="flex-1 text-sm">
            <span className="font-semibold">
              Voice answers aren&apos;t available in this browser.
            </span>{" "}
            You can type your answers below, or try {SUPPORTED_BROWSERS_HINT} for voice.
          </p>
          <Button variant="outline" size="sm" onClick={() => setMode(session.id, "written")}>
            Switch to written mode
          </Button>
        </div>
      )}

      {turn.status === "answering" && (
        <Card className="gap-0 p-6 sm:p-8">
          {answerForm({
            key: `${index}-answer`,
            label: "Your answer",
            submitLabel: "Submit answer",
            pending,
            onSubmit: submitAnswer,
            skip: { label: "Skip question", onSkip: () => skipQuestion(session.id, index) },
          })}
          {failedAnswer && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
            >
              <p className="text-sm font-medium text-destructive">{failedAnswer.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void submitAnswer(failedAnswer.answer)}>
                  Try again
                </Button>
                <Button size="sm" variant="outline" onClick={continueWithoutReaction}>
                  Continue without feedback
                </Button>
              </div>
            </div>
          )}
          <p aria-live="polite" className="sr-only">
            {pending ? "Your interviewer is reading your answer." : ""}
          </p>
        </Card>
      )}

      {turn.status === "follow-up" && turn.followUp && (
        <>
          <InterviewerBubble label="Quick follow-up">{turn.followUp.question}</InterviewerBubble>
          <Card className="gap-0 p-6 sm:p-8">
            {answerForm({
              key: `${index}-follow-up`,
              label: "Your follow-up answer",
              submitLabel: "Submit follow-up",
              pending: false,
              onSubmit: (answer) => {
                recordFollowUp(session.id, index, answer, pickEncouragement())
                recordPractice("followUpAnswered")
              },
              skip: {
                label: "Skip follow-up",
                onSkip: () =>
                  recordFollowUp(session.id, index, null, "No problem. Let's keep moving."),
              },
            })}
          </Card>
        </>
      )}

      {turn.status === "done" && (
        <div className="space-y-4">
          {turn.encouragement && (
            <InterviewerBubble tone="celebrate">{turn.encouragement}</InterviewerBubble>
          )}
          <div className="flex justify-end">
            <Button
              ref={nextButtonRef}
              size="lg"
              className="h-11 px-5 text-base"
              onClick={() => {
                advance(session.id)
                if (isLast) router.push(`/interview/results/${session.id}`)
              }}
            >
              {isLast ? "Finish interview" : "Next question"}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function InterviewSession({ id }: { id: string }) {
  const hydrated = useInterviewHydrated()
  const session = useInterviewStore((state) => state.sessions[id])

  if (!hydrated) return <SessionSkeleton />
  if (!session) return <SessionNotFound />
  if (session.completedAt) return <RedirectToResults id={id} />
  return <ActiveInterview session={session} />
}
