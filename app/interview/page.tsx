import type { Metadata } from "next"

import { InterviewWizard } from "@/components/interview/interview-wizard"

export const metadata: Metadata = {
  title: "Interview Arena",
  description:
    "Practise PM interviews with a friendly AI interviewer, tailored to a job description or a PM program.",
}

export default function InterviewPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 text-center">
        <p className="text-sm font-bold tracking-wider text-primary uppercase">Interview Arena</p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          Practise with a friendly AI interviewer
        </h1>
        <p className="mt-4 text-lg text-pretty text-muted-foreground">
          Set up your mock interview in a minute. Every question is a chance to learn, not a test.
        </p>
      </header>
      <InterviewWizard />
    </div>
  )
}
