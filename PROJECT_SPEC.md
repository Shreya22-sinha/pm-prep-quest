# PM Prep Quest — Product Specification

> This file is the single source of truth for the project. AI coding agents and humans working on this repo must read it before making changes and keep it updated when decisions change.

---

## 1. Product overview

**PM Prep Quest** is a web app that helps aspiring Product Managers prepare for PM interviews. It takes a user from "I'm curious about PM" to "I'm interview-ready" through three stages:

1. **Inspire** — make the user excited about the PM role and confident it is achievable.
2. **Roadmap** — a friendly, gamified learning path covering every PM interview topic, with curated resources.
3. **Interview Arena** — AI-powered mock interviews (text or voice), personalised to a job description or a specific PM program, followed by detailed feedback, practice questions and resume improvement suggestions.

**Tone everywhere:** warm, encouraging, never intimidating. Celebrate progress. Wrong answers are framed as "learning moments", never failures.

**Target users:** students, freshers, career switchers and working professionals preparing for PM / APM / RPM roles.

---

## 2. Tech stack (do not change without updating this file)

| Layer          | Choice                                                                                                                                          | Why                                                                                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | **Next.js 16 (App Router)**, `cacheComponents` enabled                                                                                          | Full-stack, easy to deploy later (Vercel). Bundled docs live in `node_modules/next/dist/docs/` — read them before using an API, this version differs from older tutorials  |
| Language       | **TypeScript (strict mode)**                                                                                                                    | Fewer bugs, better AI-assisted coding                                                                                                                                      |
| Styling        | **Tailwind CSS v4** + **shadcn/ui** (Radix base, "nova" preset)                                                                                 | Professional, consistent, accessible components                                                                                                                            |
| Theme          | Own small theme system (`lib/theme.ts`, `hooks/use-theme.ts`) using an inline script, per the Next.js "preventing flash before hydration" guide | No flash, no extra dependency                                                                                                                                              |
| Animation      | **Motion** (`motion` package — the renamed Framer Motion)                                                                                       | Celebrations, level-ups, smooth transitions                                                                                                                                |
| Icons          | **lucide-react**                                                                                                                                |                                                                                                                                                                            |
| State          | **Zustand** with `persist` middleware (localStorage)                                                                                            | Progress, XP, interview history — no login needed for v1                                                                                                                   |
| Validation     | **Zod**                                                                                                                                         | Validate all API inputs and AI JSON outputs                                                                                                                                |
| AI             | **Groq API** via official `groq-sdk`, called **only from server-side route handlers**, wrapped behind `lib/ai/client.ts`                        | API key never reaches the browser; provider can be swapped by changing one file                                                                                            |
| Resume parsing | Server-side PDF text extraction (e.g. `unpdf` or `pdf-parse`); also allow pasting plain text                                                    |                                                                                                                                                                            |
| Voice          | Browser **Web Speech API** — `SpeechSynthesis` (AI speaks) + `SpeechRecognition` (user speaks)                                                  | Free, no extra keys. Must feature-detect and gracefully fall back to text mode in unsupported browsers. (Optional later: Groq-hosted Whisper as a speech-to-text fallback) |
| Confetti       | `canvas-confetti`                                                                                                                               | Achievement moments                                                                                                                                                        |
| Testing        | **Vitest** + React Testing Library (unit), **Playwright** (Chromium; one happy-path e2e per page)                                               |                                                                                                                                                                            |
| Quality        | ESLint + Prettier, `npm run typecheck`, `npm run lint`, `npm run test` all pass before a phase is "done"                                        |                                                                                                                                                                            |

Libraries are installed in the phase that first needs them.

**Environment variables** (in `.env.local`, never committed; provide `.env.example`):

```
GROQ_API_KEY=
GROQ_MODEL=        # keep model name configurable; check console.groq.com/docs/models for current model names
```

**No database and no authentication in v1.** Design the data layer behind a small interface (e.g. `lib/storage`) so a database + auth can be added later without rewriting pages.

---

## 3. Design system

- **Feel:** modern, bright, optimistic — like a premium learning app (think Duolingo energy meets Linear polish). Not a corporate dashboard.
- Light + dark mode (plus "system").
- One primary brand colour (energetic indigo/violet), one success colour (green), one celebration accent (amber/gold). Tokens: `primary`, `success`, `celebrate` in `app/globals.css`.
- Font: Plus Jakarta Sans.
- Generous whitespace, rounded cards, large readable type, subtle motion.
- Fully responsive (mobile first, 360px and up).
- Accessible: WCAG AA contrast, keyboard navigable, visible focus states, `aria-live` for interview questions, `prefers-reduced-motion` respected (disable confetti/large animations).
- Shared layout: top navbar (logo, Home, Roadmap, Interview Arena, My Progress, theme toggle) and an XP/level pill always visible.

