import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { LOG_KINDS, LogKind, logNumber, readingMinutes } from "@/lib/logbook";

export const alt = "Rohit Shroff · Logbook entry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link-preview card for LinkedIn/Slack/etc. Drafts get a generic card so titles never leak.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await prisma.logEntry.findUnique({ where: { slug } });
  const visible = entry?.published ? entry : null;
  const kind = visible && visible.kind in LOG_KINDS ? LOG_KINDS[visible.kind as LogKind] : LOG_KINDS["deep-dive"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(ellipse at 15% 0%, #1e1b5e 0%, #0a0d1f 45%, #04050c 100%)",
          color: "#e9ecf8",
          position: "relative",
        }}
      >
        {/* planet in the corner */}
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${kind.color} 30%, #0c2a40 75%, #04050c 100%)`,
            opacity: 0.55,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, letterSpacing: 6, color: "#8f97ba" }}>
          <div style={{ width: 18, height: 18, borderRadius: 9999, background: "#6ef2c8", boxShadow: "0 0 24px #6ef2c8" }} />
          ROHIT SHROFF · LOGBOOK
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
          <div style={{ display: "flex", gap: 18, fontSize: 28, letterSpacing: 3, color: kind.color }}>
            {visible ? `${logNumber(visible.number).toUpperCase()} · ${kind.label.toUpperCase()}` : "NOTES FROM THE FRONTIER"}
          </div>
          <div style={{ marginTop: 20, fontSize: visible && visible.title.length > 60 ? 58 : 72, fontWeight: 700, lineHeight: 1.08 }}>
            {visible ? visible.title : "Study notes, deep dives and research-paper write-ups"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#8f97ba" }}>
          {visible
            ? [`${readingMinutes(visible.body)} min read`, ...visible.tags.slice(0, 4).map((t) => `#${t}`)].join("   ·   ")
            : "AI Engineer · Full-Stack ML"}
        </div>
      </div>
    ),
    size
  );
}
