"use client"

import { useId, useState } from "react"
import { Loader2, Mic, Send, SkipForward, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { INTERVIEW_SETTINGS } from "@/config/interview"
import { useSpeechRecognition, type RecognitionStatus } from "@/hooks/use-speech-recognition"
import { joinTranscript } from "@/lib/speech/speech"
import { cn } from "@/lib/utils"

type VoiceAnswerFormProps = {
  label: string
  submitLabel: string
  pending: boolean
  onSubmit: (answer: string) => void
  skip?: { label: string; onSkip: () => void }
  /** Called just before listening starts, e.g. to stop the interviewer's voice. */
  onListenStart?: () => void
}

function micLabel(status: RecognitionStatus, hasText: boolean): string {
  if (status === "listening") return "Listening… tap to stop"
  if (status === "processing") return "Finishing up…"
  return hasText ? "Tap to add more" : "Tap to start answering"
}

/** Answer by speaking, with a live transcript you can edit before submitting (spec 5.3 step 3). */
export function VoiceAnswerForm({
  label,
  submitLabel,
  pending,
  onSubmit,
  skip,
  onListenStart,
}: VoiceAnswerFormProps) {
  const id = useId()
  const [text, setText] = useState("")
  const recognition = useSpeechRecognition({
    onTranscript: (transcript) =>
      setText((current) =>
        joinTranscript(current, transcript).slice(0, INTERVIEW_SETTINGS.maxAnswerChars)
      ),
  })

  const { status } = recognition
  const isListening = status === "listening"
  const isBusy = status !== "idle"
  // While listening, show the words as they're recognised after what's already there.
  const shown = isBusy ? joinTranscript(text, recognition.finalText, recognition.interimText) : text
  const trimmed = text.trim()
  const canSubmit = trimmed.length > 0 && !isBusy && !pending

  const toggleListening = () => {
    if (isListening) {
      recognition.stop()
    } else {
      onListenStart?.()
      recognition.start()
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (canSubmit) onSubmit(trimmed)
      }}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          onClick={toggleListening}
          disabled={status === "processing" || pending}
          aria-pressed={isListening}
          aria-describedby={`${id}-mic-status`}
          aria-label={isListening ? "Stop recording" : "Start recording your answer"}
          className={cn(
            "relative grid size-20 place-items-center rounded-full shadow-lg transition-colors focus-visible:ring-4 focus-visible:ring-ring/60 focus-visible:outline-none disabled:opacity-60",
            isListening
              ? "bg-destructive text-background"
              : "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_15%)]"
          )}
        >
          {isListening && (
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-destructive/40 [animation-duration:1.6s]"
            />
          )}
          {status === "processing" ? (
            <Loader2 className="relative size-8 animate-spin" aria-hidden="true" />
          ) : isListening ? (
            <Square className="relative size-7 fill-current" aria-hidden="true" />
          ) : (
            <Mic className="relative size-8" aria-hidden="true" />
          )}
        </button>
        <p id={`${id}-mic-status`} aria-live="polite" className="text-sm font-semibold">
          {micLabel(status, trimmed.length > 0)}
        </p>
      </div>

      {recognition.error && (
        <p
          role="alert"
          className="mt-2 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          {recognition.error}
        </p>
      )}

      <Label htmlFor={`${id}-answer`} className="mt-4 block text-base font-semibold">
        {label}
      </Label>
      <Textarea
        id={`${id}-answer`}
        value={shown}
        onChange={(event) => setText(event.target.value)}
        readOnly={isBusy}
        maxLength={INTERVIEW_SETTINGS.maxAnswerChars}
        rows={6}
        disabled={pending}
        placeholder="Your words will appear here as you speak. You can edit them before submitting."
        className={cn("mt-2 min-h-36 text-base", isBusy && "bg-muted/50")}
        aria-describedby={`${id}-help`}
      />
      <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">
        {isBusy
          ? "Transcribing live. Stop recording to edit."
          : "Check the transcript and fix any words that came out wrong."}
      </p>

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {skip ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={skip.onSkip}
            disabled={pending || isBusy}
          >
            <SkipForward data-icon="inline-start" aria-hidden="true" />
            {skip.label}
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="lg" className="h-11 px-5 text-base" disabled={!canSubmit}>
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
          ) : (
            <Send data-icon="inline-start" aria-hidden="true" />
          )}
          {pending ? "Sending…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
