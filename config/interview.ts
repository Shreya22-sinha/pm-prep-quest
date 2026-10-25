// Interview Arena settings (spec 5.3). Shared by the wizard, the API routes
// and the progress history.

export const INTERVIEW_PATHS = ["job", "program"] as const
export type InterviewPath = (typeof INTERVIEW_PATHS)[number]

export const INTERVIEW_LEVELS = ["fresher", "intermediate", "experienced"] as const
export type InterviewLevel = (typeof INTERVIEW_LEVELS)[number]

export const INTERVIEW_MODES = ["written", "voice"] as const
export type InterviewMode = (typeof INTERVIEW_MODES)[number]

export const INTERVIEW_LENGTHS = ["quick", "standard", "full"] as const
export type InterviewLength = (typeof INTERVIEW_LENGTHS)[number]

export const INTERVIEW_CATEGORIES = [
  "product-design",
  "metrics",
  "rca",
  "guesstimate",
  "strategy",
  "growth",
  "gtm",
  "analytics",
  "technical",
  "behavioral",
] as const
export type InterviewCategory = (typeof INTERVIEW_CATEGORIES)[number]

export const INTERVIEW_LEVEL_LABELS: Record<InterviewLevel, string> = {
  fresher: "Fresher",
  intermediate: "Intermediate",
  experienced: "Experienced",
}

export const INTERVIEW_MODE_LABELS: Record<InterviewMode, string> = {
  written: "Written",
  voice: "Voice",
}

export const INTERVIEW_CATEGORY_LABELS: Record<InterviewCategory, string> = {
  "product-design": "Product design",
  metrics: "Metrics",
  rca: "Root cause analysis",
  guesstimate: "Guesstimate",
  strategy: "Strategy",
  growth: "Growth",
  gtm: "Go-to-market",
  analytics: "Analytics",
  technical: "Technical",
  behavioral: "Behavioral",
}

/** The roadmap level (and resource tag) that teaches each interview category. */
export const CATEGORY_TOPIC: Record<
  InterviewCategory,
  | "product-sense"
  | "metrics"
  | "rca"
  | "guesstimates"
  | "strategy"
  | "growth"
  | "gtm"
  | "analytics"
  | "technical"
  | "behavioral"
> = {
  "product-design": "product-sense",
  metrics: "metrics",
  rca: "rca",
  guesstimate: "guesstimates",
  strategy: "strategy",
  growth: "growth",
  gtm: "gtm",
  analytics: "analytics",
  technical: "technical",
  behavioral: "behavioral",
}

export const INTERVIEW_LEVEL_DETAILS: Record<
  InterviewLevel,
  { experience: string; description: string; promptGuidance: string }
> = {
  fresher: {
    experience: "0–1 years · APM-style",
    description:
      "Friendly questions on product sense, simple metrics, estimation and your motivation. Great for students and career switchers.",
    promptGuidance:
      "Early-career or APM candidate. Focus on product sense, user empathy, simple metrics, guesstimates and motivation. Keep scenarios concrete and approachable; avoid deep org-leadership questions.",
  },
  intermediate: {
    experience: "2–5 years",
    description:
      "A balanced mix: product design, metrics, root cause analysis, strategy and stories about working with teams.",
    promptGuidance:
      "Mid-level PM. Balance product design, metrics, RCA, strategy and behavioral questions about cross-functional work and prioritisation.",
  },
  experienced: {
    experience: "5+ years · Senior PM",
    description:
      "More ambiguity: strategy, trade-offs, leading through influence and making big calls with incomplete data.",
    promptGuidance:
      "Senior PM. Emphasise strategy, ambiguous problems, trade-offs, leadership through influence, stakeholder management and business impact.",
  },
}

export const INTERVIEW_LENGTH_DETAILS: Record<
  InterviewLength,
  { label: string; questionCount: number; minutes: string }
> = {
  quick: { label: "Quick", questionCount: 3, minutes: "~15 min" },
  standard: { label: "Standard", questionCount: 5, minutes: "~25 min" },
  full: { label: "Full", questionCount: 8, minutes: "~40 min" },
}

export const INTERVIEW_SETTINGS = {
  /** Short follow-ups the interviewer may ask per question when an answer is thin. 0 disables them. */
  followUpsPerQuestion: 1,
  /** Shown by the optional soft timer; never enforced. */
  suggestedMinutesPerQuestion: 5,
  maxJobDescriptionChars: 15_000,
  maxResumeChars: 15_000,
  maxAnswerChars: 6_000,
  minJobDescriptionChars: 80,
  maxResumeFileBytes: 5 * 1024 * 1024,
  /** Finished and unfinished sessions kept in the browser. */
  maxStoredSessions: 20,
} as const

/** Shown between questions, and as a fallback when the AI's reaction isn't available. */
export const ENCOURAGEMENTS = [
  "Nice work. On to the next one!",
  "Good thinking. Keep that momentum going.",
  "Every answer makes the next one easier.",
  "You're doing great. Deep breath, next question.",
  "Solid effort. Let's keep going!",
] as const

export const SKIP_MESSAGE = "No worries. Skipping is part of practising. Let's try the next one."
