// Brand colours (indigo, violet, amber, green) as hex: canvas-confetti can't read CSS variables.
const COLORS = ["#4f46e5", "#8b5cf6", "#f59e0b", "#16a34a", "#fbbf24"]

/** Celebration burst. Does nothing for people who prefer reduced motion. */
export async function fireConfetti(): Promise<void> {
  if (typeof window === "undefined") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  // Loaded on demand so the library isn't in every page's bundle.
  const { default: confetti } = await import("canvas-confetti")
  const shared = { colors: COLORS, disableForReducedMotion: true, zIndex: 100 }

  void confetti({ ...shared, particleCount: 120, spread: 80, origin: { y: 0.6 } })
  window.setTimeout(() => {
    void confetti({ ...shared, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } })
    void confetti({
      ...shared,
      particleCount: 60,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
    })
  }, 250)
}
