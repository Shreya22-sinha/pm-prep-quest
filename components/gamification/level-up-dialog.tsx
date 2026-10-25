"use client"

import { useEffect } from "react"
import Link from "next/link"
import * as m from "motion/react-m"
import { Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fireConfetti } from "@/lib/gamification/confetti"
import { getLevelByNumber } from "@/lib/gamification/levels"
import { useProgressStore } from "@/store/progress-store"

export function LevelUpDialog() {
  const pendingLevel = useProgressStore((state) => state.pendingLevelUp)
  const clearLevelUp = useProgressStore((state) => state.clearLevelUp)
  const level = pendingLevel === null ? undefined : getLevelByNumber(pendingLevel)

  useEffect(() => {
    if (pendingLevel !== null) void fireConfetti()
  }, [pendingLevel])

  return (
    <Dialog open={level !== undefined} onOpenChange={(open) => !open && clearLevelUp()}>
      {level && (
        <DialogContent className="text-center sm:max-w-md">
          <m.span
            className="mx-auto mt-2 grid size-20 place-items-center rounded-3xl bg-celebrate text-celebrate-foreground shadow-lg"
            initial={{ scale: 0.4, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
          >
            <Trophy className="size-10" aria-hidden="true" />
          </m.span>
          <DialogHeader className="items-center text-center">
            <p className="text-sm font-bold tracking-wider text-primary uppercase">
              Level {level.level} unlocked
            </p>
            <DialogTitle className="font-heading text-2xl font-extrabold tracking-tight">
              You&apos;ve reached {level.name}!
            </DialogTitle>
            <DialogDescription className="text-base">{level.tagline}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" size="lg" className="h-10 px-4" asChild>
              <Link href="/progress" onClick={clearLevelUp}>
                See my progress
              </Link>
            </Button>
            <Button size="lg" className="h-10 px-4" onClick={clearLevelUp}>
              Keep going
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
