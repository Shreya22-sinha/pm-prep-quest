import { extractText, getDocumentProxy } from "unpdf"

import { INTERVIEW_SETTINGS } from "@/config/interview"
import { createRateLimiter } from "@/lib/api/rate-limit"
import { errorResponse, getClientKey, rateLimitedResponse } from "@/lib/api/server"
import type { ResumeParseResponse } from "@/lib/interview/schema"

const rateLimit = createRateLimiter({ limit: 10, windowMs: 60_000 })

function isPdf(bytes: Uint8Array): boolean {
  // Every PDF starts with "%PDF".
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

// POST /api/resume/parse: multipart form with a "file" field (PDF) → plain text.
// Resume contents are never logged.
export async function POST(request: Request) {
  const limit = rateLimit(getClientKey(request))
  if (!limit.ok) return rateLimitedResponse(limit)

  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get("file")
  } catch {
    return errorResponse("invalid_request")
  }
  if (!(file instanceof File)) return errorResponse("invalid_request")
  if (file.size > INTERVIEW_SETTINGS.maxResumeFileBytes) return errorResponse("file_too_large")

  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!isPdf(bytes)) return errorResponse("unsupported_file")

  let text: string
  let pages: number
  try {
    const pdf = await getDocumentProxy(bytes)
    const result = await extractText(pdf, { mergePages: true })
    text = tidy(result.text)
    pages = result.totalPages
  } catch {
    return errorResponse("pdf_unreadable")
  }
  if (!text) return errorResponse("pdf_unreadable")

  const body: ResumeParseResponse = {
    text: text.slice(0, INTERVIEW_SETTINGS.maxResumeChars),
    truncated: text.length > INTERVIEW_SETTINGS.maxResumeChars,
    pages,
  }
  return Response.json(body)
}
