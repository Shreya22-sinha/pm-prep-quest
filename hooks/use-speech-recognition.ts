"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useSpeechRecognitionSupported } from "@/hooks/use-speech-support"
import type { SpeechRecognitionLike } from "@/lib/speech/recognition-types"
import {
  getSpeechRecognition,
  joinTranscript,
  readResults,
  recognitionErrorMessage,
  speechLanguage,
} from "@/lib/speech/speech"

/** idle → listening (tap) → processing (tap to stop, finishing words) → idle */
export type RecognitionStatus = "idle" | "listening" | "processing"

type Options = {
  /** Called once per listening session with everything that was said. */
  onTranscript: (transcript: string) => void
}

/** Stops a session without its handlers firing (so a late "end" can't reset a newer session). */
function discard(recognition: SpeechRecognitionLike | null) {
  if (!recognition) return
  recognition.onresult = null
  recognition.onerror = null
  recognition.onend = null
  recognition.abort()
}

/** Turns speech into text with the browser's SpeechRecognition, with live interim results. */
export function useSpeechRecognition({ onTranscript }: Options) {
  const supported = useSpeechRecognitionSupported()
  const [status, setStatus] = useState<RecognitionStatus>("idle")
  const [finalText, setFinalText] = useState("")
  const [interimText, setInterimText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const latest = useRef({ final: "", interim: "" })
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const start = useCallback(() => {
    const Recognition = getSpeechRecognition()
    if (!Recognition) return

    discard(recognitionRef.current)
    const recognition = new Recognition()
    recognition.lang = speechLanguage()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    latest.current = { final: "", interim: "" }
    setFinalText("")
    setInterimText("")
    setError(null)

    recognition.onresult = (event) => {
      // Each event carries every result of this session, so recompute from scratch.
      latest.current = readResults(event.results)
      setFinalText(latest.current.final)
      setInterimText(latest.current.interim)
    }
    recognition.onerror = (event) => {
      if (event.error !== "aborted") setError(recognitionErrorMessage(event.error))
    }
    recognition.onend = () => {
      // Browsers also end sessions after a pause; keep whatever was heard.
      const transcript = joinTranscript(latest.current.final, latest.current.interim)
      latest.current = { final: "", interim: "" }
      recognitionRef.current = null
      setFinalText("")
      setInterimText("")
      setStatus("idle")
      if (transcript) onTranscriptRef.current(transcript)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setStatus("listening")
    } catch {
      recognitionRef.current = null
      setError(recognitionErrorMessage("unknown"))
    }
  }, [])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    setStatus("processing")
    recognitionRef.current.stop()
  }, [])

  // Never leave the microphone on after leaving the page.
  useEffect(() => () => discard(recognitionRef.current), [])

  return { supported, status, finalText, interimText, error, start, stop }
}
