import "server-only"

import Groq, {
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  RateLimitError,
} from "groq-sdk"
import type { z } from "zod"

import { AiError } from "@/lib/ai/errors"
import { toProviderJsonSchema } from "@/lib/ai/json-schema"

// The only module that talks to the AI provider (spec section 6). Swapping
// providers means changing this file; callers only use generateJson().

const DEFAULT_MODEL = "openai/gpt-oss-120b"
const REQUEST_TIMEOUT_MS = 45_000

/** Models that support strict JSON-schema outputs on Groq (see console.groq.com/docs/structured-outputs). */
const STRICT_SCHEMA_MODELS = new Set([
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "meta-models/muse-spark-open",
])

let cachedClient: { apiKey: string; client: Groq } | null = null

function getClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new AiError("not_configured", "GROQ_API_KEY is not set")
  }
  if (cachedClient?.apiKey !== apiKey) {
    cachedClient = {
      apiKey,
      client: new Groq({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 }),
    }
  }
  return cachedClient.client
}

export function getModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL
}

type GenerateJsonOptions<T> = {
  /** Short identifier for the response schema, e.g. "interview_plan". */
  name: string
  system: string
  user: string
  schema: z.ZodType<T>
  /** Extra checks the schema can't express; return false to retry. */
  isAcceptable?: (data: T) => boolean
  temperature?: number
  maxTokens?: number
}

function toAiError(error: unknown): AiError | null {
  if (error instanceof AiError) return error
  if (error instanceof RateLimitError) return new AiError("rate_limited", "AI rate limit reached")
  if (error instanceof AuthenticationError) {
    return new AiError("not_configured", "The AI provider rejected the API key")
  }
  if (error instanceof APIConnectionTimeoutError)
    return new AiError("timeout", "AI request timed out")
  // A 400 usually means the model's JSON didn't match the schema: worth one retry.
  if (error instanceof APIError && error.status === 400) return null
  if (error instanceof APIError)
    return new AiError("unavailable", `AI provider error ${error.status}`)
  // Only the error's type goes in the message: never prompt or user content.
  return new AiError(
    "unavailable",
    `Unexpected AI error (${error instanceof Error ? error.name : typeof error})`
  )
}

/**
 * Asks the model for JSON matching `schema`, validates it with Zod, and retries
 * once on invalid output (spec section 6). Never logs prompt contents.
 */
export async function generateJson<T>({
  name,
  system,
  user,
  schema,
  isAcceptable,
  temperature = 0.7,
  maxTokens = 4_000,
}: GenerateJsonOptions<T>): Promise<T> {
  const client = getClient()
  const model = getModel()
  const strict = STRICT_SCHEMA_MODELS.has(model)
  const isReasoningModel = model.startsWith("openai/gpt-oss")

  // Why the last attempt was rejected: field paths and issue codes only, never content.
  let lastProblem = "no content"

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature,
        max_completion_tokens: maxTokens,
        response_format: strict
          ? {
              type: "json_schema",
              json_schema: { name, strict: true, schema: toProviderJsonSchema(schema) },
            }
          : { type: "json_object" },
        ...(isReasoningModel ? { reasoning_effort: "low" as const, include_reasoning: false } : {}),
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        lastProblem = `empty content (finish reason: ${completion.choices[0]?.finish_reason ?? "unknown"})`
        continue
      }

      const parsed = schema.safeParse(JSON.parse(content))
      if (!parsed.success) {
        lastProblem = parsed.error.issues
          .slice(0, 3)
          .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.code}`)
          .join("; ")
        continue
      }
      if (isAcceptable?.(parsed.data) ?? true) return parsed.data
      lastProblem = "failed extra checks"
    } catch (error) {
      if (error instanceof SyntaxError) {
        lastProblem = "malformed JSON"
        continue
      }
      const aiError = toAiError(error)
      if (aiError) throw aiError
      lastProblem = "schema mismatch reported by provider"
    }
  }

  throw new AiError("invalid_response", `AI returned invalid ${name} twice (${lastProblem})`)
}
