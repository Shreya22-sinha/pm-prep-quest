import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { INTERVIEW_SETTINGS, SKIP_MESSAGE } from "@/config/interview"
import type { InterviewEvaluation, ResumeFeedback } from "@/lib/interview/feedback-schema"
import type { InterviewSetup, StartResponse } from "@/lib/interview/schema"
import {
  interviewSessionSchema,
  newTurn,
  type InterviewRewards,
  type InterviewSession,
  type InterviewTurn,
  type PracticeAttempt,
} from "@/lib/interview/session"
import { appStorage, STORAGE_KEYS } from "@/lib/storage"

type SessionsState = { sessions: Record<string, InterviewSession> }

type InterviewActions = {
  /** Creates a session from the AI's plan and returns its id. */
  createSession: (setup: InterviewSetup, plan: StartResponse) => string
  markHintUsed: (id: string, index: number) => void
  /** Saves an answer with the interviewer's reaction (a follow-up, or straight to done). */
  recordAnswer: (
    id: string,
    index: number,
    answer: string,
    reaction: { followUp: string | null; encouragement: string }
  ) => void
  /** Saves the follow-up answer (null when skipped) and finishes the question. */
  recordFollowUp: (id: string, index: number, answer: string | null, encouragement: string) => void
  skipQuestion: (id: string, index: number) => void
  /** Moves to the next question, or completes the interview after the last one. */
  advance: (id: string) => void
  deleteSession: (id: string) => void
  /** Switches an interview between voice and written answers (e.g. when voice isn't supported). */
  setMode: (id: string, mode: InterviewSetup["mode"]) => void
  saveEvaluation: (id: string, evaluation: InterviewEvaluation, rewards: InterviewRewards) => void
  saveResumeFeedback: (id: string, feedback: ResumeFeedback) => void
  savePracticeAttempt: (id: string, key: string, attempt: PracticeAttempt) => void
}

export type InterviewStore = SessionsState & InterviewActions

function updateTurn(
  sessions: Record<string, InterviewSession>,
  id: string,
  index: number,
  update: (turn: InterviewTurn) => InterviewTurn
): Record<string, InterviewSession> {
  const session = sessions[id]
  const turn = session?.turns[index]
  if (!session || !turn) return sessions
  const turns = session.turns.map((item, i) => (i === index ? update(item) : item))
  return { ...sessions, [id]: { ...session, turns } }
}

function updateSession(
  sessions: Record<string, InterviewSession>,
  id: string,
  changes: Partial<InterviewSession>
): SessionsState | Record<string, never> {
  const session = sessions[id]
  if (!session) return {}
  return { sessions: { ...sessions, [id]: { ...session, ...changes } } }
}

/** Keeps the newest sessions so browser storage stays small. */
function pruneSessions(
  sessions: Record<string, InterviewSession>
): Record<string, InterviewSession> {
  const sorted = Object.values(sessions).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return Object.fromEntries(
    sorted.slice(0, INTERVIEW_SETTINGS.maxStoredSessions).map((session) => [session.id, session])
  )
}

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set) => ({
      sessions: {},

      createSession: (setup, plan) => {
        const id = crypto.randomUUID()
        const session: InterviewSession = {
          id,
          createdAt: new Date().toISOString(),
          completedAt: null,
          setup,
          targetLabel: plan.targetLabel,
          greeting: plan.greeting,
          turns: plan.questions.map(newTurn),
          currentIndex: 0,
          evaluation: null,
          resumeFeedback: null,
          rewards: null,
          practice: {},
        }
        set((state) => ({ sessions: pruneSessions({ ...state.sessions, [id]: session }) }))
        return id
      },

      markHintUsed: (id, index) =>
        set((state) => ({
          sessions: updateTurn(state.sessions, id, index, (turn) => ({ ...turn, hintUsed: true })),
        })),

      recordAnswer: (id, index, answer, reaction) =>
        set((state) => ({
          sessions: updateTurn(state.sessions, id, index, (turn) =>
            reaction.followUp
              ? {
                  ...turn,
                  answer,
                  status: "follow-up",
                  followUp: { question: reaction.followUp, answer: null, skipped: false },
                }
              : { ...turn, answer, status: "done", encouragement: reaction.encouragement }
          ),
        })),

      recordFollowUp: (id, index, answer, encouragement) =>
        set((state) => ({
          sessions: updateTurn(state.sessions, id, index, (turn) => ({
            ...turn,
            status: "done",
            encouragement,
            followUp: turn.followUp && { ...turn.followUp, answer, skipped: answer === null },
          })),
        })),

      skipQuestion: (id, index) =>
        set((state) => ({
          sessions: updateTurn(state.sessions, id, index, (turn) => ({
            ...turn,
            status: "done",
            skipped: true,
            encouragement: SKIP_MESSAGE,
          })),
        })),

      advance: (id) =>
        set((state) => {
          const session = state.sessions[id]
          if (!session || session.completedAt) return state
          const isLast = session.currentIndex >= session.turns.length - 1
          return {
            sessions: {
              ...state.sessions,
              [id]: isLast
                ? { ...session, completedAt: new Date().toISOString() }
                : { ...session, currentIndex: session.currentIndex + 1 },
            },
          }
        }),

      setMode: (id, mode) =>
        set((state) => {
          const session = state.sessions[id]
          if (!session) return state
          return updateSession(state.sessions, id, { setup: { ...session.setup, mode } })
        }),

      saveEvaluation: (id, evaluation, rewards) =>
        set((state) => updateSession(state.sessions, id, { evaluation, rewards })),

      saveResumeFeedback: (id, feedback) =>
        set((state) => updateSession(state.sessions, id, { resumeFeedback: feedback })),

      savePracticeAttempt: (id, key, attempt) =>
        set((state) => {
          const session = state.sessions[id]
          if (!session) return state
          return updateSession(state.sessions, id, {
            practice: { ...session.practice, [key]: attempt },
          })
        }),

      deleteSession: (id) =>
        set((state) => ({
          sessions: Object.fromEntries(
            Object.entries(state.sessions).filter(([sessionId]) => sessionId !== id)
          ),
        })),
    }),
    {
      name: STORAGE_KEYS.interviews,
      version: 1,
      storage: createJSONStorage(() => appStorage),
      partialize: (state): SessionsState => ({ sessions: state.sessions }),
      skipHydration: true,
      // Validate each saved session on its own, so one bad entry doesn't wipe the rest.
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === "object" && "sessions" in persisted
            ? (persisted as { sessions: unknown }).sessions
            : null
        if (!raw || typeof raw !== "object") return current
        const sessions: Record<string, InterviewSession> = {}
        for (const value of Object.values(raw)) {
          const parsed = interviewSessionSchema.safeParse(value)
          if (parsed.success) sessions[parsed.data.id] = parsed.data
        }
        return { ...current, sessions }
      },
    }
  )
)

/** The most recent interview that hasn't been finished, if any. */
export function selectUnfinishedSession(state: InterviewStore): InterviewSession | undefined {
  return Object.values(state.sessions)
    .filter((session) => !session.completedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
}
