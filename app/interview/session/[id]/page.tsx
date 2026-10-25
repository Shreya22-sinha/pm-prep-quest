import { Suspense } from "react"
import type { Metadata } from "next"

import { InterviewSession, SessionSkeleton } from "@/components/interview/interview-session"

export const metadata: Metadata = {
  title: "Mock interview",
  description: "Your mock PM interview in progress.",
  robots: { index: false },
}

async function SessionLoader({
  params,
}: {
  params: PageProps<"/interview/session/[id]">["params"]
}) {
  const { id } = await params
  return <InterviewSession id={id} />
}

// Session ids only exist in the visitor's browser, so the id is read at request
// time inside Suspense (Cache Components) while the page shell stays static.
export default function InterviewSessionPage({ params }: PageProps<"/interview/session/[id]">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Suspense fallback={<SessionSkeleton />}>
        <SessionLoader params={params} />
      </Suspense>
    </div>
  )
}
