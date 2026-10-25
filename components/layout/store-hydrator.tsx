"use client"

import { useEffect } from "react"

import { STORAGE_KEYS } from "@/lib/storage"
import { useInterviewStore } from "@/store/interview-store"
import { useProgressStore } from "@/store/progress-store"

const STORES = [
  { key: STORAGE_KEYS.progress, persist: useProgressStore.persist },
  { key: STORAGE_KEYS.interviews, persist: useInterviewStore.persist },
]

/** Loads saved data after the first render and keeps other open tabs in sync. */
export function StoreHydrator() {
  useEffect(() => {
    for (const store of STORES) void store.persist.rehydrate()

    const onStorage = (event: StorageEvent) => {
      const store = STORES.find((item) => item.key === event.key)
      if (store) void store.persist.rehydrate()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return null
}
