import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Brain, Sparkles } from "lucide-react";
import { AuthNavButtons } from "@/components/auth-nav-buttons";
import { PlanCards } from "@/components/plan-cards";
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
    <main className="flex flex-1 flex-col items-center bg-background px-4 py-10 text-center sm:py-16 text-foreground">
      <div className="flex w-full max-w-3xl flex-col items-center gap-10">
        <Card className="w-full max-w-xl">
          <CardHeader className="items-center">
            <Badge variant="secondary">
              <Sparkles />
              A fun learning project
            </Badge>
            <CardTitle className="mt-2">Welcome!</CardTitle>
            <CardDescription>
              This is a fun learning app. Log in to start building your own
              flashcard decks.
            </CardDescription>
          </CardHeader>
        </Card>

        <section className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Brain className="size-8 text-primary sm:size-10" />
            <h1 className="text-4xl font-semibold sm:text-5xl tracking-tight text-foreground">
              FlashyCardy
            </h1>
          </div>
          <p className="max-w-md text-base text-muted-foreground sm:text-lg">
            Your personal flashcard platform. Build decks, flip cards and
            remember more.
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <AuthNavButtons />
          </div>
        </section>

        <PlanCards />
      </div>
      <footer className="mt-auto pt-10 text-sm sm:pt-16 text-muted-foreground">
        Created by Akhil Gupta while learning Vibecoding with Cursor.ai.
      </footer>
    </main>
  );
}
