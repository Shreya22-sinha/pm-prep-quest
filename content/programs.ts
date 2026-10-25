import type { InterviewCategory, InterviewLength } from "@/config/interview"

// PM programs for path B of the Interview Arena (spec 5.3). Descriptions are
// deliberately general and hedged: no dates, deadlines, eligibility rules or
// interview rounds. Edit freely; items marked "TODO: verify" need a human to
// confirm the careers URL.

/** A program-themed mock interview, unlocked one at a time (spec 5.3 step 5.6). */
export type ProgramMock = {
  /** Stable: saved progress refers to it. */
  id: string
  title: string
  description: string
  /** Categories the AI should mostly draw questions from. */
  focusCategories: readonly InterviewCategory[]
  length: InterviewLength
}

export type PmProgram = {
  id: string
  name: string
  company: string
  description: string
  focusAreas: readonly string[]
  careersUrl: string
  mocks: readonly ProgramMock[]
}

export const PROGRAM_DISCLAIMER =
  "Programs change often. Check the official careers page for current details, eligibility and timelines."

const ALL_ROUND = [
  "product-design",
  "metrics",
  "strategy",
  "behavioral",
] as const satisfies readonly InterviewCategory[]

/** The last mock of every track: a full, mixed practice loop. */
function fullLoop(company: string): ProgramMock {
  return {
    id: "full-loop",
    title: "Full practice loop",
    description: `A longer, mixed interview that brings everything together, themed around ${company}'s products.`,
    focusCategories: ALL_ROUND,
    length: "full",
  }
}

