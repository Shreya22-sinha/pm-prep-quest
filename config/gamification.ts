import {
  BarChart3,
  Calculator,
  Flame,
  Footprints,
  GraduationCap,
  Map,
  MessagesSquare,
  Mic,
  Search,
  Star,
  type LucideIcon,
} from "lucide-react"

import { GENERIC_PROGRAM_MOCKS, PM_PROGRAMS, type ProgramMock } from "@/content/programs"
import { ROADMAP_TOPICS, type TopicId } from "@/content/topics"
import type { ProgressData } from "@/lib/gamification/schema"
import { CUSTOM_TRACK_PREFIX } from "@/lib/programs/track"

// All gamification numbers live here so they are easy to tune (spec section 4).

export const XP_REWARDS = {
  topicCompleted: 50,
  interviewCompleted: 100,
  interviewHighScoreBonus: 50,
  practiceQuestion: 20,
  followUpAnswered: 10,
  /** On top of the interview's own XP, the first time each program mock is completed. */
  programMockCompleted: 50,
} as const

/** Interview score (0–100) that counts as "scoring well". */
export const HIGH_SCORE_THRESHOLD = 80

export const STREAK_BADGE_DAYS = 7

export type LevelDefinition = {
  level: number
  name: string
  minXp: number
  tagline: string
}

/** Must be sorted by minXp, starting at 0. */
export const LEVELS: readonly LevelDefinition[] = [
  {
    level: 1,
    name: "Curious Explorer",
    minXp: 0,
    tagline: "Every great PM started right here. Welcome!",
  },
  {
    level: 2,
    name: "Aspiring PM",
    minXp: 100,
    tagline: "You're building real foundations. Keep that momentum going.",
  },
  {
    level: 3,
    name: "Product Thinker",
    minXp: 300,
    tagline: "You're starting to think like a product manager.",
  },
  {
    level: 4,
    name: "Strategy Builder",
    minXp: 600,
    tagline: "You can see the bigger picture now. That's a big deal.",
  },
  {
    level: 5,
    name: "Interview Ready",
    minXp: 1000,
    tagline: "You're ready to walk into the room with confidence.",
  },
  {
    level: 6,
    name: "Offer Hunter",
    minXp: 1500,
    tagline: "You've put in the work. Go get that offer!",
  },
]

export type BadgeDefinition = {
  id: string
  name: string
  /** How to earn it, shown on locked badges too. */
  description: string
  icon: LucideIcon
  isEarned: (data: ProgressData) => boolean
}

const hasTopic = (data: ProgressData, id: TopicId) => data.completedTopicIds.includes(id)

const CORE_BADGES = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first roadmap level.",
    icon: Footprints,
    isEarned: (data) => data.completedTopicIds.length >= 1,
  },
  {
    id: "first-interview",
    name: "First Interview",
    description: "Finish your first mock interview.",
    icon: MessagesSquare,
    isEarned: (data) => data.interviews.length >= 1,
  },
  {
    id: "metrics-master",
    name: "Metrics Master",
    description: "Complete the Product Metrics level.",
    icon: BarChart3,
    isEarned: (data) => hasTopic(data, "metrics"),
  },
  {
    id: "rca-detective",
    name: "RCA Detective",
    description: "Complete the Root Cause Analysis level.",
    icon: Search,
    isEarned: (data) => hasTopic(data, "rca"),
  },
  {
    id: "guesstimate-guru",
    name: "Guesstimate Guru",
    description: "Complete the Guesstimates & Market Sizing level.",
    icon: Calculator,
    isEarned: (data) => hasTopic(data, "guesstimates"),
  },
  {
    id: "voice-warrior",
    name: "Voice Warrior",
    description: "Finish your first voice interview.",
    icon: Mic,
    isEarned: (data) => data.interviews.some((interview) => interview.mode === "voice"),
  },
  {
    id: "high-flyer",
    name: "High Flyer",
    description: `Score ${HIGH_SCORE_THRESHOLD} or more in a mock interview.`,
    icon: Star,
    isEarned: (data) =>
      data.interviews.some((interview) => interview.overallScore >= HIGH_SCORE_THRESHOLD),
  },
  {
    id: "streak-7",
    name: "7-Day Streak",
    description: `Practise ${STREAK_BADGE_DAYS} days in a row.`,
    icon: Flame,
    isEarned: (data) => data.streak.longest >= STREAK_BADGE_DAYS,
  },
  {
    id: "roadmap-champion",
    name: "Roadmap Champion",
    description: "Complete every level on the roadmap.",
    icon: Map,
    isEarned: (data) => ROADMAP_TOPICS.every((topic) => hasTopic(data, topic.id)),
  },
] as const satisfies readonly BadgeDefinition[]

const completesTrack = (completedMockIds: readonly string[], mocks: readonly ProgramMock[]) =>
  mocks.every((mock) => completedMockIds.includes(mock.id))

/** One badge per listed program track (spec 5.3 step 5.6), plus one for typed-in programs. */
const PROGRAM_BADGES: readonly BadgeDefinition[] = [
  ...PM_PROGRAMS.map((program): BadgeDefinition => ({
    id: `program-${program.id}`,
    name: `${program.company} Track Champion`,
    description: `Complete all ${program.mocks.length} ${program.company} program mock interviews.`,
    icon: GraduationCap,
    isEarned: (data) =>
      completesTrack(data.programTracks[program.id]?.completedMockIds ?? [], program.mocks),
  })),
  {
    id: "program-custom",
    name: "Program Track Champion",
    description: "Complete every mock interview in a program track you added yourself.",
    icon: GraduationCap,
    isEarned: (data) =>
      Object.entries(data.programTracks).some(
        ([key, track]) =>
          key.startsWith(CUSTOM_TRACK_PREFIX) &&
          completesTrack(track.completedMockIds, GENERIC_PROGRAM_MOCKS)
      ),
  },
]

export const BADGES: readonly BadgeDefinition[] = [...CORE_BADGES, ...PROGRAM_BADGES]

export type BadgeId = string
