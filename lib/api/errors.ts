// Error codes shared by API routes and the browser client.

export type ApiErrorCode =
  | "invalid_request"
  | "rate_limited"
  | "ai_not_configured"
  | "ai_busy"
  | "ai_unavailable"
  | "unsupported_file"
  | "file_too_large"
  | "pdf_unreadable"
  | "network_error"

export type ApiErrorBody = {
  error: { code: ApiErrorCode; message: string }
}

export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  invalid_request: "Something in that request didn't look right. Please check and try again.",
  rate_limited: "You're going fast! Please wait a moment and try again.",
  ai_not_configured:
    "The AI interviewer isn't set up yet. Add a GROQ_API_KEY to .env.local and restart the app.",
  ai_busy: "The AI interviewer is very busy right now. Please try again in a minute.",
  ai_unavailable: "We couldn't reach the AI interviewer. Please try again in a moment.",
  unsupported_file: "Please upload a PDF file, or paste your resume as text instead.",
  file_too_large: "That file is too big. Please upload a PDF under 5 MB.",
  pdf_unreadable:
    "We couldn't read text from that PDF (it may be a scanned image). Try pasting your resume instead.",
  network_error: "We couldn't connect. Check your internet connection and try again.",
}
