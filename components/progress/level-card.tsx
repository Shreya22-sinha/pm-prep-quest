import { Check } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LEVELS } from "@/config/gamification"
import { getLevelProgress } from "@/lib/gamification/levels"
import { cn } from "@/lib/utils"

export function LevelCard({ xp }: { xp: number }) {
  const { current, next, percent, xpToNext } = getLevelProgress(xp)

  return (
    <Card aria-labelledby="level-title" className="gap-0 p-6 sm:p-8" role="region">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-primary font-heading text-3xl font-extrabold text-primary-foreground shadow-lg shadow-primary/20">
          {current.level}
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold tracking-wider text-primary uppercase">
            Level {current.level} of {LEVELS.length}
          </p>
          <h2 id="level-title" className="mt-1 font-heading text-2xl font-extrabold tracking-tight">
            {current.name}
          </h2>
          <p className="mt-1 text-base text-muted-foreground">{current.tagline}</p>
        </div>
        <div className="sm:text-right">
          <p className="font-heading text-3xl font-extrabold">{xp}</p>
          <p className="text-sm text-muted-foreground">total XP</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between gap-4 text-sm font-medium">
          <span>
            {next
              ? `${xpToNext} XP to ${next.name}`
              : "You've reached the top level. Amazing work!"}
          </span>
          <span className="text-muted-foreground">{percent}%</span>
        </div>
        <Progress
          value={percent}
          aria-label={next ? `Progress to ${next.name}` : "Top level reached"}
          className="mt-2 h-3"
        />
      </div>

      <ol aria-label="All levels" className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {LEVELS.map((level) => {
          const reached = level.level <= current.level
          const isCurrent = level.level === current.level
          return (
            <li
              key={level.level}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                reached ? "font-semibold" : "text-muted-foreground",
                isCurrent && "border-primary/50 bg-primary/10"
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                  reached ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {reached && !isCurrent ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  level.level
                )}
              </span>
              <span className="min-w-0 leading-tight">{level.name}</span>
              <span className="sr-only">
                {isCurrent ? "(current level)" : reached ? "(reached)" : `(from ${level.minXp} XP)`}
              </span>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
