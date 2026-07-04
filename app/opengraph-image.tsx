import { ImageResponse } from "next/og";

export const alt = "SportRules AI — Instant answers from official sports rulebooks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0e0e0e",
          backgroundImage:
            "radial-gradient(circle at 50% 35%, rgba(255,107,0,0.35) 0%, rgba(255,107,0,0) 60%)",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 128,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            SPORT
          </span>
          <span
            style={{
              fontSize: 128,
              fontWeight: 800,
              color: "#ff6b00",
              letterSpacing: "-2px",
            }}
          >
            RULES AI
          </span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 40,
            color: "#e5e5e5",
            textAlign: "center",
          }}
        >
          Instant answers from official sports rulebooks
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 36,
            fontWeight: 600,
            color: "#ff6b00",
            letterSpacing: "4px",
          }}
        >
          NBA · NFL · MLB · FIFA
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
