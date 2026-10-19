"use client";

import { SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AiGenerationStatus } from "@/lib/ai";
import { MIN_DECK_TEXT_LENGTH } from "@/lib/deck-schema";
import { generateCardsAction } from "./actions";

/**
 * Shown to users WITH the `ai_flashcard_generation` feature. The button is
 * disabled (with an explanatory tooltip) while generating, when the deck has no
 * valid title/description, or when the title/description haven't changed since the last
 * generation. Regenerating replaces the previously AI-generated cards.
 */
export function GenerateCardsButton({
  deckId,
  status,
}: {
  deckId: number;
  status: AiGenerationStatus;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const disabledReason = isPending
    ? "Generating cards. This can take a few seconds."
    : status === "incomplete"
      ? `Give this deck a title and a description of at least ${MIN_DECK_TEXT_LENGTH} characters each. AI uses them to generate cards.`
      : status === "unchanged"
        ? "Cards were already generated from this title and description. Edit the title or description to generate new ones."
        : null;

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await generateCardsAction({ deckId });
      if (!result.success) setError(result.error);
    });
  }

  const button = (
    <Button
      variant="outline"
      size="default"
      onClick={handleClick}
      disabled={disabledReason !== null}
    >
      <SparklesIcon data-icon="inline-start" />
      {isPending ? "Generating..." : "Generate cards with AI"}
    </Button>
  );

  return (
    <div className="flex flex-col items-end gap-2">
      {disabledReason ? (
        <Tooltip>
          {/* Disabled buttons don't receive hover, so the span is the trigger. */}
          <TooltipTrigger render={<span tabIndex={0} className="inline-flex" />}>
            {button}
          </TooltipTrigger>
          <TooltipContent>{disabledReason}</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
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
