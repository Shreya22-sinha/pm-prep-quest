import { Bot } from "lucide-react"

import { cn } from "@/lib/utils"

type InterviewerBubbleProps = {
  label?: string
  children: React.ReactNode
  tone?: "default" | "celebrate"
  className?: string
}

export function InterviewerBubble({
  label = "Your interviewer",
  children,
  tone = "default",
  className,
}: InterviewerBubbleProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
      >
        <Bot className="size-5" />
      </span>
      <div
        className={cn(
          "rounded-2xl rounded-tl-sm px-4 py-3",
          tone === "celebrate" ? "bg-celebrate/15" : "bg-muted"
        )}
      >
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
        <div className="mt-1 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
