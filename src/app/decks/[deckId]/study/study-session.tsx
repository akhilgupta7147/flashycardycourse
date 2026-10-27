"use client";

import { CircleCheckIcon, CircleXIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
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
import { resetProgress, reviewCard } from "./actions";
import { LearningCertificate } from "./learning-certificate";

type StudyCard = {
  id: number;
  front: string;
  back: string;
  learned: boolean;
  nextReviewAt: string | null;
};

type Mode = "flip" | "quiz" | "type";
type Status = "idle" | "incorrect" | "correct";

const modes: { id: Mode; label: string }[] = [
  { id: "flip", label: "Flip" },
  { id: "quiz", label: "Quiz" },
  { id: "type", label: "Type" },
];

function isDue(card: StudyCard) {
  if (!card.nextReviewAt) return true;
  return new Date(card.nextReviewAt).getTime() <= Date.now();
}

function shuffle(values: string[]) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

function scheduleCopy(intervalDays: number, learned: boolean) {
  const when = intervalDays === 1 ? "1 day" : `${intervalDays} days`;
  return learned
    ? `Correct. Next review in ${when}.`
    : `We'll show this again in ${when}.`;
}

export function StudySession({
  deckId,
  deckName,
  cards,
}: {
  deckId: number;
  deckName: string;
  cards: StudyCard[];
}) {
  const [queue, setQueue] = useState(() => cards.filter(isDue));
  const [caughtUp, setCaughtUp] = useState(
    () => cards.filter(isDue).length === 0,
  );
  const [learnedCount, setLearnedCount] = useState(
    () => cards.filter((card) => card.learned).length,
  );
  const [missed, setMissed] = useState<StudyCard[]>([]);
  const [mode, setMode] = useState<Mode>("flip");
  const [flipped, setFlipped] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [scheduleNote, setScheduleNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = cards.length;
  const progress = total === 0 ? 0 : Math.round((learnedCount / total) * 100);
  const current = queue[0];
  const currentId = current?.id;
  const currentBack = current?.back;

  useEffect(() => {
    if (currentId == null || currentBack == null) {
      setChoices([]);
      return;
    }
    const distractors = shuffle(
      cards
        .filter((card) => card.id !== currentId && card.back !== currentBack)
        .map((card) => card.back),
    ).slice(0, 3);
    setChoices(shuffle([currentBack, ...distractors]));
  }, [cards, currentBack, currentId]);

  function resetCardUi() {
    setFlipped(false);
    setAnswer("");
    setStatus("idle");
    setScheduleNote(null);
    setError(null);
  }

  function grade(quality: number) {
    if (!current || status !== "idle" || isPending) return;
    const card = current;
    const wasLearned = card.learned;
    startTransition(async () => {
      const result = await reviewCard({
        deckId,
        cardId: card.id,
        quality,
        mode,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setError(null);
      setStatus(result.learned ? "correct" : "incorrect");
      setScheduleNote(scheduleCopy(result.intervalDays, result.learned));
      setLearnedCount((count) => {
        if (result.learned && !wasLearned) return count + 1;
        if (!result.learned && wasLearned) return Math.max(0, count - 1);
        return count;
      });
      setQueue((previous) =>
        previous.map((item) =>
          item.id === card.id
            ? {
                ...item,
                learned: result.learned,
                nextReviewAt: result.nextReviewAt,
              }
            : item,
        ),
      );
    });
  }

  function nextCard() {
    if (status === "incorrect" && current) {
      setMissed((previous) => [...previous, current]);
    }
    setQueue((previous) => previous.slice(1));
    resetCardUi();
  }

  function handleTypeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || status !== "idle" || !answer.trim()) return;
    grade(isAnswerCorrect(answer, current.back) ? 4 : 1);
  }

  function handleRetryMissed() {
    setQueue(missed);
    setMissed([]);
    resetCardUi();
  }

  function handlePracticeAll() {
    setCaughtUp(false);
    setQueue(cards);
    setMissed([]);
    resetCardUi();
  }

  function handleStudyAgain() {
    startTransition(async () => {
      const result = await resetProgress({ deckId });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCaughtUp(false);
      setQueue(cards.map((card) => ({ ...card, learned: false, nextReviewAt: null })));
      setMissed([]);
      setLearnedCount(0);
      resetCardUi();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="wrap-anywhere">{deckName}</CardTitle>
          <CardDescription>
            Due cards are scheduled with spaced repetition.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Progress value={progress}>
            <ProgressLabel>
              Mastery ({learnedCount} of {total} learned)
            </ProgressLabel>
            <ProgressValue />
          </Progress>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Study mode">
            {modes.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={mode === item.id ? "default" : "outline"}
                aria-pressed={mode === item.id}
                onClick={() => {
                  setMode(item.id);
                  resetCardUi();
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {caughtUp ? (
        <Card>
          <CardHeader>
            <CardTitle>You&apos;re up to date</CardTitle>
            <CardDescription>
              Nothing is due right now. Practice the whole deck anyway, or come
              back when the next review is scheduled.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button type="button" onClick={handlePracticeAll}>
              Practice all cards
            </Button>
          </CardFooter>
        </Card>
      ) : current ? (
        <div className="flex flex-col gap-4">
          {mode === "flip" ? (
            <div className="[perspective:1000px]">
              <div
                className={`relative h-56 transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
              >
                <Card className="absolute inset-0 [backface-visibility:hidden]">
                  <CardHeader>
                    <CardDescription>Front</CardDescription>
                    <CardTitle className="wrap-anywhere">{current.front}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <CardHeader>
                    <CardDescription>Back</CardDescription>
                    <CardTitle className="wrap-anywhere">{current.back}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>
          ) : null}
        <Card>
          <CardHeader>
            <CardDescription>
              {mode === "flip"
                ? "Flip the card, then grade your recall."
                : mode === "quiz"
                  ? "Choose the correct answer."
                  : "Type the answer."}
            </CardDescription>
            {mode !== "flip" ? (
              <CardTitle className="wrap-anywhere">{current.front}</CardTitle>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {mode === "quiz" ? (
              choices.length < 2 ? (
                <Alert>
                  <AlertTitle>Need another card</AlertTitle>
                  <AlertDescription>
                    Multiple choice needs at least one other answer in this
                    deck. Use Flip or Type for this card.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex flex-col gap-2">
                  {choices.map((choice, index) => (
                    <Button
                      key={`${choice}-${index}`}
                      type="button"
                      variant="outline"
                      className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                      disabled={status !== "idle" || isPending}
                      onClick={() => grade(choice === current.back ? 4 : 1)}
                    >
                      {choice}
                    </Button>
                  ))}
                </div>
              )
            ) : null}

            {mode === "type" ? (
              <form id="type-answer" onSubmit={handleTypeSubmit} className="flex flex-col gap-2">
                <Label htmlFor="study-answer">Your answer</Label>
                <Input
                  id="study-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Type your answer"
                  autoComplete="off"
                  disabled={status !== "idle" || isPending}
                  aria-invalid={status === "incorrect" ? true : undefined}
                />
              </form>
            ) : null}

            {status === "incorrect" ? (
              <Alert variant="destructive">
                <CircleXIcon />
                <AlertTitle>Not yet</AlertTitle>
                <AlertDescription>
                  Correct answer: {current.back}
                  {scheduleNote ? ` ${scheduleNote}` : ""}
                </AlertDescription>
              </Alert>
            ) : null}

            {status === "correct" ? (
              <Alert>
                <CircleCheckIcon className="text-primary" />
                <AlertTitle className="text-primary">Nice work</AlertTitle>
                <AlertDescription>{scheduleNote}</AlertDescription>
              </Alert>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            {mode === "flip" && status === "idle" ? (
              <Button type="button" variant="outline" onClick={() => setFlipped((value) => !value)}>
                {flipped ? "Show front" : "Flip card"}
              </Button>
            ) : null}
            {mode === "flip" && flipped && status === "idle" ? (
              <>
                <Button type="button" variant="outline" onClick={() => grade(1)} disabled={isPending}>
                  Again
                </Button>
                <Button type="button" onClick={() => grade(4)} disabled={isPending}>
                  Good
                </Button>
              </>
            ) : null}
            {mode === "type" && status === "idle" ? (
              <Button type="submit" form="type-answer" disabled={isPending || !answer.trim()}>
                Check answer
              </Button>
            ) : null}
            {status !== "idle" ? (
              <Button type="button" onClick={nextCard}>
                Next card
              </Button>
            ) : null}
            <Button
              type="button"
              variant="destructive"
              onClick={handleStudyAgain}
              disabled={isPending}
            >
              Reset
            </Button>
          </CardFooter>
        </Card>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {missed.length === 0 ? "Session complete" : "Session finished"}
              </CardTitle>
              <CardDescription>
                You&apos;ve learned {learnedCount} of {total}{" "}
                {total === 1 ? "card" : "cards"}.
                {missed.length > 0
                  ? ` ${missed.length} still to review in this session.`
                  : " Cards you already know will return on their spaced-repetition date."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2">
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <div className="flex flex-wrap gap-2">
                {missed.length > 0 ? (
                  <Button type="button" onClick={handleRetryMissed} disabled={isPending}>
                    Retry missed cards
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStudyAgain}
                  disabled={isPending}
                >
                  Reset progress and start over
                </Button>
              </div>
            </CardFooter>
          </Card>
          {learnedCount === total ? <LearningCertificate deckId={deckId} /> : null}
        </>
      )}
    </div>
  );
}
