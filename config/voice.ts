// Voice mode settings (spec 5.3 step 3). Uses the browser's built-in Web Speech
// API: no extra keys or services.

export const VOICE_SETTINGS = {
  /** Used when the browser's language isn't English. */
  fallbackLanguage: "en-US",
  /** 1 is normal speed; slightly slower is easier to follow in an interview. */
  speechRate: 0.95,
  /** Voice names to prefer when available (partial, case-insensitive matches). */
  preferredVoices: [
    "Google US English",
    "Samantha",
    "Microsoft Aria",
    "Natural",
    "Google UK English Female",
  ],
} as const

export const VOICE_PRIVACY_NOTE =
  "Voice answers use your browser's built-in speech recognition. Some browsers (such as Chrome) send audio to their own servers to transcribe it. Your transcript is only used for this interview."

export const SUPPORTED_BROWSERS_HINT = "Chrome, Edge or Safari"
