"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { ApiRequestError, apiPost } from "@/lib/api/client"
import { startResponseSchema, type InterviewSetup } from "@/lib/interview/schema"
import { useInterviewStore } from "@/store/interview-store"

/** Asks the AI for a question plan, saves the new session and opens it. */
export function useStartInterview() {
  const router = useRouter()
  const createSession = useInterviewStore((state) => state.createSession)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = async (setup: InterviewSetup) => {
    setStarting(true)
    setError(null)
    try {
      const plan = await apiPost("/api/interview/start", setup, startResponseSchema)
      const id = createSession(setup, plan)
      router.push(`/interview/session/${id}`)
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : "Something went wrong.")
      setStarting(false)
    }
  }

  return { start, starting, error, clearError: () => setError(null) }
}
