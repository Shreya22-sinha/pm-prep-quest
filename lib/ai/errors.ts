export type AiErrorCode =
  "not_configured" | "rate_limited" | "timeout" | "invalid_response" | "unavailable"

/** A failure talking to the AI provider, with a code the API layer maps to a friendly message. */
export class AiError extends Error {
  readonly code: AiErrorCode

  constructor(code: AiErrorCode, message: string) {
    super(message)
    this.name = "AiError"
    this.code = code
  }
}
