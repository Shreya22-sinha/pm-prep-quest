"use client"

import { useSyncExternalStore } from "react"

import { useProgressStore } from "@/store/progress-store"

/** True once saved progress has been loaded from storage (always false on the server). */
export function useProgressHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useProgressStore.persist.onFinishHydration(onChange),
    () => useProgressStore.persist.hasHydrated(),
    () => false
  )
}
