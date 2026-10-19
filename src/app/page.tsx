import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookOpen, Brain, Crown, Layers, Sparkles } from "lucide-react";
import { AuthNavButtons } from "@/components/auth-nav-buttons";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center bg-gradient-to-b from-primary/10 via-background to-background px-4 py-16 text-center text-foreground">
      <div className="flex w-full max-w-3xl flex-col items-center gap-10">
        <Card className="w-full max-w-xl">
          <CardHeader className="items-center">
            <Badge variant="secondary">
              <Sparkles />
              A fun learning project
            </Badge>
            <CardTitle className="mt-2">Welcome!</CardTitle>
            <CardDescription>
              This is a fun learning app created by Akhil Gupta while learning
              Vibecoding with Cursor.ai.
            </CardDescription>
          </CardHeader>
        </Card>

        <section className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Brain className="size-10 text-primary" />
            <h1 className="text-5xl font-semibold tracking-tight text-foreground">
              FlashyCardy
            </h1>
          </div>
          <p className="max-w-md text-lg text-muted-foreground">
            Your personal flashcard platform. Build decks, flip cards and
            remember more.
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <AuthNavButtons />
          </div>
        </section>

        <section className="grid w-full gap-4 text-left sm:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge variant="outline">
                <BookOpen />
                Free
              </Badge>
              <CardTitle className="mt-2 flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                Up to 3 decks
              </CardTitle>
              <CardDescription>
                Log in to create up to 3 decks for free and start learning
                right away.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Badge>
                <Crown />
                Pro
              </Badge>
              <CardTitle className="mt-2 flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Unlimited decks
              </CardTitle>
              <CardDescription>
                Get on a Pro plan to create as many decks as you want, plus
                AI-generated flashcards.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>
    </main>
  );
}
