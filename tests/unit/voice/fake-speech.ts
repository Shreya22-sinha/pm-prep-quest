import { vi } from "vitest"

import type {
  SpeechRecognitionErrorEventLike,
  SpeechRecognitionEventLike,
  SpeechRecognitionLike,
  SpeechRecognitionResultLike,
} from "@/lib/speech/recognition-types"

/** A scriptable stand-in for the browser's SpeechRecognition. */
export class FakeRecognition implements SpeechRecognitionLike {
  static instances: FakeRecognition[] = []
  static latest(): FakeRecognition {
    const instance = FakeRecognition.instances.at(-1)
    if (!instance) throw new Error("No recognition session started")
    return instance
  }

  lang = ""
  continuous = false
  interimResults = false
  maxAlternatives = 1
  started = false
  onresult: ((event: SpeechRecognitionEventLike) => void) | null = null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null = null
  onend: (() => void) | null = null

  constructor() {
    FakeRecognition.instances.push(this)
  }

  start() {
    this.started = true
  }

  stop() {
    this.onend?.()
  }

  abort() {
    this.onerror?.({ error: "aborted" })
    this.onend?.()
  }

  /** Simulates the browser reporting the session's results so far. */
  hear(...results: { text: string; final: boolean }[]) {
    const list: SpeechRecognitionResultLike[] = results.map(({ text, final }) =>
      Object.assign([{ transcript: text }], { isFinal: final })
    )
    this.onresult?.({ results: list })
  }

  fail(error: string) {
    this.onerror?.({ error })
    this.onend?.()
  }
}

type SpeechWindow = Window & {
  SpeechRecognition?: unknown
  webkitSpeechRecognition?: unknown
}

/** Installs fake speech recognition and synthesis on window. Returns the synthesis spies. */
export function installFakeSpeech({ recognition = true }: { recognition?: boolean } = {}) {
  FakeRecognition.instances = []
  const speechWindow = window as SpeechWindow
  if (recognition) speechWindow.SpeechRecognition = FakeRecognition
  else delete speechWindow.SpeechRecognition
  delete speechWindow.webkitSpeechRecognition

  const synthesis = {
    speak: vi.fn((utterance: { text: string }) => utterance),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  Object.defineProperty(window, "speechSynthesis", { value: synthesis, configurable: true })
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    value: class {
      text: string
      lang = ""
      rate = 1
      voice: unknown = null
      onstart: (() => void) | null = null
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(text: string) {
        this.text = text
      }
    },
    configurable: true,
  })
  return synthesis
}

export function uninstallFakeSpeech() {
  const speechWindow = window as SpeechWindow
  delete speechWindow.SpeechRecognition
  delete speechWindow.webkitSpeechRecognition
  Reflect.deleteProperty(window, "speechSynthesis")
  Reflect.deleteProperty(window, "SpeechSynthesisUtterance")
}
