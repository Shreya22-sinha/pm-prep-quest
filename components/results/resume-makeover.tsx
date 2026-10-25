"use client"

import Link from "next/link"
import { ArrowDown, CheckCircle2, FileText, Lightbulb, Loader2, Rocket, Target } from "lucide-react"

import { ResultsSection } from "@/components/results/results-parts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getResourcesForTags } from "@/content/resources"
import { useOnceRequest } from "@/hooks/use-once-request"
import { apiPost } from "@/lib/api/client"
import { resumeFeedbackSchema, type ResumeFeedback } from "@/lib/interview/feedback-schema"
import { buildResumeFeedbackRequest } from "@/lib/interview/results"
import type { InterviewSession } from "@/lib/interview/session"
import { useInterviewStore } from "@/store/interview-store"

const GAP_LABELS: Record<ResumeFeedback["gaps"][number]["area"], string> = {
  skills: "Skills",
  keywords: "Keywords",
  impact: "Impact & metrics",
  other: "Other",
}

function Subheading({ icon: Icon, children }: { icon: typeof Target; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-heading text-lg font-bold">
      <Icon className="size-5 text-primary" aria-hidden="true" />
      {children}
    </h3>
  )
}

function MakeoverContent({ feedback }: { feedback: ResumeFeedback }) {
  return (
    <div className="space-y-8">
      <Card className="break-inside-avoid gap-0 border-l-4 border-l-success p-6">
        <Subheading icon={CheckCircle2}>What&apos;s strong in your resume</Subheading>
        <ul className="mt-3 space-y-2">
          {feedback.strengths.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <div className="break-inside-avoid">
        <Subheading icon={Target}>Gaps to close for this role</Subheading>
        <ul className="mt-3 space-y-2">
          {feedback.gaps.map((gap) => (
            <li
              key={gap.detail}
              className="flex flex-col gap-1 rounded-2xl border p-4 sm:flex-row sm:gap-3"
            >
              <Badge variant="outline" className="w-fit shrink-0">
                {GAP_LABELS[gap.area]}
              </Badge>
              <span>{gap.detail}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Subheading icon={FileText}>Suggested rewrites</Subheading>
        <p className="mt-1 text-sm text-muted-foreground">
          Replace anything in [brackets] with your real numbers.
        </p>
        <ol className="mt-3 space-y-4">
          {feedback.rewrites.map((rewrite) => (
            <li key={rewrite.before}>
              <Card className="break-inside-avoid gap-0 p-5">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Before
                </p>
                <p className="mt-1 text-muted-foreground">{rewrite.before}</p>
                <ArrowDown className="my-2 size-4 text-primary" aria-hidden="true" />
                <p className="text-xs font-bold tracking-wider text-success uppercase">After</p>
                <p className="mt-1 font-medium">{rewrite.after}</p>
                <p className="mt-3 text-sm text-muted-foreground">{rewrite.why}</p>
              </Card>
            </li>
          ))}
        </ol>
      </div>

      <div className="break-inside-avoid">
        <Subheading icon={Lightbulb}>Skills to add, and where to learn them</Subheading>
        <ul className="mt-3 grid gap-4 md:grid-cols-2">
          {feedback.skillsToAdd.map((item) => {
            const resources = getResourcesForTags([item.tag]).slice(0, 2)
            return (
              <li key={item.skill} className="rounded-2xl border p-4">
                <p className="font-heading font-bold">{item.skill}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.why}</p>
                {resources.length > 0 && (
                  <p className="mt-2 text-sm">
                    Learn with:{" "}
                    {resources.map((resource, index) => (
                      <span key={resource.id}>
                        {index > 0 && ", "}
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {resource.title}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <Subheading icon={Rocket}>Project ideas to strengthen your profile</Subheading>
        <ol className="mt-3 grid gap-4 md:grid-cols-3">
          {feedback.projectIdeas.map((idea) => (
            <li key={idea.title}>
              <Card className="h-full break-inside-avoid gap-0 p-5">
                <p className="font-heading font-bold">{idea.title}</p>
                <p className="mt-1 text-sm">{idea.description}</p>
                <p className="mt-3 text-sm">
                  <span className="font-semibold">Shows: </span>
                  {idea.demonstrates}
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Start by: </span>
                  {idea.howToStart}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export function ResumeMakeover({ session }: { session: InterviewSession }) {
  const saveResumeFeedback = useInterviewStore((state) => state.saveResumeFeedback)
  const request = buildResumeFeedbackRequest(session)
  const needed = request !== null && session.resumeFeedback === null

  const { error, retry } = useOnceRequest(needed ? `resume:${session.id}` : null, async () => {
    if (!request) return
    const feedback = await apiPost("/api/resume/feedback", request, resumeFeedbackSchema)
    saveResumeFeedback(session.id, feedback)
  })

  return (
    <ResultsSection
      id="resume"
      title="Resume makeover"
      description="Praise first, then practical upgrades for this role."
      icon={FileText}
    >
      {!request ? (
        <p className="rounded-2xl bg-muted p-5">
          Add your resume next time and you&apos;ll get personalised rewrites, skills to add and
          project ideas right here.{" "}
          <Link href="/interview" className="font-medium text-primary hover:underline print:hidden">
            Start a new interview
          </Link>
        </p>
      ) : session.resumeFeedback ? (
        <MakeoverContent feedback={session.resumeFeedback} />
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5"
        >
          <p className="font-medium text-destructive">{error}</p>
          <Button className="mt-3" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : (
        <p role="status" className="flex items-center gap-3 rounded-2xl bg-muted p-5">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
          Reviewing your resume against this role…
        </p>
      )}
    </ResultsSection>
  )
}
