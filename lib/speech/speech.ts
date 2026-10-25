import { SUPPORTED_BROWSERS_HINT, VOICE_SETTINGS } from "@/config/voice"
import type {
  SpeechRecognitionConstructor,
  SpeechRecognitionResultListLike,
} from "@/lib/speech/recognition-types"

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

/** The browser's SpeechRecognition constructor (prefixed in Chrome and Safari), or null. */
export function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null
  const speechWindow = window as SpeechWindow
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null
}

export function hasSpeechSynthesis(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function"
  )
}

/** English variant of the browser's language, so accents are recognised well. */
export function speechLanguage(): string {
  if (typeof navigator === "undefined") return VOICE_SETTINGS.fallbackLanguage
  return navigator.language?.toLowerCase().startsWith("en")
    ? navigator.language
    : VOICE_SETTINGS.fallbackLanguage
}

/** Joins transcript pieces with single spaces, skipping empty ones. */
export function joinTranscript(...parts: string[]): string {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ")
}

/** Splits recognition results into finished text and text still being recognised. */
export function readResults(results: SpeechRecognitionResultListLike): {
  final: string
  interim: string
} {
  const final: string[] = []
  const interim: string[] = []
  for (let index = 0; index < results.length; index++) {
    const result = results[index]
    const text = result?.[0]?.transcript ?? ""
    if (result?.isFinal) final.push(text)
    else interim.push(text)
  }
  return { final: joinTranscript(...final), interim: joinTranscript(...interim) }
}

/** A pleasant voice for the language: a preferred name first, then any matching voice. */
export function pickVoice(
  voices: readonly Pick<SpeechSynthesisVoice, "name" | "lang">[],
  language: string
): number {
  const languagePrefix = language.slice(0, 2).toLowerCase()
  const matching = voices
    .map((voice, index) => ({ voice, index }))
    .filter(({ voice }) => voice.lang.toLowerCase().startsWith(languagePrefix))

  for (const preferred of VOICE_SETTINGS.preferredVoices) {
    const found = matching.find(({ voice }) =>
      voice.name.toLowerCase().includes(preferred.toLowerCase())
    )
    if (found) return found.index
  }
  return matching[0]?.index ?? -1
}

/** Friendly messages for SpeechRecognition error codes. */
export function recognitionErrorMessage(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is blocked. Allow it from the icon in your browser's address bar, or type your answer instead."
    case "audio-capture":
      return "We couldn't find a microphone. Check it's connected, or type your answer instead."
    case "no-speech":
      return "We didn't catch anything. Tap the mic and try again, a little closer to the microphone."
    case "network":
      return "Voice recognition needs an internet connection. Check your connection, or type your answer instead."
    case "language-not-supported":
      return `Voice recognition doesn't support your language setting here. Try ${SUPPORTED_BROWSERS_HINT}, or type instead.`
    default:
      return "Something went wrong with voice recognition. Try again, or type your answer instead."
  }
}
