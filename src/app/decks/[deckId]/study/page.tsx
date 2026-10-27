import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCardsForDeck } from "@/db/queries/cards";
import { getDeckById } from "@/db/queries/decks";
import { StudySession } from "./study-session";

const paramsSchema = z.object({
  deckId: z.coerce.number().int().positive(),
});

export default async function StudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) notFound();
  const { deckId } = parsed.data;

  // Missing and not-owned decks are treated identically.
  const deck = await getDeckById({ userId, deckId });
  if (!deck) notFound();

  const cards = await getCardsForDeck({ userId, deckId });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6 sm:gap-6 sm:py-10">
      <div>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href={`/decks/${deck.id}`} />}
        >
          ← Back to deck
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No cards to study</CardTitle>
            <CardDescription>
              Add some cards to &ldquo;{deck.name}&rdquo; before starting a
              study session.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <StudySession
          deckId={deck.id}
          deckName={deck.name}
          cards={cards.map((card) => ({
            id: card.id,
            front: card.front,
            back: card.back,
            learned: card.learned,
            nextReviewAt: card.nextReviewAt?.toISOString() ?? null,
          }))}
        />
      )}
    </main>
  );
}
