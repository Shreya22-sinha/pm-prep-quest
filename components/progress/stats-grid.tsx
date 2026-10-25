import { Award, Flame, Map, MessagesSquare, type LucideIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { BADGES } from "@/config/gamification"
import { ROADMAP_TOPICS } from "@/content/topics"
import { pluralize } from "@/lib/format"
import type { ProgressData } from "@/lib/gamification/schema"
import { getActiveStreak } from "@/lib/gamification/streak"
import { cn } from "@/lib/utils"

type Stat = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  iconClassName: string
}

function streakDetail(data: ProgressData, todayKey: string, active: number): string {
  if (data.streak.lastActiveDate === null) return "Earn XP today to start one"
  if (active === 0) return "Practise today to start a new streak"
  if (data.streak.lastActiveDate !== todayKey) return "Practise today to keep it going!"
  return `Best: ${pluralize(data.streak.longest, "day")}`
}

export function StatsGrid({ data, todayKey }: { data: ProgressData; todayKey: string }) {
  const activeStreak = getActiveStreak(data.streak, todayKey)
  const bestScore = Math.max(0, ...data.interviews.map((interview) => interview.overallScore))
  const badgeCount = BADGES.filter((badge) => data.unlockedBadges[badge.id]).length

  const stats: Stat[] = [
    {
      label: "Day streak",
      value: pluralize(activeStreak, "day"),
      detail: streakDetail(data, todayKey, activeStreak),
      icon: Flame,
      iconClassName: "bg-celebrate/20 text-celebrate-strong",
    },
    {
      label: "Roadmap levels",
      value: `${data.completedTopicIds.length} / ${ROADMAP_TOPICS.length}`,
      detail: "completed",
      icon: Map,
      iconClassName: "bg-primary/10 text-primary",
    },
    {
      label: "Mock interviews",
      value: String(data.interviews.length),
      detail: data.interviews.length > 0 ? `Best score: ${bestScore}` : "None yet",
      icon: MessagesSquare,
      iconClassName: "bg-primary/10 text-primary",
    },
    {
      label: "Badges",
      value: `${badgeCount} / ${BADGES.length}`,
      detail: "unlocked",
      icon: Award,
      iconClassName: "bg-success/15 text-success",
    },
  ]

  return (
    <ul aria-label="Your stats" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, detail, icon: Icon, iconClassName }) => (
        <li key={label}>
          <Card className="h-full gap-0 p-5">
            <span className={cn("grid size-10 place-items-center rounded-xl", iconClassName)}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 font-heading text-2xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </Card>
        </li>
      ))}
    </ul>
  )
}
