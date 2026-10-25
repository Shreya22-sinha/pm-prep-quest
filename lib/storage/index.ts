// The app's data layer. v1 keeps everything in the browser; swapping this for
// an API-backed implementation (database + auth) won't require page changes.

export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function createMemoryStorage(): KeyValueStorage {
  const items = new Map<string, string>()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  }
}

/**
 * localStorage when it's available, otherwise an in-memory fallback (server
 * rendering, private browsing, blocked storage) so progress still works for the visit.
 */
export function createBrowserStorage(): KeyValueStorage {
  const fallback = createMemoryStorage()

  const local = (): Storage | null => {
    try {
      return typeof window === "undefined" ? null : window.localStorage
    } catch {
      return null
    }
  }

  return {
    getItem(key) {
      try {
        return local()?.getItem(key) ?? fallback.getItem(key)
      } catch {
        return fallback.getItem(key)
      }
    },
    setItem(key, value) {
      try {
        const storage = local()
        if (storage) storage.setItem(key, value)
        else fallback.setItem(key, value)
      } catch {
        // Quota exceeded or storage blocked: keep the data for this visit.
        fallback.setItem(key, value)
      }
    },
    removeItem(key) {
      try {
        local()?.removeItem(key)
      } catch {
        // Ignore: nothing persisted to remove.
      }
      fallback.removeItem(key)
    },
  }
}

export const appStorage: KeyValueStorage = createBrowserStorage()

export const STORAGE_KEYS = {
  progress: "pmq-progress",
  interviews: "pmq-interviews",
} as const
