"use client"

import { useSyncExternalStore } from "react"

import { useInterviewStore } from "@/store/interview-store"

/** True once saved interviews have been loaded from storage (always false on the server). */
export function useInterviewHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useInterviewStore.persist.onFinishHydration(onChange),
    () => useInterviewStore.persist.hasHydrated(),
    () => false
  )
}
