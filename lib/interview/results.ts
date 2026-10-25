import { EVALUATION_CONTEXT_CHARS } from "@/config/rubric"
import { getProgram } from "@/content/programs"
import type {
  EvaluateRequest,
  InterviewEvaluation,
  ResumeFeedbackRequest,
} from "@/lib/interview/feedback-schema"
import type { InterviewRewards, InterviewSession } from "@/lib/interview/session"
import { getMock, getProgramTrack } from "@/lib/programs/track"
import { useProgressStore } from "@/store/progress-store"

/** Job description excerpt or program summary that helps tailor feedback. */
function targetContext(session: InterviewSession): string | null {
  const { setup } = session
  if (setup.path === "job") return setup.jobDescription?.slice(0, EVALUATION_CONTEXT_CHARS) ?? null
  if (!setup.program) return null
  const program = setup.program.id ? getProgram(setup.program.id) : undefined
  return program
    ? `${program.company} ${program.name}. Typical focus areas: ${program.focusAreas.join(", ")}.`
    : setup.program.name
}

export function buildEvaluateRequest(session: InterviewSession): EvaluateRequest {
  return {
    level: session.setup.level,
    path: session.setup.path,
    targetLabel: session.targetLabel,
    context: targetContext(session),
    turns: session.turns.map((turn) => ({
      category: turn.question.category,
      question: turn.question.question,
      answer: turn.skipped ? null : turn.answer,
      followUp: turn.followUp
        ? { question: turn.followUp.question, answer: turn.followUp.answer }
        : null,
    })),
  }
}

export function buildResumeFeedbackRequest(
  session: InterviewSession
): ResumeFeedbackRequest | null {
  if (!session.setup.resumeText) return null
  return {
    level: session.setup.level,
    path: session.setup.path,
    targetLabel: session.targetLabel,
    context: targetContext(session),
    resumeText: session.setup.resumeText,
  }
}

/**
 * Records the interview in the progress store (XP, badges, roadmap level 12,
 * program track) and reports what was earned. Interviews where everything was
 * skipped earn nothing. Call only after saved progress has loaded.
 */
export function awardInterviewRewards(
  session: InterviewSession,
  evaluation: InterviewEvaluation
): InterviewRewards {
  if (evaluation.overallScore === null) return { xpEarned: 0, badgeIds: [] }

  const before = useProgressStore.getState()
  const xpBefore = before.xp
  const badgesBefore = new Set(Object.keys(before.unlockedBadges))

  before.recordInterview({
    id: session.id,
    targetLabel: session.targetLabel,
    path: session.setup.path,
    level: session.setup.level,
    mode: session.setup.mode,
    questionCount: session.turns.length,
    overallScore: evaluation.overallScore,
  })

  const { program, programMockId } = session.setup
  if (session.setup.path === "program" && program) {
    const track = getProgramTrack(program)
    const progress = useProgressStore.getState()
    progress.trackProgram(track.key, track.name, session.id)
    const mock = programMockId ? getMock(track, programMockId) : undefined
    if (mock) progress.completeProgramMock(track, mock, session.id)
  }

  const after = useProgressStore.getState()
  return {
    xpEarned: after.xp - xpBefore,
    badgeIds: Object.keys(after.unlockedBadges).filter((id) => !badgesBefore.has(id)),
  }
}
