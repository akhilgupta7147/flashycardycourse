import { ImageResponse } from "next/og";
import { readCertificateToken } from "@/lib/certificate";

export const alt = "Certificate of learning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The image shown in the social media post. It is rendered to a PNG by
// ImageResponse, which only supports inline-styled flexbox JSX (not shadcn).
export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const certificate = readCertificateToken(token);

  if (!certificate) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#171717",
          fontSize: 48,
        }}
      >
        Certificate not found
      </div>,
      size,
    );
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 36,
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "48px 64px",
          background: "#ffffff",
          border: "6px solid #171717",
          color: "#171717",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#525252",
          }}
        >
          FlashyCardy · Certificate of learning
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, color: "#525252" }}>
            This certifies that
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 64,
              fontWeight: 700,
            }}
          >
            {certificate.learnerName}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 28,
              color: "#525252",
            }}
          >
            learned all {certificate.cardCount}{" "}
            {certificate.cardCount === 1 ? "card" : "cards"} in
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            {certificate.deckName}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-around",
            borderTop: "2px solid #e5e5e5",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", fontSize: 22, color: "#525252" }}>
              Completed on
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
              {certificate.completedOn}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", fontSize: 22, color: "#525252" }}>
              Score
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
              {certificate.scorePercent}%
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", fontSize: 22, color: "#525252" }}>
              Pass mark
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
              {certificate.passMarkPercent}%
            </div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
