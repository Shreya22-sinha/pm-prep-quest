"use client"

import { useSyncExternalStore } from "react"

import { getSpeechRecognition, hasSpeechSynthesis } from "@/lib/speech/speech"

// Browser support doesn't change while the page is open, so there's nothing to subscribe to.
const noSubscription = () => () => {}

/** Whether the browser can turn speech into text. False on the server. */
export function useSpeechRecognitionSupported(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => getSpeechRecognition() !== null,
    () => false
  )
}

/** Whether the browser can read text aloud. False on the server. */
export function useSpeechSynthesisSupported(): boolean {
  return useSyncExternalStore(noSubscription, hasSpeechSynthesis, () => false)
}
