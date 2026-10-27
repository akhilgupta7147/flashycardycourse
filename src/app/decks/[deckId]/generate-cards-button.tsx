"use client";

import { SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateCardsAction } from "./actions";

/**
 * Shown to users WITH the `ai_flashcard_generation` feature. Opens a prompt
 * where they can paste notes. Generating replaces the deck's current cards.
 */
export function GenerateCardsButton({ deckId }: { deckId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    setOpen(nextOpen);
    if (nextOpen) setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await generateCardsAction({
        deckId,
        notes: notes.trim() || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotes("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Button
        variant="outline"
        onClick={() => handleOpenChange(true)}
        disabled={isPending}
      >
        <SparklesIcon data-icon="inline-start" />
        {isPending ? "Generating..." : "Generate cards with AI"}
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate cards with AI</DialogTitle>
            <DialogDescription>
              Paste notes, or text copied from a PDF or a webpage. This replaces
              the cards already in the deck. FlashyCardy does not open links or
              read uploaded files.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ai-notes">Notes</Label>
              <Textarea
                id="ai-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Paste the material you want turned into flashcards"
                maxLength={8000}
                disabled={isPending}
              />
            </div>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Generating..." : "Generate cards"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Shown to users WITHOUT the feature: explains it's paid and links to pricing. */
export function UpgradeGenerateCardsButton() {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="default"
            onClick={() => router.push("/pricing")}
          />
        }
      >
        <SparklesIcon data-icon="inline-start" />
        Generate cards with AI
      </TooltipTrigger>
      <TooltipContent>
        This is a paid feature. Click to view pricing and upgrade to Pro.
      </TooltipContent>
    </Tooltip>
  );
}
