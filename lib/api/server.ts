import "server-only"

import type { z } from "zod"

import { AiError } from "@/lib/ai/errors"
import { API_ERROR_MESSAGES, type ApiErrorBody, type ApiErrorCode } from "@/lib/api/errors"
import type { RateLimitResult } from "@/lib/api/rate-limit"

const STATUS: Record<ApiErrorCode, number> = {
  invalid_request: 400,
  rate_limited: 429,
  ai_not_configured: 503,
  ai_busy: 503,
  ai_unavailable: 502,
  unsupported_file: 415,
  file_too_large: 413,
  pdf_unreadable: 422,
  network_error: 503,
}

export function errorResponse(code: ApiErrorCode, init?: { headers?: HeadersInit }): Response {
  const body: ApiErrorBody = { error: { code, message: API_ERROR_MESSAGES[code] } }
  return Response.json(body, { status: STATUS[code], headers: init?.headers })
}

export function rateLimitedResponse(result: Extract<RateLimitResult, { ok: false }>): Response {
  return errorResponse("rate_limited", {
    headers: { "Retry-After": String(result.retryAfterSeconds) },
  })
}

/** Best-effort client IP for rate limiting (set by proxies such as Vercel). */
export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip") || "local"
}

/** Parses and validates a JSON body. Returns null when it's missing or invalid. */
export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T | null> {
  try {
    const parsed = schema.safeParse(await request.json())
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/** Maps AI failures to friendly responses. Never includes user content in logs. */
export function aiErrorResponse(error: unknown, route: string): Response {
  const code: ApiErrorCode =
    error instanceof AiError
      ? error.code === "not_configured"
        ? "ai_not_configured"
        : error.code === "rate_limited"
          ? "ai_busy"
          : "ai_unavailable"
      : "ai_unavailable"
  // AiError messages describe the failure type only; they never contain user content.
  console.error(
    `[${route}] AI request failed: ${error instanceof AiError ? `${error.code} (${error.message})` : "unknown"}`
  )
  return errorResponse(code)
}
