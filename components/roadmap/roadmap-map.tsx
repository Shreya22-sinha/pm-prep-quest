"use client"

import Link from "next/link"
import { Check, Lock } from "lucide-react"

import { TOPIC_ICONS } from "@/components/roadmap/topic-icons"
import { ROADMAP_TOPICS, getTopicHref, type RoadmapTopic } from "@/content/topics"
import { useTopicStatuses } from "@/hooks/use-topic-statuses"
import type { TopicStatus } from "@/lib/roadmap"
import { cn } from "@/lib/utils"

const ROW_HEIGHT_PX = 168
/** Node centre within a row, in the SVG's 0–100 row units (node is near the top of its row). */
const NODE_CENTRE_Y = 24
// Horizontal node positions (% of width), repeating to make a winding path.
const MOBILE_X = [50, 72, 50, 28]
const DESKTOP_X = [50, 76, 50, 24]

const xAt = (pattern: number[], index: number) => pattern[index % pattern.length] ?? 50

function pathSegments(pattern: number[]) {
  return ROADMAP_TOPICS.slice(0, -1).map((_, index) => {
    const x1 = xAt(pattern, index)
    const x2 = xAt(pattern, index + 1)
    const y1 = index * 100 + NODE_CENTRE_Y
    const y2 = y1 + 100
    return `M ${x1} ${y1} C ${x1} ${y1 + 50}, ${x2} ${y2 - 50}, ${x2} ${y2}`
  })
}

const MOBILE_SEGMENTS = pathSegments(MOBILE_X)
const DESKTOP_SEGMENTS = pathSegments(DESKTOP_X)

function Path({
  segments,
  statuses,
  className,
}: {
  segments: string[]
  statuses: TopicStatus[]
  className: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      viewBox={`0 0 100 ${ROADMAP_TOPICS.length * 100}`}
      preserveAspectRatio="none"
    >
      {segments.map((d, index) => {
        const done = statuses[index] === "complete"
        return (
          <path
            key={d}
            d={d}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeWidth={done ? 6 : 4}
            strokeDasharray={done ? undefined : "2 12"}
            className={done ? "stroke-success" : "stroke-border"}
          />
        )
      })}
    </svg>
  )
}

const STATUS_TEXT: Record<TopicStatus, string> = {
  complete: "Complete",
  current: "Up next",
  upcoming: "Not started",
  loading: "",
}

function MapNode({
  topic,
  index,
  status,
  isFirstVisit,
}: {
  topic: RoadmapTopic
  index: number
  status: TopicStatus
  isFirstVisit: boolean
}) {
  const Icon = TOPIC_ICONS[topic.id]
  const levelNumber = index + 1
  const label = [`Level ${levelNumber}: ${topic.title}`, STATUS_TEXT[status]]
    .filter(Boolean)
    .join(", ")

  return (
    <li
      className="absolute left-(--x-mobile) flex w-36 -translate-x-1/2 flex-col items-center text-center md:left-(--x-desktop) md:w-44"
      style={
        {
          top: index * ROW_HEIGHT_PX,
          "--x-mobile": `${xAt(MOBILE_X, index)}%`,
          "--x-desktop": `${xAt(DESKTOP_X, index)}%`,
        } as React.CSSProperties
      }
    >
      <Link
        href={getTopicHref(topic.id)}
        aria-label={label}
        className={cn(
          "group relative grid size-20 place-items-center rounded-full shadow-md transition-transform duration-200 hover:scale-105 focus-visible:ring-4 focus-visible:ring-ring/60 focus-visible:outline-none",
          status === "complete" && "bg-success text-success-foreground",
          status === "current" && "bg-primary text-primary-foreground ring-8 ring-primary/20",
          (status === "upcoming" || status === "loading") &&
            "border-2 bg-card text-muted-foreground hover:text-foreground"
        )}
      >
        {status === "current" && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-primary/30 [animation-duration:2s]"
          />
        )}
        <Icon className="relative size-8" aria-hidden="true" />
        {status === "complete" && (
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-4 border-background bg-success text-success-foreground">
            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
          </span>
        )}
        {status === "upcoming" && (
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-4 border-background bg-muted">
            <Lock className="size-3" aria-hidden="true" />
          </span>
        )}
      </Link>

      {status === "current" && (
        <span
          aria-hidden="true"
          className="absolute -top-3.5 rounded-full bg-celebrate px-3 py-1 text-xs font-extrabold whitespace-nowrap text-celebrate-foreground shadow-md"
        >
          {isFirstVisit ? "Start here" : "Up next"}
        </span>
      )}

      {/* Background keeps the winding path from running through the label. */}
      <div className="mt-2 rounded-xl bg-background/90 px-2 py-1">
        <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Level {levelNumber}
        </p>
        <p className="font-heading leading-tight font-bold">{topic.shortTitle}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">~{topic.estimatedMinutes} min</p>
      </div>
    </li>
  )
}

export function RoadmapMap() {
  const { statuses, completedCount } = useTopicStatuses()
  const ordered = ROADMAP_TOPICS.map((topic) => statuses[topic.id])

  return (
    <div
      className="relative mx-auto mt-16 w-full max-w-3xl"
      style={{ height: (ROADMAP_TOPICS.length - 1) * ROW_HEIGHT_PX + 150 }}
    >
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: ROADMAP_TOPICS.length * ROW_HEIGHT_PX }}
      >
        <Path segments={MOBILE_SEGMENTS} statuses={ordered} className="md:hidden" />
        <Path segments={DESKTOP_SEGMENTS} statuses={ordered} className="hidden md:block" />
      </div>
      <ol aria-label="Roadmap levels" className="relative">
        {ROADMAP_TOPICS.map((topic, index) => (
          <MapNode
            key={topic.id}
            topic={topic}
            index={index}
            status={statuses[topic.id]}
            isFirstVisit={completedCount === 0}
          />
        ))}
      </ol>
    </div>
  )
}
