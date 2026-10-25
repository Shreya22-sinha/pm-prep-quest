// The roadmap levels, in learning order (spec 5.2). Lesson content for each
// topic lives in content/topic-lessons.ts; ids are stable because saved
// progress refers to them.
export const ROADMAP_TOPICS = [
  {
    id: "fundamentals",
    title: "PM Fundamentals",
    shortTitle: "Fundamentals",
    estimatedMinutes: 20,
  },
  {
    id: "product-sense",
    title: "Product Design & Product Sense",
    shortTitle: "Product Sense",
    estimatedMinutes: 40,
  },
  {
    id: "metrics",
    title: "Product Metrics & Success Metrics",
    shortTitle: "Metrics",
    estimatedMinutes: 35,
  },
  {
    id: "rca",
    title: "Root Cause Analysis",
    shortTitle: "Root Cause Analysis",
    estimatedMinutes: 30,
  },
  {
    id: "guesstimates",
    title: "Guesstimates & Market Sizing",
    shortTitle: "Guesstimates",
    estimatedMinutes: 30,
  },
  { id: "strategy", title: "Product Strategy", shortTitle: "Strategy", estimatedMinutes: 35 },
  { id: "growth", title: "Product Growth", shortTitle: "Growth", estimatedMinutes: 30 },
  { id: "gtm", title: "Go-To-Market", shortTitle: "Go-To-Market", estimatedMinutes: 25 },
  {
    id: "analytics",
    title: "Analytics & Data Interpretation",
    shortTitle: "Analytics",
    estimatedMinutes: 30,
  },
  {
    id: "technical",
    title: "Technical Basics for PMs",
    shortTitle: "Technical Basics",
    estimatedMinutes: 30,
  },
  {
    id: "behavioral",
    title: "Behavioral & Leadership",
    shortTitle: "Behavioral",
    estimatedMinutes: 30,
  },
  {
    id: "mock-interviews",
    title: "Mock Interviews",
    shortTitle: "Mock Interviews",
    estimatedMinutes: 30,
  },
] as const

export type RoadmapTopic = (typeof ROADMAP_TOPICS)[number]
export type TopicId = RoadmapTopic["id"]

/** The final level is practised in the Interview Arena rather than a lesson page. */
export const ARENA_TOPIC_ID = "mock-interviews" satisfies TopicId

const topicIds: ReadonlySet<string> = new Set(ROADMAP_TOPICS.map((topic) => topic.id))

export function isTopicId(value: string): value is TopicId {
  return topicIds.has(value)
}

export function getTopic(id: TopicId): RoadmapTopic {
  const topic = ROADMAP_TOPICS.find((item) => item.id === id)
  if (!topic) throw new Error(`Unknown topic: ${id}`)
  return topic
}

export function getTopicIndex(id: TopicId): number {
  return ROADMAP_TOPICS.findIndex((topic) => topic.id === id)
}

export function getTopicHref(id: TopicId): string {
  return id === ARENA_TOPIC_ID ? "/interview" : `/roadmap/${id}`
}
