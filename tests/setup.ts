import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

import { useProgressStore } from "@/store/progress-store"

// Most tests run in jsdom; API route tests opt into the Node environment.
const isBrowserLike = typeof window !== "undefined"

// jsdom has no canvas, and confetti is purely visual.
vi.mock("@/lib/gamification/confetti", () => ({ fireConfetti: vi.fn() }))

afterEach(() => {
  useProgressStore.getState().resetProgress()
  if (isBrowserLike) {
    cleanup()
    localStorage.clear()
  }
})

if (isBrowserLike) {
  // jsdom has no IntersectionObserver; Motion's whileInView needs it.
  class MockIntersectionObserver {
    readonly root = null
    readonly rootMargin = ""
    readonly thresholds = []
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)

  // jsdom has no matchMedia; components that read the OS theme need it.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}
