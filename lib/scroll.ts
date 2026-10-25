// Next.js keeps recently visited pages in the document, hidden (Cache
// Components + <Activity>), so the same section id can exist more than once.
// These helpers always target the copy the user can actually see.

export function findVisibleById(id: string): HTMLElement | null {
  const matches = document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)
  return Array.from(matches).find((element) => element.getClientRects().length > 0) ?? null
}

/** Scrolls to a section and updates the URL hash, like a normal in-page link. */
export function scrollToSection(id: string): void {
  const target = findVisibleById(id)
  if (!target) return
  target.scrollIntoView({ block: "start" })
  window.history.replaceState(null, "", `#${id}`)
}
