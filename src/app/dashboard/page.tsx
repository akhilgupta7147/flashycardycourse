import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { getDecksWithProgressForUser } from "@/db/queries/decks";
import { FREE_DECK_LIMIT } from "@/lib/billing";
import { CreateDeckDialog } from "./create-deck-dialog";

export default async function DashboardPage() {
  const { userId, has } = await auth();
  if (!userId) redirect("/");

  const user = await currentUser();

  const decks = await getDecksWithProgressForUser(userId);

  // Cosmetic gating only: createDeck re-checks this on the server.
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const limitReached = !hasUnlimitedDecks && decks.length >= FREE_DECK_LIMIT;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Your decks</CardTitle>
          {limitReached ? (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/pricing" />}
            >
              Upgrade to Pro
            </Button>
          ) : (
            <CreateDeckDialog />
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {limitReached ? (
            <Alert>
              <AlertTitle>Deck limit reached</AlertTitle>
              <AlertDescription>
                Free plans are limited to {FREE_DECK_LIMIT} decks. Upgrade to
                Pro for unlimited decks.
              </AlertDescription>
            </Alert>
          ) : null}
          {decks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No decks yet</CardTitle>
                <CardDescription>
                  You don&apos;t have any flashcard decks yet.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <Card key={deck.id} className="h-72">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      <Link
                        href={`/decks/${deck.id}`}
                        className="hover:underline"
                      >
                        {deck.name}
                      </Link>
                    </CardTitle>
                    {/* Always rendered with a reserved 2-line height so every deck card lays out identically. */}
                    <CardDescription className="line-clamp-2 min-h-10">
                      {deck.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <Progress
                      value={
                        deck.totalCards === 0
                          ? 0
                          : Math.round(
                              (deck.learnedCards / deck.totalCards) * 100,
                            )
                      }
                    >
                      <ProgressLabel>
                        Learned ({deck.learnedCards} of {deck.totalCards})
                      </ProgressLabel>
                      <ProgressValue />
                    </Progress>
                    <div>
                      Updated{" "}
                      {deck.updatedAt.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      nativeButton={false}
                      render={<Link href={`/decks/${deck.id}`} />}
                    >
                      Know More
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
