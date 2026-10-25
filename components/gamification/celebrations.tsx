"use client"

import dynamic from "next/dynamic"

import { CelebrationToasts } from "@/components/gamification/celebration-toasts"
import { useProgressStore } from "@/store/progress-store"

// Celebration UI isn't needed to show a page, so its code (toasts, dialog,
// animation) loads after the page is interactive instead of delaying it.
const Toaster = dynamic(() => import("@/components/ui/sonner").then((module) => module.Toaster), {
  ssr: false,
})
const LevelUpDialog = dynamic(
  () => import("@/components/gamification/level-up-dialog").then((module) => module.LevelUpDialog),
  { ssr: false }
)

export function Celebrations() {
  const hasLevelUp = useProgressStore((state) => state.pendingLevelUp !== null)

  return (
    <>
      <Toaster className="print:hidden" />
      <CelebrationToasts />
      {/* The dialog's code is only fetched the first time someone levels up. */}
      {hasLevelUp && <LevelUpDialog />}
    </>
  )
}
