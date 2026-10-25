import {
  INTERVIEW_SETTINGS,
  type InterviewLength,
  type InterviewLevel,
  type InterviewMode,
  type InterviewPath,
} from "@/config/interview"
import { SUPPORTED_BROWSERS_HINT } from "@/config/voice"
import { formatProgramName, getProgram } from "@/content/programs"
import { interviewSetupSchema, type InterviewSetup } from "@/lib/interview/schema"

export const WIZARD_STEPS = ["Choose your path", "Your level", "Interview style", "Review"] as const

export const CUSTOM_PROGRAM_ID = "custom"

export type WizardDraft = {
  path: InterviewPath | null
  jobDescription: string
  /** A program id from content/programs.ts, CUSTOM_PROGRAM_ID, or null. */
  programId: string | null
  customProgram: string
  resumeText: string
  level: InterviewLevel | null
  mode: InterviewMode
  length: InterviewLength
}

export const EMPTY_DRAFT: WizardDraft = {
  path: null,
  jobDescription: "",
  programId: null,
  customProgram: "",
  resumeText: "",
  level: null,
  mode: "written",
  length: "standard",
}

export type DraftErrors = Partial<
  Record<"path" | "jobDescription" | "programId" | "customProgram" | "level" | "mode", string>
>

/** Friendly errors for one wizard step; empty when the step is complete. */
export function validateStep(
  step: number,
  draft: WizardDraft,
  { voiceSupported }: { voiceSupported: boolean } = { voiceSupported: false }
): DraftErrors {
  const errors: DraftErrors = {}
  if (step === 0) {
    if (!draft.path) errors.path = "Choose a job or a PM program to get started."
    if (
      draft.path === "job" &&
      draft.jobDescription.trim().length < INTERVIEW_SETTINGS.minJobDescriptionChars
    ) {
      errors.jobDescription = `Paste the job description (at least ${INTERVIEW_SETTINGS.minJobDescriptionChars} characters) so we can tailor your questions.`
    }
    if (draft.path === "program") {
      if (!draft.programId) errors.programId = "Choose a program, or pick “Another program”."
      else if (draft.programId === CUSTOM_PROGRAM_ID && draft.customProgram.trim().length < 2) {
        errors.customProgram = "Type the name of the program you're preparing for."
      }
    }
  }
  if (step === 1 && !draft.level) errors.level = "Choose the level that fits you best."
  if (step === 2 && draft.mode === "voice" && !voiceSupported) {
    errors.mode = `Voice answers aren't available in this browser. Choose written, or try ${SUPPORTED_BROWSERS_HINT}.`
  }
  return errors
}

function programFromDraft(draft: WizardDraft): InterviewSetup["program"] {
  if (draft.path !== "program" || !draft.programId) return null
  if (draft.programId === CUSTOM_PROGRAM_ID) {
    return { id: null, name: draft.customProgram.trim() }
  }
  const program = getProgram(draft.programId)
  return program ? { id: program.id, name: formatProgramName(program) } : null
}

/** Converts a completed draft into a validated setup, or null if anything is missing. */
export function draftToSetup(draft: WizardDraft): InterviewSetup | null {
  const parsed = interviewSetupSchema.safeParse({
    path: draft.path,
    jobDescription: draft.path === "job" ? draft.jobDescription.trim() : null,
    program: programFromDraft(draft),
    resumeText: draft.resumeText.trim() || null,
    level: draft.level,
    mode: draft.mode,
    length: draft.length,
  })
  return parsed.success ? parsed.data : null
}
