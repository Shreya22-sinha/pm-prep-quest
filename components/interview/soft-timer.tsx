"use client"

import { useEffect, useState } from "react"
import { Timer } from "lucide-react"

import { INTERVIEW_SETTINGS } from "@/config/interview"
import { cn } from "@/lib/utils"

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
}

/** A gentle, optional timer. It counts up and never cuts anyone off. */
export function SoftTimer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const interval = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

  const suggested = INTERVIEW_SETTINGS.suggestedMinutesPerQuestion * 60
  const over = seconds >= suggested

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium tabular-nums",
        over ? "text-celebrate-strong" : "text-muted-foreground"
      )}
    >
      <Timer className="size-4" aria-hidden="true" />
      <span>
        <span className="sr-only">Time on this question: </span>
        {formatElapsed(seconds)}
      </span>
      <span className="text-muted-foreground">
        {over
          ? "· Take your time, there's no rush"
          : `· about ${INTERVIEW_SETTINGS.suggestedMinutesPerQuestion} min suggested`}
      </span>
    </p>
  )
}
