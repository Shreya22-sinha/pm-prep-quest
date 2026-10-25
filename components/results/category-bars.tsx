import { INTERVIEW_CATEGORY_LABELS } from "@/config/interview"
import type { InterviewEvaluation } from "@/lib/interview/feedback-schema"

// One measure (score) across categories: horizontal bars in a single hue, each
// value written beside its bar, so the list doubles as the data table.
export function CategoryBars({ scores }: { scores: InterviewEvaluation["categoryScores"] }) {
  return (
    <ul aria-label="Scores by category" className="space-y-3">
      {scores.map(({ category, score }) => {
        const label = INTERVIEW_CATEGORY_LABELS[category]
        return (
          <li
            key={category}
            title={score === null ? `${label}: skipped` : `${label}: ${score} out of 100`}
            // Phones: label and value on one line, full-width bar below. Wider: one row.
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[9rem_1fr_4.5rem]"
          >
            <span className="truncate text-sm font-medium">{label}</span>
            <span
              aria-hidden="true"
              className="order-last col-span-2 h-2.5 overflow-hidden rounded-full bg-muted sm:order-none sm:col-span-1"
            >
              {score !== null && (
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(score, 2)}%` }}
                />
              )}
            </span>
            <span className="text-right text-sm font-semibold tabular-nums">
              {score === null ? (
                <span className="font-medium text-muted-foreground">Skipped</span>
              ) : (
                <>
                  {score}
                  <span className="sr-only"> out of 100</span>
                </>
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
