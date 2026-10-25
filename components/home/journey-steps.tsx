"use client"

import * as m from "motion/react-m"

import { cn } from "@/lib/utils"

const ease = [0.22, 1, 0.36, 1] as const
const viewport = { once: true, margin: "0px 0px -80px 0px" }

export type JourneyStep = {
  title: string
  description: string
  /** Pre-rendered on the server: icon components can't cross into a Client Component. */
  icon: React.ReactNode
}

type JourneyStepsProps = {
  steps: JourneyStep[]
  stepLabel: string
}

// The Learn → Practice → Mock interview → Land the role path. The connecting
// line draws itself as the steps scroll into view.
export function JourneySteps({ steps, stepLabel }: JourneyStepsProps) {
  const lastIndex = steps.length - 1

  return (
    <div className="relative">
      {/* Decorative connectors: vertical on mobile, horizontal from md up. */}
      <div
        aria-hidden="true"
        className="absolute top-7 bottom-7 left-7 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-border md:hidden"
      >
        <m.div
          className="size-full origin-top bg-primary"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={viewport}
          transition={{ duration: 1.2, ease }}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-1 -translate-y-1/2 overflow-hidden rounded-full bg-border md:block"
      >
        <m.div
          className="size-full origin-left bg-primary"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={viewport}
          transition={{ duration: 1.2, ease }}
        />
      </div>

      <ol className="relative grid gap-8 md:grid-cols-4 md:gap-4">
        {steps.map((step, index) => {
          const isFinal = index === lastIndex
          return (
            <m.li
              key={step.title}
              className="flex items-start gap-5 md:flex-col md:items-center md:text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ delay: 0.15 + index * 0.2, duration: 0.5, ease }}
            >
              <span
                className={cn(
                  "grid size-14 shrink-0 place-items-center rounded-full shadow-md ring-8 ring-background",
                  isFinal
                    ? "bg-celebrate text-celebrate-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {step.icon}
              </span>
              <div className="pt-1 md:pt-0">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  {stepLabel} {index + 1}
                </p>
                <h4 className="mt-1 font-heading text-lg font-bold">{step.title}</h4>
                <p className="mt-1 text-muted-foreground md:mx-auto md:max-w-52">
                  {step.description}
                </p>
              </div>
            </m.li>
          )
        })}
      </ol>
    </div>
  )
}
