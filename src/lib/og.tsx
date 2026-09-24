import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Shared OG card. Rendered from the same tokens as the site — midnight ground,
 * `pass` accent, mono eyebrow — so a shared link looks like the page it came from.
 */
export function ogImage({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0b0e14",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: "#4fd6b0",
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: "#4fd6b0",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 56 : 68,
              lineHeight: 1.08,
              color: "#f4f6fa",
              letterSpacing: -2,
              fontWeight: 600,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, color: "#9aa5b5", maxWidth: 940 }}>
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ height: 1, width: 64, backgroundColor: "#3a4455" }} />
          <div style={{ fontSize: 22, color: "#6b7687" }}>
            Aneeq Khatri · AI Engineer
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
