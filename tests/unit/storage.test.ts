import { afterEach, describe, expect, it, vi } from "vitest"

import { createBrowserStorage, createMemoryStorage } from "@/lib/storage"

describe("storage", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("memory storage reads back what it stores", () => {
    const storage = createMemoryStorage()
    storage.setItem("a", "1")
    expect(storage.getItem("a")).toBe("1")
    storage.removeItem("a")
    expect(storage.getItem("a")).toBeNull()
  })

  it("browser storage writes to localStorage", () => {
    const storage = createBrowserStorage()
    storage.setItem("pmq-test", "hello")
    expect(localStorage.getItem("pmq-test")).toBe("hello")
  })

  it("keeps working when localStorage throws (e.g. quota exceeded)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError")
    })
    const storage = createBrowserStorage()
    expect(() => storage.setItem("pmq-test", "kept")).not.toThrow()
    expect(storage.getItem("pmq-test")).toBe("kept")
  })
})
