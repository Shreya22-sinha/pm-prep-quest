"use client"

import { useEffect, useState } from "react"

import { ApiRequestError } from "@/lib/api/client"

// Shared across components so a request for the same key only ever runs once
// at a time, even if React runs the effect twice in development.
const inFlight = new Map<string, Promise<void>>()

/**
 * Runs `run` once for `key` (pass null to skip), e.g. "evaluate interview X".
 * The caller saves the result in a store, so a completed request isn't repeated.
 */
export function useOnceRequest(key: string | null, run: () => Promise<void>) {
  const [error, setError] = useState<{ key: string; message: string } | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!key) return
    let active = true

    let promise = inFlight.get(key)
    if (!promise) {
      promise = run().finally(() => inFlight.delete(key))
      inFlight.set(key, promise)
    }
    promise.catch((caught: unknown) => {
      if (!active) return
      setError({
        key,
        message: caught instanceof ApiRequestError ? caught.message : "Something went wrong.",
      })
    })

    return () => {
      active = false
    }
    // `run` reads fresh state from stores, so it's intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const currentError = error && error.key === key ? error.message : null

  return {
    error: currentError,
    retry: () => {
      setError(null)
      setAttempt((value) => value + 1)
    },
  }
}