---

## 4. Gamification system (used across the app)

- **XP**: earned for completing roadmap topics, finishing interviews, scoring well, practising follow-up questions.
- **Levels**: e.g. _Curious Explorer → Aspiring PM → Product Thinker → Strategy Builder → Interview Ready → Offer Hunter_. Level thresholds in a config file.
- **Badges**: e.g. "First Interview", "Metrics Master", "RCA Detective", "Guesstimate Guru", "Voice Warrior" (first voice interview), "7-Day Streak".
- **Streaks**: consecutive days (user's local calendar day) with any activity.
- **Celebrations**: level-up modal with confetti; toast for XP gains.
- **My Progress page** (`/progress`): level, XP bar, badges grid (locked/unlocked), streak, topic completion, interview history with scores.

All XP values, levels and badges live in `config/gamification.ts` so they are easy to tune.

---

## 5. Pages and features

### 5.1 Page 1 — Home / Inspire (`/`)

Goal: the user should feel inspired, understand why PM matters, and believe it is achievable.

Sections:

1. **Hero** — bold headline (e.g. "Build products millions use. Start your PM journey today."), short subtext, primary CTA "Start my journey" → `/roadmap`.
2. **What a PM actually does** — 3–4 friendly cards (Understands users, Sets direction, Works with engineers & designers, Measures impact).
3. **Why this role matters** — impact on products and people; PM as the "CEO of the product" framing (with a light note that it's influence, not authority).
4. **Benefits of the role** — career growth, cross-functional learning, high impact, strong compensation, path to leadership/founding. Keep claims general; no invented statistics.
5. **"You can do this"** — how people from many backgrounds (engineering, design, consulting, sales, freshers) become PMs; a simple 4-step visual: _Learn → Practice → Mock interview → Land the role_.
6. **Myth-busters** — e.g. "You need an MBA" / "You must know how to code" — gently debunked.
7. **Final CTA** — "See your roadmap".

Content lives in `content/home.ts`, not hard-coded in JSX.

### 5.2 Page 2 — Roadmap (`/roadmap`)

Goal: friendly, non-intimidating learning path that makes users excited to learn.

- Visual as a **game map / path of levels** (vertical winding path on mobile, can be horizontal/zig-zag on desktop). Each node = one topic.
- Suggested order (configurable):
  1. PM Fundamentals (what PMs do, product lifecycle)
  2. Product Design / Product Sense
  3. Product Metrics & Success Metrics
  4. Root Cause Analysis (RCA)
  5. Guesstimates / Market Sizing
  6. Product Strategy
  7. Product Growth
  8. Go-To-Market (GTM)
  9. Analytics / Data Interpretation questions
  10. Technical basics for PMs
  11. Behavioral & Leadership questions
  12. Mock Interviews → links to Interview Arena
- Clicking a node opens a **topic detail panel/page** (`/roadmap/[topic]`) with:
  - What it is (2–3 sentences, plain English)
  - Why interviewers ask it
  - A framework to learn (e.g. CIRCLES for product design, AARRR for growth, a structured RCA approach)
  - One sample question with a short model approach
  - Curated resources (see 5.2.1)
  - Estimated time and a "Mark as complete" button (+XP, unlocks next node visually; all nodes stay accessible — locking is cosmetic, never blocks the user)
- Topic list and order live in `content/topics.ts`; lesson content in `content/topic-lessons.ts`.
- Level 12 (Mock Interviews) has no lesson page: its node links to `/interview`, and it is marked complete automatically when the user finishes their first mock interview.
- Header shows overall progress ("3 of 12 levels complete — great pace!").
- Bottom CTA: "Ready to test yourself? Enter the Interview Arena" → `/interview`.

#### 5.2.1 Resources (store in `content/resources.ts`, each with title, type, url, tags, free/paid)

Books:

- _Cracking the PM Interview_ — Gayle Laakmann McDowell & Jackie Bavaro
- _Decode and Conquer_ — Lewis C. Lin
- _Inspired_ — Marty Cagan
- _The Lean Product Playbook_ — Dan Olsen
- _Hooked_ — Nir Eyal (growth/engagement)
- _Lean Analytics_ — Alistair Croll & Benjamin Yoskovitz (metrics)

Websites / platforms:

- Exponent (tryexponent.com) — PM questions, mock interviews
- Lenny's Newsletter / Lenny's Podcast
- IGotAnOffer (PM interview guides)
- Product Alliance
- Reforge (growth, strategy)
- Product School resources/blog

Only include resources that are real. Use official homepage URLs. Do not invent URLs for specific articles. Mark items whose details should be verified with a `// TODO: verify` comment.

### 5.3 Page 3 — Interview Arena (`/interview`)

A multi-step wizard with a progress indicator.

#### Step 1 — Choose your path

Two cards:

- **A. Target a specific job** — paste the Job Description (textarea) + upload resume (PDF) or paste resume text.
- **B. Target a PM program** — choose from a list of programs (e.g. Google APM, Microsoft PM, Meta RPM, Uber APM, and others) or type a custom program name, + upload/paste resume.
  - Programs live in `content/programs.ts` with: name, company, short description, typical focus areas, and official careers URL. **Do not invent dates, deadlines, eligibility rules or interview rounds** — use general, clearly hedged descriptions and a "Check the official page for current details" link. Make this list easy to edit.

Resume is required for the resume-feedback output; if missing, skip that section gracefully.

#### Step 2 — Choose your level

- **Fresher** (0–1 yrs / APM-style), **Intermediate** (2–5 yrs), **Experienced** (5+ yrs / Senior PM).
- Short description of what each level's interview will feel like.

#### Step 3 — Choose interview mode

- **Written** — questions appear as text, user types answers.
- **Voice** — question is spoken aloud (SpeechSynthesis) and shown as text; user answers by speaking (SpeechRecognition) with a live transcript they can edit before submitting. Big mic button with clear states (idle / listening / processing). If the browser doesn't support speech recognition, show a friendly message and offer written mode.
  - Implemented (Phase 6): the interviewer reads the greeting, each question and follow-ups, with Replay and Mute controls; recording stops the interviewer's voice; the transcript is read-only while listening and editable afterwards; multiple recordings append. Settings and the privacy note live in `config/voice.ts`.
- Also choose interview length: Quick (3 questions), Standard (5), Full (8).

#### Step 4 — The interview

- AI interviewer generates questions tailored to: JD or program, level, resume, and a balanced mix of categories (product design, metrics, RCA, guesstimate, strategy, behavioral, etc.).
- One question at a time, with category tag, progress ("Question 2 of 5"), optional timer (soft, not stressful), and a "Give me a hint" button (free — no XP cost).
- The AI may ask **one short follow-up** per question when the answer is thin (configurable), like a real interviewer.
- User can skip a question.
- Encouraging micro-copy between questions.

#### Step 5 — Results & feedback (`/interview/results/[id]`)

Delivered as a celebratory, level-completion-style screen, then detailed sections:

1. **Score summary** — overall score, per-category scores (radar or bar chart), XP earned, any badges unlocked, confetti.
2. **What you did great** — specific praise quoting the user's strong points per question. Lead with this.
3. **Question-by-question review** — for each question: user's answer, verdict (Strong / Partially correct / Needs work), what was good, what was missing, and a **model answer** with the framework used.
4. **Practice more** — 3–5 similar questions per weak category, each practisable in-app (opens a single-question practice mode with AI feedback).
5. **Where to practise online** — relevant resources from `content/resources.ts` filtered by weak categories.
6. **Program-specific guidance (path B only)** — a level-by-level prep plan for that program: what it typically emphasises, recommended topics, resources, and a set of **program-themed mock interviews** the user can unlock and complete one by one (each completion = XP + progress on a program track with its own progress bar and badge).
   - Implemented (Phase 7): each listed program has 4 mocks (warm-up, two focused rounds, full loop) defined in `content/programs.ts`; typed-in programs use a general track. Mocks unlock in order; completing one awards `programMockCompleted` XP once on top of interview XP; finishing a track unlocks a per-program "Track Champion" badge (or "Program Track Champion" for typed-in programs). Tracks appear on My Progress with a "Continue track" link.
7. **Resume makeover** (if resume provided):
   - What's strong in your resume (praise first)
   - Gaps vs the JD/program (skills, keywords, impact metrics)
   - Suggested rewrites for 2–4 bullet points (before → after, quantified, outcome-focused)
   - Skills to add + where to learn each (resources)
   - Project ideas to strengthen the profile (3 ideas with a one-line description, what it demonstrates, and how to start)
8. Actions: "Retry interview", "Practise weak areas", "Back to roadmap", "Download feedback as PDF" (browser print stylesheet).

Interview sessions and results are saved to the persisted store and shown in `/progress`.

---

## 6. AI architecture

- All Groq calls happen in **Next.js route handlers** under `app/api/*`. Never expose the key client-side.
- A single `lib/ai/client.ts` creates the Groq client and exposes a provider-agnostic helper (e.g. `generateJson(prompt, schema)`); model name comes from `GROQ_MODEL`. Pages and route handlers never call the SDK directly.
- **Prompts live in `lib/ai/prompts/*.ts`** as typed functions (one per task), never inline in route handlers.
- **Structured outputs:** every AI response the UI depends on must be JSON (use Groq JSON mode) validated with Zod schemas in `lib/ai/schemas.ts`. On validation failure, retry once, then return a friendly error.
- Endpoints (suggested):
  - `POST /api/resume/parse` — PDF → plain text
  - `POST /api/interview/start` — context (JD/program, level, resume, mode, length) → interview plan + first question
  - `POST /api/interview/answer` — answer → optional follow-up or next question
  - `POST /api/interview/evaluate` — full transcript → results JSON (scores, praise, per-question review, model answers, practice questions, resource tags, program plan)
  - `POST /api/resume/feedback` — resume + JD/program → resume makeover JSON
  - `POST /api/practice/evaluate` — single practice question feedback
- Implementation notes (Phase 4): `/api/interview/start` returns the full question plan (with a hint per question) up front; `/api/interview/answer` returns an optional follow-up plus one encouraging sentence, and never asks a second follow-up. Default model `openai/gpt-oss-120b` with strict JSON-schema output; other models fall back to JSON mode. Programs for path B live in `content/programs.ts` (added in Phase 4, enriched in Phase 7).
- Implementation notes (Phase 5): the AI scores each answered question 0–100 against the rubric; overall and category scores, verdicts (Strong ≥ 80, Partially correct ≥ 50, else Needs work) and weak categories (< 70) are computed in code. Skipped questions are never scored. XP is awarded once, when the evaluation is first saved; an interview with every question skipped earns none. Practice questions earn XP on the first attempt only. Results are saved with the session in the browser. "Download as PDF" uses the print stylesheet (always light theme, model answers expanded). Feedback is returned whole rather than streamed, because every response is validated as a single JSON object.
- Stream text where it improves UX (e.g. feedback), but final structured data must be validated.
- **Safety & cost:** input length limits (JD and resume capped, e.g. ~15k chars), basic in-memory per-IP rate limiting on API routes, friendly handling of Groq rate-limit (429) responses, clear error states for missing API key, timeouts, and no logging of resume contents.
- Interviewer persona: friendly senior PM interviewer, adapts difficulty to level, never harsh, always constructive.
- Evaluation rubric per category (structure, user focus, creativity, metrics, prioritisation, communication) defined in a config file and passed to the evaluator prompt so scoring is consistent.

---

## 7. Folder structure

```
app/
  (marketing)/page.tsx          # Home / Inspire (there is no app/page.tsx)
  roadmap/page.tsx
  roadmap/[topic]/page.tsx
  interview/page.tsx            # wizard
  interview/session/[id]/page.tsx
  interview/results/[id]/page.tsx
  progress/page.tsx
  api/...                       # route handlers
components/
  ui/                           # shadcn components
  home/ roadmap/ interview/ progress/ gamification/ layout/
config/                         # site, gamification, rubric, interview settings
content/                        # home copy, topics, resources, programs
hooks/                          # useTheme, useSpeechSynthesis, useSpeechRecognition, etc.
lib/
  ai/ (client, prompts, schemas)
  gamification/                 # pure XP/level/streak/badge logic + Zod schema of saved progress
  storage/                      # KeyValueStorage interface (localStorage in v1)
  theme.ts
store/                          # zustand stores
tests/
  unit/                         # Vitest
  e2e/                          # Playwright
```

---

## 8. Non-functional requirements

- Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on Home and Roadmap.
- No `any` types without a justified comment.
- Every page has loading, empty and error states.
- SEO basics: metadata per page, Open Graph image placeholder.
- README with setup steps, scripts, env vars and architecture overview.
- Deployment-ready structure (Vercel-friendly), but **deployment is out of scope for now**.

---

## 9. Build phases

Work strictly phase by phase. At the end of each phase: run typecheck, lint and tests, fix all errors, summarise what was built, list anything not done, and wait for approval.

1. **Phase 0 — Setup:** scaffold Next.js + TS + Tailwind + shadcn/ui + ESLint/Prettier + Vitest + Playwright, folder structure, `.env.example`, README skeleton, layout with navbar and theme toggle.
2. **Phase 1 — Home / Inspire page** with all sections and animations.
3. **Phase 2 — Gamification core:** store, XP, levels, badges, streaks, celebration components, `/progress` page.
4. **Phase 3 — Roadmap** map + topic pages + resources + completion flow.
5. **Phase 4 — Interview Arena (written mode):** wizard, resume parsing, AI interview loop, API routes, schemas.
6. **Phase 5 — Results & feedback:** scores, praise, model answers, practice mode, resources, resume makeover.
7. **Phase 6 — Voice mode** with feature detection and fallback.
8. **Phase 7 — Program track (path B):** program content, program-specific plan, unlockable program mocks.
9. **Phase 8 — Polish:** accessibility pass, responsive pass, performance, error states, tests, README.

---

## 10. Out of scope (for now)

- User accounts / login, database, payments
- Deployment and CI/CD
- Real human mock interviews
