import { Suspense } from "react"
import type { Metadata } from "next"

import { SessionSkeleton } from "@/components/interview/interview-session"
import { ResultsView } from "@/components/results/results-view"

export const metadata: Metadata = {
  title: "Interview results",
  description: "Your mock interview score, praise, model answers and personalised practice.",
  robots: { index: false },
}

async function ResultsLoader({
  params,
}: {
  params: PageProps<"/interview/results/[id]">["params"]
}) {
  const { id } = await params
  return <ResultsView id={id} />
}

// Results live in the visitor's browser, so the id is read at request time
// inside Suspense (Cache Components) while the page shell stays static.
export default function InterviewResultsPage({ params }: PageProps<"/interview/results/[id]">) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Suspense fallback={<SessionSkeleton />}>
        <ResultsLoader params={params} />
      </Suspense>
    </div>
  )
}
