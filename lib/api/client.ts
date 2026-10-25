import type { z } from "zod"

import { API_ERROR_MESSAGES, type ApiErrorCode } from "@/lib/api/errors"

/** A failed API call with a friendly, user-facing message. */
export class ApiRequestError extends Error {
  readonly code: ApiErrorCode

  constructor(code: ApiErrorCode) {
    super(API_ERROR_MESSAGES[code])
    this.name = "ApiRequestError"
    this.code = code
  }
}

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === "string" && Object.hasOwn(API_ERROR_MESSAGES, value)
}

/** POSTs JSON (or FormData) and validates the response. Throws ApiRequestError. */
export async function apiPost<T>(
  url: string,
  body: unknown,
  schema: z.ZodType<T>,
  signal?: AbortSignal
): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      signal,
      ...(body instanceof FormData
        ? { body }
        : { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiRequestError("network_error")
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const code =
      data && typeof data === "object" && "error" in data
        ? (data.error as { code?: unknown }).code
        : undefined
    throw new ApiRequestError(isApiErrorCode(code) ? code : "ai_unavailable")
  }

  const parsed = schema.safeParse(data)
  if (!parsed.success) throw new ApiRequestError("ai_unavailable")
  return parsed.data
}
