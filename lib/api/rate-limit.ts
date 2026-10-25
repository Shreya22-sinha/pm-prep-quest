// Basic in-memory, per-key rate limiting (spec section 6). It resets when the
// server restarts and isn't shared between server instances, which is fine for v1.

type Window = { count: number; resetAt: number }

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number }

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const windows = new Map<string, Window>()

  return function check(key: string, now = Date.now()): RateLimitResult {
    // Drop expired entries now and then so memory stays bounded.
    if (windows.size > 5_000) {
      for (const [entryKey, entry] of windows) {
        if (entry.resetAt <= now) windows.delete(entryKey)
      }
    }

    const current = windows.get(key)
    if (!current || current.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs })
      return { ok: true }
    }
    if (current.count >= limit) {
      return { ok: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) }
    }
    current.count += 1
    return { ok: true }
  }
}
