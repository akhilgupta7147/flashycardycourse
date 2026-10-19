"use client";

import { CircleCheckIcon, CircleXIcon } from "lucide-react";
import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { isAnswerCorrect } from "@/lib/answer-match";
import { resetProgress, setCardLearned } from "./actions";
import { LearningCertificate } from "./learning-certificate";

type StudyCard = { id: number; front: string; back: string; learned: boolean };

// idle: waiting for an answer, incorrect: answered wrong (correct answer is
// shown), correct: answered right.
type Status = "idle" | "incorrect" | "correct";

export function StudySession({
  deckId,
  deckName,
  cards,
}: {
  deckId: number;
  deckName: string;
  cards: StudyCard[];
}) {
  // Cards still to study in this pass. Each card is shown once per pass.
  const [queue, setQueue] = useState(() =>
    cards.filter((card) => !card.learned),
  );
  const [learnedCount, setLearnedCount] = useState(
    () => cards.filter((card) => card.learned).length,
  );
  // Cards answered incorrectly this pass (not learned).
  const [missed, setMissed] = useState<StudyCard[]>([]);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = cards.length;
  const progress = Math.round((learnedCount / total) * 100);
  const current = queue[0];
  const isFinished = status === "correct" || status === "incorrect";

  function nextCard() {
    if (status === "incorrect" && current) {
      setMissed((previous) => [...previous, current]);
    }
    setQueue((previous) => previous.slice(1));
    setAnswer("");
    setStatus("idle");
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || isFinished || !answer.trim()) return;

    // An answer that is at least 40% similar to the card's back is correct.
    if (!isAnswerCorrect(answer, current.back)) {
      setStatus("incorrect");
      return;
    }

    startTransition(async () => {
      const result = await setCardLearned({
        deckId,
        cardId: current.id,
        learned: true,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setError(null);
      setStatus("correct");
      setLearnedCount((previous) => previous + 1);
    });
  }

  function handleRetryMissed() {
    setQueue(missed);
    setMissed([]);
    setAnswer("");
    setStatus("idle");
    setError(null);
  }

  function handleStudyAgain() {
    startTransition(async () => {
      const result = await resetProgress({ deckId });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setError(null);
      setQueue(cards);
      setMissed([]);
      setLearnedCount(0);
      setAnswer("");
      setStatus("idle");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{deckName}</CardTitle>
          <CardDescription>Study session</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress}>
            <ProgressLabel>
              Study progress ({learnedCount} of {total} learned)
            </ProgressLabel>
            <ProgressValue />
          </Progress>
        </CardContent>
      </Card>

      {current ? (
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CardHeader>
              <CardDescription>Question</CardDescription>
              <CardTitle>{current.front}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="study-answer">Your answer</Label>
                <Input
                  id="study-answer"
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                  }}
                  placeholder="Type your answer"
                  autoComplete="off"
                  autoFocus
                  disabled={isFinished || isPending}
                  aria-invalid={status === "incorrect" ? true : undefined}
                />
              </div>

              {status === "incorrect" ? (
                <Alert variant="destructive">
                  <CircleXIcon />
                  <AlertTitle>Incorrect answer</AlertTitle>
                  <AlertDescription>
                    Correct answer: {current.back}
                  </AlertDescription>
                </Alert>
              ) : null}

              {status === "correct" ? (
                <Alert>
                  <CircleCheckIcon className="text-green-600 dark:text-green-500" />
                  <AlertTitle className="text-green-600 dark:text-green-500">
                    Correct!
                  </AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-500">
                    This card is now marked as learned.
                  </AlertDescription>
                </Alert>
              ) : null}

              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </CardContent>
            <CardFooter className="gap-2">
              {isFinished ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleStudyAgain}
                    disabled={isPending}
                  >
                    Reset
                  </Button>
                  <Button type="button" onClick={nextCard}>
                    Next card
                  </Button>
                </>
              ) : (
                <>
                  <Button type="submit" disabled={isPending || !answer.trim()}>
                    Check answer
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleStudyAgain}
                    disabled={isPending}
                  >
                    Reset
                  </Button>
                </>
              )}
            </CardFooter>
          </form>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {missed.length === 0
                  ? "Session complete 🎉"
                  : "Session finished"}
              </CardTitle>
              <CardDescription>
                You&apos;ve learned {learnedCount} of {total}{" "}
                {total === 1 ? "card" : "cards"}.
                {missed.length > 0
                  ? ` ${missed.length} ${missed.length === 1 ? "card" : "cards"} still to learn.`
                  : null}{" "}
                Reset your progress to start over and solidify your learning.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2">
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              <div className="flex gap-2">
                {missed.length > 0 ? (
                  <Button onClick={handleRetryMissed} disabled={isPending}>
                    Retry missed cards
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  onClick={handleStudyAgain}
                  disabled={isPending}
                >
                  Reset progress &amp; start over
                </Button>
              </div>
            </CardFooter>
          </Card>
          {learnedCount === total ? (
            <LearningCertificate deckId={deckId} />
          ) : null}
        </>
      )}
    </div>
  );
}