export const PM_PROGRAMS = [
  {
    id: "google-apm",
    name: "Associate Product Manager (APM)",
    company: "Google",
    description:
      "A well-known early-career PM program that has typically included rotations across product areas.",
    focusAreas: ["Product sense", "Analytical thinking", "Technical understanding", "Leadership"],
    careersUrl: "https://www.google.com/about/careers/applications/", // TODO: verify
    mocks: [
      {
        id: "product-sense",
        title: "Product sense warm-up",
        description: "Design and improve products used by billions, with a clear success metric.",
        focusCategories: ["product-design", "metrics"],
        length: "quick",
      },
      {
        id: "analytical",
        title: "Analytical thinking",
        description: "Metrics, estimation and diagnosing a drop in a key number.",
        focusCategories: ["metrics", "guesstimate", "rca"],
        length: "standard",
      },
      {
        id: "technical-leadership",
        title: "Technical & leadership",
        description: "Explain how systems work, then share how you lead without authority.",
        focusCategories: ["technical", "behavioral"],
        length: "standard",
      },
      fullLoop("Google"),
    ],
  },
  {
    id: "microsoft-pm",
    name: "Product Manager (early career)",
    company: "Microsoft",
    description:
      "Early-career product roles that generally focus on customer empathy, collaboration with engineering and clear communication.",
    focusAreas: ["Customer empathy", "Product design", "Collaboration", "Technical understanding"],
    careersUrl: "https://careers.microsoft.com", // TODO: verify
    mocks: [
      {
        id: "customer-empathy",
        title: "Customer empathy warm-up",
        description: "Design for specific customers, including business and productivity users.",
        focusCategories: ["product-design", "behavioral"],
        length: "quick",
      },
      {
        id: "technical-design",
        title: "Technical product design",
        description: "Shape a feature with engineering trade-offs in mind.",
        focusCategories: ["technical", "product-design"],
        length: "standard",
      },
      {
        id: "collaboration",
        title: "Collaboration & strategy",
        description: "Work across teams and make a reasoned product bet.",
        focusCategories: ["behavioral", "strategy"],
        length: "standard",
      },
      fullLoop("Microsoft"),
    ],
  },
  {
    id: "meta-rpm",
    name: "Rotational Product Manager (RPM)",
    company: "Meta",
    description:
      "A rotational program for early-career PMs, generally known for its emphasis on product sense and execution.",
    focusAreas: ["Product sense", "Execution", "Metrics", "Leadership"],
    careersUrl: "https://www.metacareers.com", // TODO: verify
    mocks: [
      {
        id: "product-sense",
        title: "Product sense warm-up",
        description: "Design social and communication products people love.",
        focusCategories: ["product-design"],
        length: "quick",
      },
      {
        id: "execution",
        title: "Execution & metrics",
        description: "Define success, read the data and diagnose what changed.",
        focusCategories: ["metrics", "rca", "analytics"],
        length: "standard",
      },
      {
        id: "leadership",
        title: "Leadership & drive",
        description: "Stories about ownership, conflict and moving fast together.",
        focusCategories: ["behavioral"],
        length: "standard",
      },
      fullLoop("Meta"),
    ],
  },
  {
    id: "uber-apm",
    name: "Associate Product Manager (APM)",
    company: "Uber",
    description:
      "An early-career PM program working on marketplace and mobility products, where data and operations often matter.",
    focusAreas: ["Product sense", "Metrics", "Marketplace thinking", "Analytics"],
    careersUrl: "https://www.uber.com/careers/", // TODO: verify
    mocks: [
      {
        id: "product-sense",
        title: "Product sense warm-up",
        description: "Improve experiences for riders, drivers or eaters.",
        focusCategories: ["product-design", "metrics"],
        length: "quick",
      },
      {
        id: "marketplace",
        title: "Marketplace & metrics",
        description: "Balance two-sided marketplaces and measure their health.",
        focusCategories: ["metrics", "analytics", "strategy"],
        length: "standard",
      },
      {
        id: "operations",
        title: "Operations & growth",
        description: "Diagnose problems in the real world and grow a city launch.",
        focusCategories: ["rca", "growth", "gtm"],
        length: "standard",
      },
      fullLoop("Uber"),
    ],
  },
  {
    id: "linkedin-apm",
    name: "Associate Product Manager (APM)",
    company: "LinkedIn",
    description:
      "An early-career PM program building products for professionals, with a focus on member value and data-informed decisions.",
    focusAreas: ["Product sense", "Metrics", "Strategy", "Communication"],
    careersUrl: "https://careers.linkedin.com", // TODO: verify
    mocks: [
      {
        id: "product-sense",
        title: "Product sense warm-up",
        description: "Create value for professionals, job seekers and recruiters.",
        focusCategories: ["product-design"],
        length: "quick",
      },
      {
        id: "metrics-growth",
        title: "Metrics & growth",
        description: "Grow engagement thoughtfully and measure what matters.",
        focusCategories: ["metrics", "growth"],
        length: "standard",
      },
      {
        id: "strategy-communication",
        title: "Strategy & communication",
        description: "Make the case for a bet and tell clear stories.",
        focusCategories: ["strategy", "behavioral"],
        length: "standard",
      },
      fullLoop("LinkedIn"),
    ],
  },
  {
    id: "atlassian-apm",
    name: "Associate Product Manager (APM)",
    company: "Atlassian",
    description:
      "An early-career PM program building collaboration tools for teams, with an emphasis on customer understanding.",
    focusAreas: ["Customer empathy", "Product design", "Prioritisation", "Teamwork"],
    careersUrl: "https://www.atlassian.com/company/careers", // TODO: verify
    mocks: [
      {
        id: "customer-understanding",
        title: "Customer understanding warm-up",
        description: "Design for teams and the tools they use together.",
        focusCategories: ["product-design", "behavioral"],
        length: "quick",
      },
      {
        id: "prioritisation",
        title: "Prioritisation & execution",
        description: "Choose what to build next and prove it worked.",
        focusCategories: ["strategy", "metrics"],
        length: "standard",
      },
      {
        id: "teamwork",
        title: "Teamwork & values",
        description: "Stories about collaboration, feedback and helping teams succeed.",
        focusCategories: ["behavioral"],
        length: "standard",
      },
      fullLoop("Atlassian"),
    ],
  },
] as const satisfies readonly PmProgram[]

/** Track for programs the user typed in themselves. */
export const GENERIC_PROGRAM_MOCKS: readonly ProgramMock[] = [
  {
    id: "product-sense",
    title: "Product sense warm-up",
    description: "Design and improve a product, with a clear success metric.",
    focusCategories: ["product-design", "metrics"],
    length: "quick",
  },
  {
    id: "analytical",
    title: "Analytical thinking",
    description: "Metrics, estimation and diagnosing what changed.",
    focusCategories: ["metrics", "guesstimate", "rca"],
    length: "standard",
  },
  {
    id: "strategy-leadership",
    title: "Strategy & leadership",
    description: "Make a reasoned product bet and lead without authority.",
    focusCategories: ["strategy", "behavioral"],
    length: "standard",
  },
  {
    id: "full-loop",
    title: "Full practice loop",
    description: "A longer, mixed interview that brings everything together.",
    focusCategories: ALL_ROUND,
    length: "full",
  },
]

export function getProgram(id: string): PmProgram | undefined {
  return PM_PROGRAMS.find((program) => program.id === id)
}

export function formatProgramName(program: Pick<PmProgram, "company" | "name">): string {
  return `${program.company} ${program.name}`
}
