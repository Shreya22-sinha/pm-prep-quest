import { CATEGORY_TOPIC } from "@/config/interview"
import {
  formatProgramName,
  GENERIC_PROGRAM_MOCKS,
  getProgram,
  type ProgramMock,
} from "@/content/programs"
import type { TopicId } from "@/content/topics"

// Program tracks (spec 5.3 step 5.6): a prep plan plus program-themed mock
// interviews that unlock one at a time.

export const CUSTOM_TRACK_PREFIX = "custom:"

export type ProgramTrack = {
  /** Stable id for saved progress: the program id, or "custom:<name>" for typed-in programs. */
  key: string
  name: string
  company: string | null
  description: string | null
  focusAreas: readonly string[]
  careersUrl: string | null
  mocks: readonly ProgramMock[]
  /** Roadmap levels to review, in learning order. */
  recommendedTopicIds: TopicId[]
}

export type MockStatus = "complete" | "available" | "locked"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function isCustomTrackKey(key: string): boolean {
  return key.startsWith(CUSTOM_TRACK_PREFIX)
}

export function trackKeyFor(program: { id: string | null; name: string }): string {
  return program.id ?? `${CUSTOM_TRACK_PREFIX}${slugify(program.name)}`
}

/** Fundamentals first, then the levels behind each mock's focus, without repeats. */
export function recommendedTopicsFor(mocks: readonly ProgramMock[]): TopicId[] {
  const topics: TopicId[] = ["fundamentals"]
  for (const mock of mocks) {
    for (const category of mock.focusCategories) {
      const topic = CATEGORY_TOPIC[category]
      if (!topics.includes(topic)) topics.push(topic)
    }
  }
  return topics
}

/** The track for a program chosen in the wizard (listed or typed in). */
export function getProgramTrack(program: { id: string | null; name: string }): ProgramTrack {
  const listed = program.id ? getProgram(program.id) : undefined
  const mocks = listed?.mocks ?? GENERIC_PROGRAM_MOCKS
  return {
    key: trackKeyFor(program),
    name: listed ? formatProgramName(listed) : program.name,
    company: listed?.company ?? null,
    description: listed?.description ?? null,
    focusAreas: listed?.focusAreas ?? [],
    careersUrl: listed?.careersUrl ?? null,
    mocks,
    recommendedTopicIds: recommendedTopicsFor(mocks),
  }
}

/** The track for a saved progress entry. */
export function getTrackByKey(key: string, savedName: string): ProgramTrack {
  return getProgramTrack({ id: isCustomTrackKey(key) ? null : key, name: savedName })
}

export function getMock(track: ProgramTrack, mockId: string): ProgramMock | undefined {
  return track.mocks.find((mock) => mock.id === mockId)
}

/** Mocks unlock in order: each one opens once the previous one is complete. */
export function getMockStatuses(
  mocks: readonly ProgramMock[],
  completedMockIds: readonly string[]
): MockStatus[] {
  let previousComplete = true
  return mocks.map((mock) => {
    const complete = completedMockIds.includes(mock.id)
    const status: MockStatus = complete ? "complete" : previousComplete ? "available" : "locked"
    previousComplete = complete
    return status
  })
}
