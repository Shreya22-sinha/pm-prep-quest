"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useProgressHydrated } from "@/hooks/use-progress-hydrated"
import { getLevelForXp } from "@/lib/gamification/levels"
import { cn } from "@/lib/utils"
import { useProgressStore } from "@/store/progress-store"

export function XpPill({ className }: { className?: string }) {
  const hydrated = useProgressHydrated()
  const xp = useProgressStore((state) => state.xp)

  if (!hydrated) {
    return <Skeleton aria-hidden="true" className={cn("h-9 w-24 rounded-full", className)} />
  }

  const level = getLevelForXp(xp)

  return (
    <Link
      href="/progress"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-celebrate/40 bg-celebrate/15 px-3 text-sm font-semibold whitespace-nowrap transition-colors hover:bg-celebrate/25 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
      title={level.name}
    >
      <Sparkles className="size-4 text-celebrate-strong" aria-hidden="true" />
      {/* The visible text starts the accessible name (WCAG 2.5.3, label in name). */}
      {/* Real spaces around "·" so every tool reads the same name. */}
      <span className="whitespace-pre">
        Lv {level.level} <span className="text-muted-foreground">·</span> {xp} XP
      </span>
      <span className="sr-only">
        {" "}
        (Level {level.level}, {level.name}). View my progress
      </span>
    </Link>
  )
}
