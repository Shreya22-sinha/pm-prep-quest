// Minimal types for the Web Speech API's SpeechRecognition, which TypeScript's
// DOM library doesn't include. Only the members the app uses are declared.

export interface SpeechRecognitionAlternativeLike {
  readonly transcript: string
}

export interface SpeechRecognitionResultLike {
  readonly isFinal: boolean
  readonly length: number
  readonly [index: number]: SpeechRecognitionAlternativeLike | undefined
}

export interface SpeechRecognitionResultListLike {
  readonly length: number
  readonly [index: number]: SpeechRecognitionResultLike | undefined
}

export interface SpeechRecognitionEventLike {
  readonly results: SpeechRecognitionResultListLike
}

export interface SpeechRecognitionErrorEventLike {
  readonly error: string
}

export interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike
