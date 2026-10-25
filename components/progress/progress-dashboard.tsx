"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { useShallow } from "zustand/react/shallow"

import { BadgesGrid } from "@/components/progress/badges-grid"
import { DevTools } from "@/components/progress/dev-tools"
import { InterviewHistory } from "@/components/progress/interview-history"
import { LevelCard } from "@/components/progress/level-card"
import { ProgramTracks } from "@/components/progress/program-tracks"
import { ProgressSkeleton } from "@/components/progress/progress-skeleton"
import { ResetProgress } from "@/components/progress/reset-progress"
import { StatsGrid } from "@/components/progress/stats-grid"
import { TopicProgress } from "@/components/progress/topic-progress"
import { Button } from "@/components/ui/button"
import { useProgressHydrated } from "@/hooks/use-progress-hydrated"
import type { ProgressData } from "@/lib/gamification/schema"
import { toLocalDateKey } from "@/lib/gamification/streak"
import { useProgressStore } from "@/store/progress-store"

function WelcomeBanner() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Sparkles className="size-6" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="font-heading text-lg font-bold">Your adventure starts now</p>
        <p className="text-muted-foreground">
          Complete roadmap levels and mock interviews to earn XP, level up and unlock badges.
        </p>
      </div>
      <Button asChild className="h-10 px-4">
        <Link href="/roadmap">
          Start the roadmap
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}

export function ProgressDashboard() {
  const hydrated = useProgressHydrated()
  // Saved progress (and today's date) only exist in the browser, so the
  // prerendered page shows the skeleton and the content renders after hydration.
  return hydrated ? <DashboardContent /> : <ProgressSkeleton />
}

function DashboardContent() {
  const data: ProgressData = useProgressStore(
    useShallow((state) => ({
      xp: state.xp,
      completedTopicIds: state.completedTopicIds,
      unlockedBadges: state.unlockedBadges,
      streak: state.streak,
      interviews: state.interviews,
      programTracks: state.programTracks,
    }))
  )
  const [todayKey] = useState(() => toLocalDateKey(new Date()))

  const isNewUser =
    data.xp === 0 && data.completedTopicIds.length === 0 && data.interviews.length === 0

  return (
    <div className="space-y-8">
      {isNewUser && <WelcomeBanner />}
      <LevelCard xp={data.xp} />
      <StatsGrid data={data} todayKey={todayKey} />
      <div className="grid gap-8 lg:grid-cols-2">
        <TopicProgress completedTopicIds={data.completedTopicIds} />
        <InterviewHistory interviews={data.interviews} />
      </div>
      <ProgramTracks tracks={data.programTracks} />
      <BadgesGrid unlockedBadges={data.unlockedBadges} />
      {!isNewUser && (
        <div className="flex justify-end border-t pt-6">
          <ResetProgress />
        </div>
      )}
      {process.env.NODE_ENV === "development" && <DevTools />}
    </div>
  )
}
