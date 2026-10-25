"use client"

import { useEffect } from "react"

// Shown only if the root layout itself fails. It replaces the whole document,
// so global styles, fonts and the theme aren't available: styles are inline.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fcfcfe",
          color: "#1d1b2e",
        }}
      >
        <title>Something went wrong · PM Prep Quest</title>
        <main role="alert" style={{ maxWidth: 440, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>Oops, something went sideways</h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: "#5b5970", margin: "0 0 24px" }}>
            That one&apos;s on us, not you. Your progress is saved in this browser, so nothing is
            lost.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              font: "inherit",
              fontWeight: 600,
              fontSize: 16,
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              background: "#4f46e5",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
