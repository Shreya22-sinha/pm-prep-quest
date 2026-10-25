"use client"

import { useReducedMotion, type TargetAndTransition } from "motion/react"
import * as m from "motion/react-m"
import { Award, Check, Lock, Map, Sparkles, Target } from "lucide-react"

import type { HomeContent } from "@/content/home"
import { cn } from "@/lib/utils"

type Preview = HomeContent["hero"]["preview"]
type LevelStatus = Preview["levels"][number]["status"]

const ease = [0.22, 1, 0.36, 1] as const

const statusStyles: Record<LevelStatus, { icon: typeof Check; className: string }> = {
  done: { icon: Check, className: "bg-success text-success-foreground" },
  current: {
    icon: Target,
    className: "bg-primary text-primary-foreground ring-4 ring-primary/20",
  },
  upcoming: { icon: Lock, className: "bg-muted text-muted-foreground" },
}

// Decorative, illustrative roadmap card. Hidden from screen readers because the
// headline and copy beside it already say everything it shows.
export function HeroVisual({ preview }: { preview: Preview }) {
  const reduceMotion = useReducedMotion()

  const float = (delay: number): TargetAndTransition | undefined =>
    reduceMotion
      ? undefined
      : {
          y: [0, -8, 0],
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay },
        }

  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm select-none lg:max-w-md">
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="rounded-3xl border bg-card p-6 shadow-2xl shadow-primary/10"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {preview.label}
            </p>
            <p className="mt-1 font-heading text-lg font-bold">{preview.progressLabel}</p>
          </div>
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Map className="size-5" />
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
          <m.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${preview.progressPercent}%` }}
            transition={{ delay: 0.5, duration: 1, ease }}
          />
        </div>

        <ol className="mt-6 space-y-3">
          {preview.levels.map((level, index) => {
            const { icon: Icon, className } = statusStyles[level.status]
            return (
              <m.li
                key={level.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4, ease }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3",
                  level.status === "current" && "border-primary/40 bg-primary/5",
                  level.status === "upcoming" && "opacity-70"
                )}
              >
                <span className={cn("grid size-8 place-items-center rounded-full", className)}>
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-semibold">{level.title}</span>
                {level.status === "current" && (
                  <span className="ml-auto rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                    {preview.currentLabel}
                  </span>
                )}
              </m.li>
            )
          })}
        </ol>
      </m.div>

      <m.div
        className="absolute -top-4 -right-2 sm:-right-6"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, type: "spring", stiffness: 260, damping: 18 }}
      >
        <m.div
          animate={float(0)}
          className="flex items-center gap-1.5 rounded-full bg-celebrate px-3.5 py-2 text-sm font-extrabold text-celebrate-foreground shadow-lg"
        >
          <Sparkles className="size-4" />
          {preview.xpToast}
        </m.div>
      </m.div>

      <m.div
        className="absolute -bottom-6 -left-2 sm:-left-8"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 260, damping: 18 }}
      >
        <m.div
          animate={float(1.5)}
          className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lg"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-success/15 text-success">
            <Award className="size-5" />
          </span>
          <span>
            <span className="block text-xs text-muted-foreground">{preview.badgeLabel}</span>
            <span className="block text-sm font-bold">{preview.badge}</span>
          </span>
        </m.div>
      </m.div>
    </div>
  )
}
