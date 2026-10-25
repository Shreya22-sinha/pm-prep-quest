import { Fragment } from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export function WizardProgress({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <nav aria-label="Interview setup progress">
      <p className="text-sm font-semibold text-muted-foreground sm:hidden">
        Step {current + 1} of {steps.length} · {steps[current]}
      </p>
      <ol className="hidden items-center gap-3 sm:flex">
        {steps.map((step, index) => {
          const done = index < current
          const active = index === current
          return (
            <Fragment key={step}>
              {index > 0 && (
                <li
                  role="presentation"
                  aria-hidden="true"
                  className={cn(
                    "h-0.5 min-w-4 flex-1 rounded-full",
                    done || active ? "bg-primary/40" : "bg-border"
                  )}
                />
              )}
              <li aria-current={active ? "step" : undefined} className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                    done && "bg-success text-success-foreground",
                    active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold whitespace-nowrap",
                    !active && "text-muted-foreground"
                  )}
                >
                  {step}
                  {done && <span className="sr-only"> (done)</span>}
                </span>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
