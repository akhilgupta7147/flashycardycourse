import { AwardIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { readCertificateToken } from "@/lib/certificate";

type Props = { params: Promise<{ token: string }> };

// Public page: it is reached from social media links, so there is no login.
// Its content comes only from the signed token in the URL.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const certificate = readCertificateToken(token);
  if (!certificate) return { title: "Certificate not found" };

  const title = `${certificate.learnerName} completed "${certificate.deckName}"`;
  const description = `Certificate of learning: ${certificate.scorePercent}% score (pass mark ${certificate.passMarkPercent}%), completed on ${certificate.completedOn}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CertificatePage({ params }: Props) {
  const { token } = await params;
  const certificate = readCertificateToken(token);
  if (!certificate) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <Badge variant="secondary">
            <AwardIcon />
            Certificate of learning
          </Badge>
          <CardTitle className="text-2xl">{certificate.deckName}</CardTitle>
          <CardDescription>
            This certifies that {certificate.learnerName} learned all{" "}
            {certificate.cardCount}{" "}
            {certificate.cardCount === 1 ? "card" : "cards"} in this deck.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>Completed on {certificate.completedOn}</Badge>
          <Badge variant="outline">Score {certificate.scorePercent}%</Badge>
          <Badge variant="outline">
            Pass mark {certificate.passMarkPercent}%
          </Badge>
        </CardContent>
        <CardFooter>
          <Button nativeButton={false} render={<Link href="/" />}>
            Create your own flashcards
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
