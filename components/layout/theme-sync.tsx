"use client"

import { useLayoutEffect } from "react"

import { useTheme } from "@/hooks/use-theme"
import { applyTheme } from "@/lib/theme"

// Keeps the <html> class in sync after hydration: re-applies the theme after
// React's dev-mode remount resets <html>, and follows OS changes in "system" mode.
export function ThemeSync() {
  const { theme } = useTheme()

  // Printouts ("Download as PDF") always use the light theme.
  useLayoutEffect(() => {
    const toLight = () => applyTheme("light")
    const restore = () => applyTheme(theme)
    window.addEventListener("beforeprint", toLight)
    window.addEventListener("afterprint", restore)
    return () => {
      window.removeEventListener("beforeprint", toLight)
      window.removeEventListener("afterprint", restore)
    }
  }, [theme])

  useLayoutEffect(() => {
    applyTheme(theme)
    if (theme !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemChange = () => applyTheme("system")
    media.addEventListener("change", onSystemChange)
    return () => media.removeEventListener("change", onSystemChange)
  }, [theme])

  return null
}
