"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { VOICE_SETTINGS } from "@/config/voice"
import { useSpeechSynthesisSupported } from "@/hooks/use-speech-support"
import { pickVoice, speechLanguage } from "@/lib/speech/speech"

/** Reads text aloud with the browser's built-in voices (SpeechSynthesis). */
export function useSpeechSynthesis() {
  const supported = useSpeechSynthesisSupported()
  const [speaking, setSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    // Voices often load asynchronously, so pick again when the list changes.
    const chooseVoice = () => {
      const voices = synth.getVoices()
      voiceRef.current = voices[pickVoice(voices, speechLanguage())] ?? null
    }
    chooseVoice()
    synth.addEventListener("voiceschanged", chooseVoice)
    return () => {
      synth.removeEventListener("voiceschanged", chooseVoice)
      synth.cancel()
    }
  }, [supported])

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text.trim()) return
      const synth = window.speechSynthesis
      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = speechLanguage()
      utterance.rate = VOICE_SETTINGS.speechRate
      if (voiceRef.current) utterance.voice = voiceRef.current
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      synth.speak(utterance)
    },
    [supported]
  )

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { supported, speaking, speak, cancel }
}
