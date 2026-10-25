// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

// Guards against "mojibake": UTF-8 text (like "…" or "’") that was read with
// the wrong encoding and saved back as garbage such as "â€¦".
const SOURCE_DIRS = ["app", "components", "config", "content", "hooks", "lib", "store"]
const MOJIBAKE = /â€|Ã[\u0080-¿]|Â[ -¿]/

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx|css)$/.test(name) ? [path] : []
  })
}

describe("source files", () => {
  it("contain no mis-encoded characters", () => {
    const broken = SOURCE_DIRS.flatMap(sourceFiles).filter((file) =>
      MOJIBAKE.test(readFileSync(file, "utf8"))
    )
    expect(broken).toEqual([])
  })
})
