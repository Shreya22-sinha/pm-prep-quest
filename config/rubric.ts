import type { InterviewCategory } from "@/config/interview"

// The evaluation rubric (spec section 6). It is written into the evaluator
// prompt so every answer is scored against the same yardstick.

export const RUBRIC_DIMENSIONS = {
  structure: "Organises the answer clearly: a framework or logical steps, signposted.",
  userFocus: "Grounds the answer in specific users and their real needs.",
  creativity: "Offers fresh, thoughtful ideas rather than only the obvious.",
  metrics: "Defines success with sensible, measurable outcomes.",
  prioritisation: "Makes clear choices and explains the trade-offs.",
  communication: "Is concise, confident and easy to follow.",
} as const

export type RubricDimension = keyof typeof RUBRIC_DIMENSIONS

export const CATEGORY_RUBRIC: Record<
  InterviewCategory,
  { focus: readonly RubricDimension[]; lookFor: string }
> = {
  "product-design": {
    focus: ["structure", "userFocus", "creativity", "prioritisation"],
    lookFor:
      "Clarifies the goal, picks a user segment, identifies pain points, prioritises one, proposes and compares solutions, and defines success.",
  },
  metrics: {
    focus: ["structure", "metrics", "userFocus"],
    lookFor:
      "Ties metrics to the product goal and user journey, proposes a North Star with supporting metrics, and adds guardrails.",
  },
  rca: {
    focus: ["structure", "prioritisation", "communication"],
    lookFor:
      "Clarifies the change, rules out data issues, checks external factors, segments the data, forms and tests hypotheses, and recommends a fix.",
  },
  guesstimate: {
    focus: ["structure", "communication"],
    lookFor:
      "Clarifies scope, writes the formula first, states reasonable assumptions, calculates cleanly and sanity-checks the result.",
  },
  strategy: {
    focus: ["structure", "prioritisation", "communication"],
    lookFor:
      "Analyses company, customers and competitors, lays out real options and commits to a reasoned recommendation with risks.",
  },
  growth: {
    focus: ["structure", "metrics", "prioritisation"],
    lookFor:
      "Diagnoses the weakest funnel stage before suggesting tactics, prioritises ideas and names the metric that proves success.",
  },
  gtm: {
    focus: ["userFocus", "structure", "prioritisation"],
    lookFor:
      "Defines a specific first customer, value proposition, pricing, channels and a phased launch with success metrics.",
  },
  analytics: {
    focus: ["structure", "metrics", "communication"],
    lookFor:
      "Reads the data carefully, questions significance and confounders, segments, and turns findings into a decision.",
  },
  technical: {
    focus: ["structure", "communication"],
    lookFor:
      "Explains systems simply and accurately, names the main components and discusses trade-offs and user impact.",
  },
  behavioral: {
    focus: ["structure", "communication"],
    lookFor:
      "Tells a specific story (STAR) with a clear personal role, concrete actions, a measurable result and honest reflection.",
  },
}

/** Score bands for the verdict shown on each question. */
export const SCORE_BANDS = {
  strong: 80,
  partial: 50,
} as const

export const VERDICT_LABELS = {
  strong: "Strong",
  partial: "Partially correct",
  "needs-work": "Needs work",
  skipped: "Skipped",
} as const

/** Categories averaging below this get practice questions and resources. */
export const WEAK_CATEGORY_THRESHOLD = 70

export const PRACTICE_QUESTIONS_PER_CATEGORY = { min: 3, max: 5 } as const
export const MAX_PRACTICE_CATEGORIES = 3

/** The evaluator sees at most this much of the job description. */
export const EVALUATION_CONTEXT_CHARS = 4_000
