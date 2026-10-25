import type { InterviewEvaluationAi } from "@/lib/ai/schemas"
import type { EvaluateRequest, ResumeFeedback } from "@/lib/interview/feedback-schema"

export const evaluateRequest: EvaluateRequest = {
  level: "fresher",
  path: "program",
  targetLabel: "Google APM",
  context: "Google Associate Product Manager (APM).",
  turns: [
    {
      category: "product-design",
      question: "How would you improve Google Maps for tourists?",
      answer: "I'd focus on first-time visitors and help them plan a day.",
      followUp: { question: "Which tourists first?", answer: "Short-trip visitors." },
    },
    {
      category: "metrics",
      question: "How would you measure the success of Google Photos?",
      answer: null,
      followUp: null,
    },
    {
      category: "behavioral",
      question: "Tell me about a time you influenced without authority.",
      answer: "I used data to align my team on a new onboarding flow.",
      followUp: null,
    },
  ],
}

const modelAnswer = {
  framework: "CIRCLES",
  answer:
    "Clarify the goal, choose a segment, list their needs, prioritise one, brainstorm solutions and pick one with clear success metrics.",
}

export const evaluationAi: InterviewEvaluationAi = {
  summary: "You brought real user empathy and a clear story. Great foundation!",
  strengths: [
    { questionNumber: 1, quote: "focus on first-time visitors", why: "You picked a segment." },
    { questionNumber: 2, quote: "invented", why: "Should be dropped: question was skipped." },
  ],
  focusAreas: ["Add a success metric to every product answer."],
  reviews: [
    {
      questionNumber: 1,
      score: 82,
      whatWasGood: ["Clear segment"],
      whatWasMissing: ["Success metric"],
      modelAnswer,
    },
    {
      questionNumber: 2,
      score: 40,
      whatWasGood: ["Should be dropped"],
      whatWasMissing: ["Define the goal first"],
      modelAnswer: { ...modelAnswer, framework: "Goal → Signals → Metrics" },
    },
    {
      questionNumber: 3,
      score: 64,
      whatWasGood: ["Used data"],
      whatWasMissing: ["Quantify the result"],
      modelAnswer: { ...modelAnswer, framework: "STAR" },
    },
  ],
  practiceQuestions: [
    { category: "metrics", question: "How would you measure success for Google Docs comments?" },
    { category: "metrics", question: "What is the North Star metric for YouTube Shorts?" },
    { category: "metrics", question: "How would you measure the health of Google Keep?" },
    { category: "behavioral", question: "Tell me about a time you changed someone's mind." },
    { category: "behavioral", question: "Describe a project that failed and what you learned." },
    { category: "behavioral", question: "Tell me about a time you resolved a conflict." },
    { category: "product-design", question: "Design a feature for planning a road trip." },
  ],
}

export const resumeFeedback: ResumeFeedback = {
  strengths: ["Clear ownership of a checkout redesign."],
  gaps: [{ area: "impact", detail: "Few bullets show measurable outcomes." }],
  rewrites: [
    {
      before: "Worked on checkout redesign.",
      after: "Led a checkout redesign that lifted conversion by [X%].",
      why: "Shows ownership and outcome.",
    },
    {
      before: "Did user interviews.",
      after: "Ran [N] user interviews that shaped the onboarding roadmap.",
      why: "Quantifies research impact.",
    },
  ],
  skillsToAdd: [{ skill: "SQL", why: "Answer your own data questions.", tag: "analytics" }],
  projectIdeas: [
    {
      title: "Teardown blog",
      description: "Write product teardowns.",
      demonstrates: "Product sense",
      howToStart: "Pick an app you love.",
    },
    {
      title: "Metrics dashboard",
      description: "Build a dashboard for a side project.",
      demonstrates: "Metrics thinking",
      howToStart: "Choose one public dataset.",
    },
    {
      title: "Mini launch",
      description: "Launch a tiny tool.",
      demonstrates: "Execution",
      howToStart: "Find one painful task.",
    },
  ],
}
