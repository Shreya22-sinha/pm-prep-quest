"use client"

import { useSyncExternalStore } from "react"

import {
  readStoredPreference,
  setThemePreference,
  THEME_CHANGE_EVENT,
  type ThemePreference,
} from "@/lib/theme"

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange)
  // Fires when the preference changes in another tab.
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore<ThemePreference>(
    subscribe,
    readStoredPreference,
    () => "system"
  )
  return { theme, setTheme: setThemePreference }
}
