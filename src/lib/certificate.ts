import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// Everything shown on a certificate. It is signed into the share link so the
// public certificate page needs no login and no database access, and nobody
// can forge or alter a certificate by editing the URL.
const certificateSchema = z.object({
  learnerName: z.string().min(1).max(255),
  deckName: z.string().min(1).max(255),
  cardCount: z.number().int().positive(),
  scorePercent: z.number().int().min(0).max(100),
  passMarkPercent: z.number().int().min(0).max(100),
  completedOn: z.string().min(1).max(64),
});

export type CertificateData = z.infer<typeof certificateSchema>;

function sign(payload: string) {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error("CLERK_SECRET_KEY is not set");
  return createHmac("sha256", secret)
    .update(`certificate:${payload}`)
    .digest("base64url");
}

/** Encodes and signs certificate data into a URL-safe token. */
export function createCertificateToken(data: CertificateData) {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Returns the certificate data for a valid token, otherwise `null`. */
export function readCertificateToken(token: string): CertificateData | null {
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }

  try {
    const parsed = certificateSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
