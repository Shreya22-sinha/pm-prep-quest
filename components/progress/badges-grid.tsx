import { Lock } from "lucide-react"

import { BADGES } from "@/config/gamification"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export function BadgesGrid({ unlockedBadges }: { unlockedBadges: Record<string, string> }) {
  const unlockedCount = BADGES.filter((badge) => unlockedBadges[badge.id]).length

  return (
    <section aria-labelledby="badges-title">
      <h2 id="badges-title" className="font-heading text-xl font-bold">
        Badges
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {unlockedCount} of {BADGES.length} unlocked
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((badge) => {
          const unlockedAt = unlockedBadges[badge.id]
          const Icon = badge.icon
          return (
            <li
              key={badge.id}
              className={cn(
                "flex items-start gap-4 rounded-2xl border p-4",
                unlockedAt ? "border-celebrate/50 bg-celebrate/10" : "bg-card"
              )}
            >
              <span
                className={cn(
                  "relative grid size-12 shrink-0 place-items-center rounded-2xl",
                  unlockedAt
                    ? "bg-celebrate text-celebrate-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
                {!unlockedAt && (
                  <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full border bg-background">
                    <Lock className="size-3" aria-hidden="true" />
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className={cn("font-heading font-bold", !unlockedAt && "text-muted-foreground")}>
                  {badge.name}
                </p>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
                <p
                  className={cn(
                    "mt-1 text-xs font-semibold",
                    unlockedAt ? "text-celebrate-strong" : "text-muted-foreground"
                  )}
                >
                  {unlockedAt ? `Earned ${formatDate(unlockedAt)}` : "Locked"}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
