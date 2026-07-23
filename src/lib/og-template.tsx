import { ImageResponse } from "next/og";

/**
 * Branded Open Graph image template (1200×630).
 *
 * Used by per-route `opengraph-image.tsx` files via the Next.js metadata
 * file convention. Rendered at the edge with `next/og` (no @vercel/og needed).
 *
 * The design mirrors the site: deep forest-green background (#1C3A2F),
 * gold accent (#C9A84C), NHP wordmark, and a title/subtitle slot.
 */
export function OgImage({ title, subtitle }: { title: string; subtitle?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#1C3A2F",
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(201,168,76,0.18) 0%, rgba(28,58,47,0) 45%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "#C9A84C",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", letterSpacing: -0.5 }}>
            New Homes Property
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "#C9A84C",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Bangkok Real Estate
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.4,
                maxWidth: 900,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Footer line */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.45)" }}>
            newhomesproperty.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
