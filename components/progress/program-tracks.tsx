import Link from "next/link"
import { ArrowRight, GraduationCap, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ProgramTrackProgress } from "@/lib/gamification/schema"
import { getMockStatuses, getTrackByKey } from "@/lib/programs/track"

export function ProgramTracks({ tracks }: { tracks: Record<string, ProgramTrackProgress> }) {
  const entries = Object.entries(tracks)
  if (entries.length === 0) return null

  return (
    <section aria-labelledby="program-tracks-title">
      <h2 id="program-tracks-title" className="font-heading text-xl font-bold">
        Program tracks
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Themed mock interviews for the programs you&apos;re preparing for.
      </p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {entries.map(([key, progress]) => {
          const track = getTrackByKey(key, progress.name)
          const statuses = getMockStatuses(track.mocks, progress.completedMockIds)
          const done = statuses.filter((status) => status === "complete").length
          const next = track.mocks[statuses.indexOf("available")]
          return (
            <li key={key}>
              <Card className="h-full gap-0 p-5">
                <p className="flex items-center gap-2 font-heading font-bold">
                  <GraduationCap className="size-5 text-primary" aria-hidden="true" />
                  {track.name}
                </p>
                <p className="mt-3 text-sm font-medium">
                  {done} of {track.mocks.length} mock interviews complete
                </p>
                <Progress
                  value={Math.round((done / track.mocks.length) * 100)}
                  aria-label={`${track.name} track progress`}
                  className="mt-2 h-2.5"
                />
                <p className="mt-3 text-sm text-muted-foreground">
                  {next ? (
                    <>Up next: {next.title}</>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                      <Trophy className="size-4" aria-hidden="true" />
                      Track complete!
                    </span>
                  )}
                </p>
                {progress.lastSessionId && (
                  <Button asChild variant="outline" className="mt-4 self-start">
                    <Link href={`/interview/results/${progress.lastSessionId}#program`}>
                      {next ? "Continue track" : "View track"}
                      <ArrowRight data-icon="inline-end" aria-hidden="true" />
                    </Link>
                  </Button>
                )}
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
