import { ImageResponse } from "next/og";

export const alt = "Rohit Shroff · AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default link-preview card for every page that doesn't define its own
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "radial-gradient(ellipse at 15% 0%, #1e1b5e 0%, #0a0d1f 45%, #04050c 100%)",
          color: "#e9ecf8",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: 90,
            width: 440,
            height: 440,
            borderRadius: 9999,
            background: "radial-gradient(circle at 35% 30%, #e2fff5 0%, #4fd6ad 35%, #0c4a40 75%, #04050c 100%)",
            boxShadow: "0 0 120px rgba(110,242,200,0.35)",
          }}
        />
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#6ef2c8" }}>AI ENGINEER · FULL-STACK ML</div>
        <div style={{ marginTop: 20, fontSize: 96, fontWeight: 700, lineHeight: 1 }}>Rohit Shroff</div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#8f97ba", maxWidth: 680 }}>
          Projects, study notes and research write-ups, charted as a solar system.
        </div>
      </div>
    ),
    size
  );
}
