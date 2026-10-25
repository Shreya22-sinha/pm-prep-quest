"use client"

import { useId, useState } from "react"
import { BookOpenCheck, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { InterviewEvaluation } from "@/lib/interview/feedback-schema"
import { cn } from "@/lib/utils"

type ModelAnswerProps = {
  modelAnswer: InterviewEvaluation["reviews"][number]["modelAnswer"]
  defaultOpen?: boolean
}

/** A collapsible model answer. Always shown when printing. */
export function ModelAnswer({ modelAnswer, defaultOpen = false }: ModelAnswerProps) {
  const id = useId()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mt-5">
      <Button
        variant="outline"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="print:hidden"
      >
        <BookOpenCheck data-icon="inline-start" aria-hidden="true" />
        {open ? "Hide model answer" : "Show model answer"}
        <ChevronDown
          data-icon="inline-end"
          className={cn("transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </Button>
      <div
        id={id}
        className={cn("mt-3 rounded-2xl bg-primary/5 p-5", !open && "hidden print:block")}
      >
        <p className="text-sm font-bold text-primary">Model answer · {modelAnswer.framework}</p>
        <p className="mt-2 leading-relaxed whitespace-pre-line">{modelAnswer.answer}</p>
      </div>
    </div>
  )
}
