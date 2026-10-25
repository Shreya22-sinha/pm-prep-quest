const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
})

/** e.g. "24 Oct 2026", in the viewer's locale. Call only in the browser. */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
