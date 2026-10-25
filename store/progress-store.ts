import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { HIGH_SCORE_THRESHOLD, XP_REWARDS } from "@/config/gamification"
import { ARENA_TOPIC_ID, getTopic, isTopicId, type TopicId } from "@/content/topics"
import {
  applyProgress,
  INITIAL_PROGRESS,
  type GamificationEvent,
  type ProgressChange,
} from "@/lib/gamification/engine"
import {
  progressDataSchema,
  type InterviewRecord,
  type ProgressData,
} from "@/lib/gamification/schema"
import { appStorage, STORAGE_KEYS } from "@/lib/storage"

export type NewInterview = Omit<InterviewRecord, "id" | "completedAt" | "xpEarned"> & {
  /** The interview session's id, so the history can link to its results. */
  id?: string
}
export type PracticeKind = "practiceQuestion" | "followUpAnswered"

/** Events the UI shows as toasts (XP gains, badges). */
export type ToastEvent = Exclude<GamificationEvent, { type: "level-up" }>

type ProgressActions = {
  /** Marks a roadmap topic complete. Returns false if it already was. */
  completeTopic: (topicId: TopicId) => boolean
  /** Saves a finished interview and awards XP for it. Recording the same id twice does nothing. */
  recordInterview: (interview: NewInterview) => InterviewRecord
  recordPractice: (kind: PracticeKind) => void
  /** Starts (or updates) a program track, remembering where it continues. No XP. */
  trackProgram: (key: string, name: string, sessionId: string) => void
  /** Completes a program mock once, with bonus XP. Returns false if it already was. */
  completeProgramMock: (
    track: { key: string; name: string },
    mock: { id: string; title: string },
    sessionId: string
  ) => boolean
  /** Generic XP award, for rewards that aren't tied to other data. */
  awardXp: (amount: number, reason: string) => void
  dismissToastEvent: (id: string) => void
  clearLevelUp: () => void
  resetProgress: () => void
}

type ProgressUiState = {
  toastEvents: ToastEvent[]
  /** Level just reached, waiting for the level-up celebration. */
  pendingLevelUp: number | null
}

export type ProgressStore = ProgressData & ProgressUiState & ProgressActions

const PRACTICE_REASONS: Record<PracticeKind, string> = {
  practiceQuestion: "Practice question answered",
  followUpAnswered: "Follow-up question answered",
}

function pickData(state: ProgressData): ProgressData {
  return {
    xp: state.xp,
    completedTopicIds: state.completedTopicIds,
    unlockedBadges: state.unlockedBadges,
    streak: state.streak,
    interviews: state.interviews,
    programTracks: state.programTracks,
  }
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => {
      const commit = (change: ProgressChange) => {
        const result = applyProgress(pickData(get()), change)
        const levelUp = result.events.findLast((event) => event.type === "level-up")
        set((state) => ({
          ...result.data,
          toastEvents: [
            ...state.toastEvents,
            ...result.events.filter((event): event is ToastEvent => event.type !== "level-up"),
          ],
          pendingLevelUp: levelUp ? levelUp.level : state.pendingLevelUp,
        }))
      }

      return {
        ...INITIAL_PROGRESS,
        toastEvents: [],
        pendingLevelUp: null,

        completeTopic: (topicId) => {
          if (get().completedTopicIds.includes(topicId)) return false
          commit({
            xp: XP_REWARDS.topicCompleted,
            reason: `Level complete: ${getTopic(topicId).title}`,
            update: (data) => ({
              ...data,
              completedTopicIds: [...data.completedTopicIds, topicId],
            }),
          })
          return true
        },

        recordInterview: ({ id, ...interview }) => {
          const existing = id && get().interviews.find((item) => item.id === id)
          if (existing) return existing

          const xpEarned =
            XP_REWARDS.interviewCompleted +
            (interview.overallScore >= HIGH_SCORE_THRESHOLD
              ? XP_REWARDS.interviewHighScoreBonus
              : 0)
          const record: InterviewRecord = {
            ...interview,
            id: id ?? crypto.randomUUID(),
            completedAt: new Date().toISOString(),
            xpEarned,
          }
          commit({
            xp: xpEarned,
            reason: "Mock interview complete",
            update: (data) => ({
              ...data,
              interviews: [record, ...data.interviews],
              // The roadmap's final level is completed by doing a mock interview.
              completedTopicIds: data.completedTopicIds.includes(ARENA_TOPIC_ID)
                ? data.completedTopicIds
                : [...data.completedTopicIds, ARENA_TOPIC_ID],
            }),
          })
          return record
        },

        recordPractice: (kind) => {
          commit({ xp: XP_REWARDS[kind], reason: PRACTICE_REASONS[kind] })
        },

        trackProgram: (key, name, sessionId) =>
          set((state) => ({
            programTracks: {
              ...state.programTracks,
              [key]: {
                name,
                completedMockIds: state.programTracks[key]?.completedMockIds ?? [],
                lastSessionId: sessionId,
              },
            },
          })),

        completeProgramMock: (track, mock, sessionId) => {
          if (get().programTracks[track.key]?.completedMockIds.includes(mock.id)) return false
          commit({
            xp: XP_REWARDS.programMockCompleted,
            reason: `Program mock complete: ${mock.title}`,
            update: (data) => ({
              ...data,
              programTracks: {
                ...data.programTracks,
                [track.key]: {
                  name: track.name,
                  completedMockIds: [
                    ...(data.programTracks[track.key]?.completedMockIds ?? []),
                    mock.id,
                  ],
                  lastSessionId: sessionId,
                },
              },
            }),
          })
          return true
        },

        awardXp: (amount, reason) => {
          commit({ xp: amount, reason })
        },

        dismissToastEvent: (id) => {
          set((state) => ({ toastEvents: state.toastEvents.filter((event) => event.id !== id) }))
        },

        clearLevelUp: () => set({ pendingLevelUp: null }),

        resetProgress: () => set({ ...INITIAL_PROGRESS, toastEvents: [], pendingLevelUp: null }),
      }
    },
    {
      name: STORAGE_KEYS.progress,
      version: 1,
      storage: createJSONStorage(() => appStorage),
      // Only the progress data is saved; UI state (toasts, pending level-up) is not.
      partialize: (state): ProgressData => pickData(state),
      // Hydrated by <ProgressHydrator /> after the first render, so the server
      // HTML and the browser's first render match.
      skipHydration: true,
      merge: (persisted, current) => {
        const parsed = progressDataSchema.safeParse(persisted)
        if (!parsed.success) return current
        return {
          ...current,
          ...parsed.data,
          completedTopicIds: parsed.data.completedTopicIds.filter(isTopicId),
        }
      },
    }
  )
)
