"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const samples = [
  {
    front: "What is spaced repetition?",
    back: "Reviewing a card just before you would forget it.",
  },
  {
    front: "Which study modes can you use?",
    back: "Flip, multiple choice, and type the answer.",
  },
  {
    front: "What does Pro add?",
    back: "Unlimited decks and AI flashcards from your notes.",
  },
];

export function DemoCards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = samples[index];

  function show(nextIndex: number) {
    setIndex(nextIndex);
    setFlipped(false);
  }

  return (
    <section className="flex w-full max-w-xl flex-col gap-4 text-left" aria-label="Try a sample card">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary">Try a card</Badge>
        <p className="text-sm text-muted-foreground">
          {index + 1} of {samples.length}
        </p>
      </div>
      <div className="[perspective:1000px]">
        <div
          className={`relative h-52 transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        >
          <Card className="absolute inset-0 [backface-visibility:hidden]">
            <CardHeader>
              <CardDescription>Front</CardDescription>
              <CardTitle className="text-xl">{card.front}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <CardHeader>
              <CardDescription>Back</CardDescription>
              <CardTitle className="text-xl">{card.back}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
      <CardFooter className="justify-between gap-2 rounded-xl border px-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => show((index + samples.length - 1) % samples.length)}
        >
          Previous
        </Button>
        <Button type="button" onClick={() => setFlipped((value) => !value)}>
          {flipped ? "Show front" : "Flip card"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => show((index + 1) % samples.length)}
        >
          Next
        </Button>
      </CardFooter>
    </section>
  );
}
