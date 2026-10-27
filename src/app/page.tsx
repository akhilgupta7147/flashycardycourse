import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BarChart3, Brain, Layers, Sparkles, TimerReset } from "lucide-react";
import { AuthNavButtons } from "@/components/auth-nav-buttons";
import { DemoCards } from "@/components/demo-cards";
import { PlanCards } from "@/components/plan-cards";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Layers,
    title: "Three ways to study",
    description:
      "Flip a card, pick the right answer, or type it yourself.",
  },
  {
    icon: TimerReset,
    title: "Spaced repetition",
    description:
      "Cards come back just before you forget them, using the SM-2 schedule.",
  },
  {
    icon: Sparkles,
    title: "AI from your notes",
    description:
      "Pro members paste notes and get a deck of questions and answers.",
  },
  {
    icon: BarChart3,
    title: "Streaks and mastery",
    description:
      "See your daily streak, how many cards you reviewed, and how much you know.",
  },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center bg-background px-4 py-10 text-foreground sm:py-16">
      <div className="flex w-full max-w-5xl flex-col items-center gap-16 text-center">
        <section className="flex flex-col items-center gap-5">
          <Badge>
            <Sparkles />
            Remember more
          </Badge>
          <div className="flex items-center justify-center gap-3">
            <Brain className="size-10 shrink-0 text-primary sm:size-14" />
            <h1 className="bg-gradient-to-r from-primary to-[color-mix(in_oklch,var(--primary),white_18%)] bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-7xl">
              FlashyCardy
            </h1>
          </div>
          <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
            Build decks, flip cards, and keep what you learn.
          </p>
          <div className="flex items-center justify-center gap-2">
            <AuthNavButtons />
          </div>
        </section>

        <DemoCards />
        <PlanCards />

        <section
          id="features"
          className="grid w-full scroll-mt-24 gap-4 text-left sm:grid-cols-2"
        >
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="size-5 text-primary" />
                <CardTitle className="mt-2">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section id="about" className="w-full max-w-2xl scroll-mt-24">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>
                FlashyCardy is a personal flashcard app created by Akhil Gupta
                while learning to build with Cursor. Study a deck, then let
                spaced repetition bring each card back when it is time to
                review.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>
      <footer className="mt-auto pt-10 text-sm text-muted-foreground sm:pt-16">
        Created by Akhil Gupta while learning Vibecoding with Cursor.ai.
      </footer>
    </main>
  );
}
