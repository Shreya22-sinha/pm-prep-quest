# PM Prep Quest

A friendly, gamified web app that takes aspiring Product Managers from "curious about PM" to "interview-ready": an inspiring intro, a game-style learning roadmap, and AI-powered mock interviews with detailed feedback.

The full product specification is in [PROJECT_SPEC.md](PROJECT_SPEC.md). Read it before making changes.

> **Status:** Phase 7 (program track) complete. Phase 8 (polish: accessibility, responsiveness, performance, tests) is next.

## Getting started

You need [Node.js](https://nodejs.org) 22 or newer (developed on Node 24).

```bash
# 1. Install the project's libraries (creates node_modules/)
npm install

# 2. Download the browser Playwright uses for end-to-end tests (one time)
npx playwright install chromium

# 3. Create your local environment file
cp .env.example .env.local      # on Windows PowerShell: Copy-Item .env.example .env.local

# 4. Start the app, then open http://localhost:3000
npm run dev
```

## Environment variables

Set these in `.env.local` (never commit it), then restart `npm run dev`. The Interview Arena needs a key; everything else works without one.

| Variable       | What it is                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `GROQ_API_KEY` | Your key from [console.groq.com/keys](https://console.groq.com/keys). Only ever read on the server.                    |
| `GROQ_MODEL`   | Optional. Defaults to `openai/gpt-oss-120b`. See [console.groq.com/docs/models](https://console.groq.com/docs/models). |

## AI architecture

- All AI calls go through `generateJson()` in `lib/ai/client.ts`, which is server-only. It requests strict JSON-schema output (or JSON mode for models without it), validates with Zod, and retries once.
- Prompts live in `lib/ai/prompts/` and AI response schemas in `lib/ai/schemas.ts`.
- API routes: `POST /api/resume/parse` (PDF → text), `POST /api/interview/start` (setup → question plan), `POST /api/interview/answer` (answer → optional follow-up + encouragement), `POST /api/interview/evaluate` (transcript → scores, praise, reviews, model answers, practice questions), `POST /api/practice/evaluate` (one practice answer → feedback) and `POST /api/resume/feedback` (resume → makeover). Each has per-IP rate limiting and friendly error codes (`lib/api/errors.ts`).
- Scoring: the rubric in `config/rubric.ts` is sent to the evaluator; the AI scores each question, and overall/category scores, verdicts and weak areas are computed in code (`lib/interview/scoring.ts`) so they're always consistent.
- If the AI returns something invalid, the server log names the failing field and issue type (never the content), e.g. `invalid_response (... modelAnswer.framework: too_big)`.
- Interviews are saved in the browser (`store/interview-store.ts`), so a reload never loses progress. Resume text is never logged.
- Tests never call Groq: unit tests mock `lib/ai/client`, and e2e tests intercept the API routes.

## Voice mode

- Uses the browser's built-in Web Speech API: `hooks/use-speech-synthesis.ts` (the interviewer reads questions aloud) and `hooks/use-speech-recognition.ts` (spoken answers, with live interim text). No extra keys.
- Works where `SpeechRecognition` exists: Chrome, Edge and Safari. Elsewhere (e.g. Firefox) the wizard disables Voice with an explanation, and a voice interview opened there falls back to typing with a "Switch to written mode" option.
- The microphone needs `localhost` or HTTPS, and the browser will ask for permission the first time.
- Tests use scripted fakes of the speech APIs (`tests/unit/voice/fake-speech.ts`, and an init script in `tests/e2e/voice.spec.ts`), because test browsers have no microphone.

## Scripts

| Command                | What it does                                                                |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run dev`          | Start the development server at http://localhost:3000                       |
| `npm run build`        | Create a production build                                                   |
| `npm run start`        | Run the production build                                                    |
| `npm run typecheck`    | Check TypeScript types                                                      |
| `npm run lint`         | Check code for common mistakes (ESLint)                                     |
| `npm run format`       | Auto-format all files (Prettier)                                            |
| `npm run format:check` | Check formatting without changing files                                     |
| `npm run test`         | Run unit tests once (Vitest)                                                |
| `npm run test:watch`   | Run unit tests and re-run on every save                                     |
| `npm run test:e2e`     | Run browser tests (Playwright; starts the dev server for you)               |
| `npm run check`        | Typecheck + lint + format check + unit tests — run before a phase is "done" |

## Tech stack

Next.js 16 (App Router, Cache Components) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Radix) · lucide-react · Motion · Zustand · Zod · canvas-confetti · Vitest + React Testing Library · Playwright. Later phases add the Groq SDK. See section 2 of the spec.

## Architecture overview

```
app/                 Routes. (marketing)/page.tsx is the home page "/".
  layout.tsx         Shared shell: fonts, theme script, navbar, toasts, celebrations
components/
  ui/                shadcn components (generated; edit freely)
  layout/            Navbar, theme toggle, motion helpers, placeholders
  home/              Home page sections
  gamification/      XP pill, XP/badge toasts, level-up dialog, progress hydrator
  progress/          My Progress page sections
  roadmap/           Roadmap map, topic page parts, resource cards
config/              Site, gamification (XP, levels, badges), interview options
content/             Page copy, roadmap topics + lessons, curated resources
hooks/               useTheme, useProgressHydrated (later speech hooks)
lib/
  theme.ts           Light/dark/system theme logic
  gamification/      Pure level, streak, badge and XP logic + saved-data schema
  storage/           Storage interface over localStorage
  ai/                Groq client, prompts, Zod schemas (Phase 4)
store/               Zustand stores (progress-store.ts)
tests/unit/          Vitest tests
tests/e2e/           Playwright tests
```

### How progress works

Every XP change goes through `applyProgress` in `lib/gamification/engine.ts`. It adds the XP, extends the streak, and works out level-ups and new badges. The store (`store/progress-store.ts`) saves the result in the browser under `pmq-progress` and validates it with Zod on load, so a corrupted save starts fresh instead of crashing. To tune XP, levels or badges, edit `config/gamification.ts`.

In development, `/progress` shows a **Developer tools** panel for earning test XP and previewing celebrations. It is not included in production builds.

Key rules: AI calls happen only in server route handlers (`app/api/*`), every AI response is validated with Zod, and page copy lives in `content/`, not in components.

## Notes for contributors

- This Next.js version differs from older tutorials. Its docs ship inside `node_modules/next/dist/docs/`; check them before using an API.
- Theme switching uses a tiny inline script (no library) to avoid a flash of the wrong theme. See `lib/theme.ts`.
- With Cache Components, Next.js keeps up to 3 recently visited pages in the document, hidden. So the same element `id` can exist twice: use `useId()` (or a page-specific prefix) for `aria-labelledby` targets, and `lib/scroll.ts` for in-page `#section` links. In Playwright, prefer role queries or `.filter({ visible: true })`.
- Edit files with UTF-8-aware tools. A unit test (`tests/unit/source-encoding.test.ts`) fails if mis-encoded characters such as `â€¦` appear in source.

## Program tracks

Choosing a PM program (path B) adds a prep plan to the results page: what the program typically emphasises, recommended roadmap levels and resources, and 4 themed mock interviews that unlock one at a time (`content/programs.ts`). Each completed mock earns bonus XP; finishing a track unlocks its badge. Typed-in programs get a general track. Progress is saved under `programTracks` in the progress store and shown on My Progress.
