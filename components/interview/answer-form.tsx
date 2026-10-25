"use client"

import { useId, useState } from "react"
import { Loader2, Send, SkipForward } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { INTERVIEW_SETTINGS } from "@/config/interview"

type AnswerFormProps = {
  label: string
  submitLabel: string
  pending: boolean
  onSubmit: (answer: string) => void
  /** Shows a skip button when provided. */
  skip?: { label: string; onSkip: () => void }
  initialAnswer?: string
}

export function AnswerForm({
  label,
  submitLabel,
  pending,
  onSubmit,
  skip,
  initialAnswer = "",
}: AnswerFormProps) {
  const id = useId()
  const [answer, setAnswer] = useState(initialAnswer)
  const trimmed = answer.trim()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (trimmed && !pending) onSubmit(trimmed)
      }}
    >
      <Label htmlFor={`${id}-answer`} className="text-base font-semibold">
        {label}
      </Label>
      <Textarea
        id={`${id}-answer`}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            if (trimmed && !pending) onSubmit(trimmed)
          }
        }}
        maxLength={INTERVIEW_SETTINGS.maxAnswerChars}
        rows={8}
        disabled={pending}
        placeholder="Think out loud: structure first, then details…"
        className="mt-2 min-h-40 text-base"
        aria-describedby={`${id}-help`}
      />
      <p
        id={`${id}-help`}
        className="mt-1 flex justify-between gap-4 text-xs text-muted-foreground"
      >
        <span>Press Ctrl + Enter to submit</span>
        <span>
          {answer.length.toLocaleString()} / {INTERVIEW_SETTINGS.maxAnswerChars.toLocaleString()}
        </span>
      </p>
      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {skip ? (
          <Button type="button" variant="ghost" size="lg" onClick={skip.onSkip} disabled={pending}>
            <SkipForward data-icon="inline-start" aria-hidden="true" />
            {skip.label}
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          size="lg"
          className="h-11 px-5 text-base"
          disabled={!trimmed || pending}
        >
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
