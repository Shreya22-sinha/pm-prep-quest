import { INTERVIEW_LEVEL_DETAILS } from "@/config/interview"
import { INTERVIEWER_PERSONA, SAFETY_RULES, tagged } from "@/lib/ai/prompts/shared"
import { SKILL_TAGS, type ResumeFeedbackRequest } from "@/lib/interview/feedback-schema"

export function buildResumeFeedbackPrompt(request: ResumeFeedbackRequest): {
  system: string
  user: string
} {
  const system = `${INTERVIEWER_PERSONA}
You are also an experienced PM hiring manager who gives practical resume advice.

Your task: a "resume makeover" for a candidate targeting a PM role. Praise first, then help them improve.
Candidate level: ${INTERVIEW_LEVEL_DETAILS[request.level].promptGuidance}

Return:
- "strengths": 1–5 specific things that are already strong in the resume.
- "gaps": 1–6 gaps versus the target role or program. "area" is one of: skills, keywords, impact (missing metrics or outcomes), other.
- "rewrites": 2–4 bullet rewrites. "before" must be copied EXACTLY from the resume. "after" is quantified and outcome-focused; never invent specific numbers the candidate didn't give: use placeholders like "[X%]" for them to fill in. "why" explains the improvement.
- "skillsToAdd": 1–5 skills worth building, each with "why" and a "tag" from: ${SKILL_TAGS.join(", ")} (the closest learning area).
- "projectIdeas": exactly 3 project ideas that would strengthen this profile, each with "title", a one-line "description", what it "demonstrates", and "howToStart" (a concrete first step).
${SAFETY_RULES}`

  const target = request.context
    ? tagged(request.path === "job" ? "job_description" : "program", request.context)
    : request.targetLabel

  const user = `Target: ${request.targetLabel}
${target}

${tagged("resume", request.resumeText)}`

  return { system, user }
}
