"use client"

import { useEffect } from "react"
import { Sparkles } from "lucide-react"

import { getBadge } from "@/lib/gamification/badges"
import { useProgressStore } from "@/store/progress-store"

/** Turns XP and badge events from the progress store into toasts. */
export function CelebrationToasts() {
  const events = useProgressStore((state) => state.toastEvents)
  const dismiss = useProgressStore((state) => state.dismissToastEvent)

  useEffect(() => {
    if (events.length === 0) return
    // The toast library loads only once there is something to celebrate.
    void import("sonner").then(({ toast }) => {
      for (const event of events) {
        // Using the event id as the toast id means a repeated effect can't show it twice.
        if (event.type === "xp") {
          toast.success(`+${event.amount} XP`, {
            id: event.id,
            description: event.reason,
            icon: <Sparkles className="size-4 text-celebrate-strong" />,
          })
        } else {
          const badge = getBadge(event.badgeId)
          if (badge) {
            const Icon = badge.icon
            toast(`Badge unlocked: ${badge.name}`, {
              id: event.id,
              description: badge.description,
              icon: <Icon className="size-4 text-success" />,
              duration: 6000,
            })
          }
        }
        dismiss(event.id)
      }
    })
  }, [events, dismiss])

  return null
}
