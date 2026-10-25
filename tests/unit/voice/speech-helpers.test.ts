import { afterEach, describe, expect, it } from "vitest"

import {
  getSpeechRecognition,
  hasSpeechSynthesis,
  joinTranscript,
  pickVoice,
  readResults,
  recognitionErrorMessage,
} from "@/lib/speech/speech"

import { FakeRecognition, installFakeSpeech, uninstallFakeSpeech } from "./fake-speech"

describe("speech helpers", () => {
  afterEach(() => uninstallFakeSpeech())

  it("joins transcript pieces with single spaces", () => {
    expect(joinTranscript(" I'd focus ", "", "on tourists ")).toBe("I'd focus on tourists")
    expect(joinTranscript("", " ")).toBe("")
  })

  it("separates final words from words still being recognised", () => {
    const results = [
      Object.assign([{ transcript: "I would focus" }], { isFinal: true }),
      Object.assign([{ transcript: "on first time" }], { isFinal: true }),
      Object.assign([{ transcript: "visit" }], { isFinal: false }),
    ]
    expect(readResults(results)).toEqual({
      final: "I would focus on first time",
      interim: "visit",
    })
  })

  it("prefers a pleasant voice in the right language", () => {
    const voices = [
      { name: "Hindi Voice", lang: "hi-IN" },
      { name: "Basic English", lang: "en-GB" },
      { name: "Samantha", lang: "en-US" },
    ]
    expect(pickVoice(voices, "en-IN")).toBe(2)
    expect(pickVoice(voices.slice(0, 2), "en-US")).toBe(1)
    expect(pickVoice([{ name: "Anna", lang: "de-DE" }], "en-US")).toBe(-1)
  })

  it("explains recognition errors kindly", () => {
    expect(recognitionErrorMessage("not-allowed")).toMatch(/Microphone access is blocked/)
    expect(recognitionErrorMessage("no-speech")).toMatch(/didn't catch anything/)
    expect(recognitionErrorMessage("something-new")).toMatch(/type your answer instead/)
  })

  it("detects support, including the prefixed version Chrome and Safari use", () => {
    expect(getSpeechRecognition()).toBeNull()
    expect(hasSpeechSynthesis()).toBe(false)

    installFakeSpeech({ recognition: false })
    ;(window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition =
      FakeRecognition
    expect(getSpeechRecognition()).toBe(FakeRecognition)
    expect(hasSpeechSynthesis()).toBe(true)
  })
})
