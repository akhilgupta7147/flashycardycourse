import { Show } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { getCardsForDeck } from "@/db/queries/cards";
import { getDeckById } from "@/db/queries/decks";
import { getAiGenerationStatus } from "@/lib/ai";
import { MAX_CARDS_PER_DECK } from "@/lib/deck-limits";
import { CardDialog } from "./card-dialog";
import { DeleteCardDialog } from "./delete-card-dialog";
import { DeleteDeckDialog } from "./delete-deck-dialog";
import { EditDeckDialog } from "./edit-deck-dialog";
import {
  GenerateCardsButton,
  UpgradeGenerateCardsButton,
} from "./generate-cards-button";

const paramsSchema = z.object({
  deckId: z.coerce.number().int().positive(),
});

export default async function DeckPage({
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
  const learnedCount = cards.filter((card) => card.learned).length;
  const progress =
    cards.length === 0 ? 0 : Math.round((learnedCount / cards.length) * 100);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          ← Back to dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{deck.name}</CardTitle>
          {deck.description ? (
            <CardDescription>{deck.description}</CardDescription>
          ) : null}
          <CardAction className="flex gap-2">
            <EditDeckDialog
              deckId={deck.id}
              name={deck.name}
              description={deck.description}
            />
            <DeleteDeckDialog deckId={deck.id} name={deck.name} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {cards.length} {cards.length === 1 ? "card" : "cards"}
            </Badge>
            <span>
              Updated{" "}
              {deck.updatedAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <Progress value={progress}>
            <ProgressLabel>
              Study progress ({learnedCount} of {cards.length} learned)
            </ProgressLabel>
            <ProgressValue />
          </Progress>

          {cards.length === 0 ? (
            <Button disabled className="self-start">
              Start study session
            </Button>
          ) : (
            <Button
              className="self-start"
              nativeButton={false}
              render={<Link href={`/decks/${deck.id}/study`} />}
            >
              Start study session
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cards</CardTitle>
          <CardAction className="flex items-start gap-2">
            <Show
              when={{ feature: "ai_flashcard_generation" }}
              fallback={<UpgradeGenerateCardsButton />}
            >
              <GenerateCardsButton
                deckId={deck.id}
                status={getAiGenerationStatus(deck)}
              />
            </Show>
            <CardDialog
              mode="create"
              deckId={deck.id}
              disabledReason={
                cards.length >= MAX_CARDS_PER_DECK
                  ? `This deck has reached the limit of ${MAX_CARDS_PER_DECK} cards. Delete a card to add a new one.`
                  : undefined
              }
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No cards yet</CardTitle>
                <CardDescription>
                  This deck doesn&apos;t have any flashcards yet. Add your
                  first card to get started.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Card key={card.id}>
                  <CardHeader>
                    <CardDescription>Front</CardDescription>
                    <CardTitle>{card.front}</CardTitle>
                    <CardAction className="flex gap-2">
                      <CardDialog
                        mode="edit"
                        deckId={deck.id}
                        card={{
                          id: card.id,
                          front: card.front,
                          back: card.back,
                        }}
                      />
                      <DeleteCardDialog deckId={deck.id} cardId={card.id} />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <CardDescription>Back</CardDescription>
                      <p>{card.back}</p>
                    </div>
                    {card.learned ? (
                      <Badge variant="secondary" className="self-start">
                        Learned
                      </Badge>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
