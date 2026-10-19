"use client";

import { AwardIcon, Share2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type CertificateLinkResult, createCertificateLink } from "./actions";

const APP_NAME = "FlashyCardy";

type Platform = {
  name: string;
  buildUrl: (params: { text: string; url: string }) => string;
};

const PLATFORMS: Platform[] = [
  {
    name: "X",
    buildUrl: ({ text, url }) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "LinkedIn",
    buildUrl: ({ url }) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    buildUrl: ({ text, url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    name: "WhatsApp",
    buildUrl: ({ text, url }) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
];

export function LearningCertificate({ deckId }: { deckId: number }) {
  // null while the signed certificate link is being created.
  const [result, setResult] = useState<CertificateLinkResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    createCertificateLink({
      deckId,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ success: false, error: "Could not create certificate" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [deckId]);

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certificate of learning</CardTitle>
          <CardDescription>Preparing your certificate…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!result.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certificate of learning</CardTitle>
          <CardDescription>{result.error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { certificate, path } = result;
  const cards = certificate.cardCount === 1 ? "card" : "cards";
  const shareText = `I just earned a certificate of learning for "${certificate.deckName}" on ${APP_NAME}: ${certificate.scorePercent}% score (pass mark ${certificate.passMarkPercent}%), completed on ${certificate.completedOn}! 🎓`;

  function handleShare(platform: Platform) {
    // The link's preview image is the certificate (see opengraph-image.tsx).
    const url = platform.buildUrl({
      text: shareText,
      url: `${window.location.origin}${path}`,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card>
      <CardHeader>
        <Badge variant="secondary">
          <AwardIcon />
          Certificate of learning
        </Badge>
        <CardTitle>{certificate.deckName}</CardTitle>
        <CardDescription>
          This certifies that {certificate.learnerName} learned all{" "}
          {certificate.cardCount} {cards} in this deck.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge>Completed on {certificate.completedOn}</Badge>
          <Badge variant="outline">Score {certificate.scorePercent}%</Badge>
          <Badge variant="outline">
            Pass mark {certificate.passMarkPercent}%
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Proud of your progress? Share your certificate.
        </p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        {PLATFORMS.map((platform) => (
          <Button
            key={platform.name}
            variant="outline"
            onClick={() => {
              handleShare(platform);
            }}
          >
            <Share2Icon data-icon="inline-start" />
            Share on {platform.name}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}
