import { ImageResponse } from "next/og"

import { siteConfig } from "@/config/site"

// The preview image shown when a link to the app is shared (spec 8: Open Graph image).
export const alt = `${siteConfig.name}: your friendly path to a PM role`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        color: "#ffffff",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 700 }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "#ffffff",
            color: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
          }}
        >
          🚀
        </div>
        {siteConfig.name}
      </div>
      <div style={{ marginTop: 48, fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>
        Build products millions use.
      </div>
      <div
        style={{ marginTop: 16, fontSize: 72, fontWeight: 800, lineHeight: 1.1, color: "#fde68a" }}
      >
        Start your PM journey today.
      </div>
      <div style={{ marginTop: 40, fontSize: 30, opacity: 0.9 }}>
        Learn the roadmap · Practise with an AI interviewer · Land the role
      </div>
    </div>,
    size
  )
}
