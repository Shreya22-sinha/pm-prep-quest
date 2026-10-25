import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_LENGTH_DETAILS,
  INTERVIEW_LEVEL_DETAILS,
} from "@/config/interview"
import { getProgram } from "@/content/programs"
import { INTERVIEWER_PERSONA, SAFETY_RULES, tagged } from "@/lib/ai/prompts/shared"
import type { InterviewSetup } from "@/lib/interview/schema"
import { getMock, getProgramTrack } from "@/lib/programs/track"

export function buildInterviewStartPrompt(setup: InterviewSetup): { system: string; user: string } {
  const questionCount = INTERVIEW_LENGTH_DETAILS[setup.length].questionCount

  const system = `${INTERVIEWER_PERSONA}

Your task: plan a mock interview of exactly ${questionCount} questions tailored to the candidate.

Guidelines:
- Candidate level: ${INTERVIEW_LEVEL_DETAILS[setup.level].promptGuidance}
- Use a balanced mix of categories from: ${INTERVIEW_CATEGORIES.join(", ")}. Avoid repeating a category unless there are more questions than sensible categories.
- Include at least one "behavioral" question when there are 3 or more questions.
- Tailor questions to the target role or program and, when provided, the candidate's resume (e.g. ask about a project they list).
- Each question should be answerable in about 5 minutes, clearly worded, and realistic for a real PM interview.
- Every question must stand on its own: never refer to another question or an earlier answer, because the candidate may skip questions.
- For each question, write a "hint": a gentle nudge towards a useful framework or angle, without giving the answer away.
- "greeting": 1–2 warm sentences welcoming the candidate and setting a relaxed tone.
- "targetLabel": a short label (max 60 characters) for the role or program, e.g. "Senior PM at Acme" or "Google APM".

${SAFETY_RULES}

JSON structure: {"targetLabel": string, "greeting": string, "questions": [{"category": one of the categories above, "question": string, "hint": string}]}`

  const program = setup.program?.id ? getProgram(setup.program.id) : undefined
  const target =
    setup.path === "job"
      ? tagged("job_description", setup.jobDescription ?? "")
      : tagged(
          "program",
          program
            ? `${program.company} ${program.name}. Typical focus areas: ${program.focusAreas.join(", ")}.`
            : (setup.program?.name ?? "")
        )

  const mock =
    setup.program && setup.programMockId
      ? getMock(getProgramTrack(setup.program), setup.programMockId)
      : undefined
  const theme = mock
    ? `\nThis is a themed practice round: "${mock.title}": ${mock.description}
Draw most questions from these categories: ${mock.focusCategories.join(", ")}. Where it fits, set questions in the context of the program's company and products.\n`
    : ""

  const user = `Plan the interview.

Target ${setup.path === "job" ? "job" : "PM program"}:
${target}
${theme}

Candidate resume:
${setup.resumeText ? tagged("resume", setup.resumeText) : "Not provided."}

Number of questions: ${questionCount}`

  return { system, user }
}
