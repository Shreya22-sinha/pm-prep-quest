import { describe, expect, it } from "vitest"

import {
  isThemePreference,
  readStoredPreference,
  resolveTheme,
  setThemePreference,
  THEME_STORAGE_KEY,
} from "@/lib/theme"

describe("resolveTheme", () => {
  it("uses the explicit choice when set", () => {
    expect(resolveTheme("dark", false)).toBe("dark")
    expect(resolveTheme("light", true)).toBe("light")
  })

  it("follows the OS when set to system", () => {
    expect(resolveTheme("system", true)).toBe("dark")
    expect(resolveTheme("system", false)).toBe("light")
  })
})

describe("theme preference storage", () => {
  it("defaults to system when nothing (or junk) is stored", () => {
    expect(readStoredPreference()).toBe("system")
    localStorage.setItem(THEME_STORAGE_KEY, "purple")
    expect(readStoredPreference()).toBe("system")
  })

  it("saves the choice and applies the dark class", () => {
    setThemePreference("dark")
    expect(readStoredPreference()).toBe("dark")
    expect(document.documentElement).toHaveClass("dark")

    setThemePreference("light")
    expect(document.documentElement).not.toHaveClass("dark")
  })

  it("recognises valid preferences only", () => {
    expect(isThemePreference("system")).toBe(true)
    expect(isThemePreference("blue")).toBe(false)
    expect(isThemePreference(undefined)).toBe(false)
  })
})
