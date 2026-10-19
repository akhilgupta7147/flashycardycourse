import { openai } from "@ai-sdk/openai";
import type { Deck } from "@/db/schema";
import { MAX_CARDS_PER_DECK } from "@/lib/deck-limits";
import { MIN_DECK_TEXT_LENGTH } from "@/lib/deck-schema";

/** Model used for AI flashcard generation. Change it here to switch centrally. */
export const flashcardModel = openai("gpt-6-astra");

/** Number of cards generated per AI generation request (fills a whole deck). */
export const AI_GENERATED_CARD_COUNT = MAX_CARDS_PER_DECK;

export type AiGenerationStatus =
  /** Title + description are new or changed since the last generation. */
  | "ready"
  /** Title or description is missing or shorter than the minimum length. */
  | "incomplete"
  /** Cards were already generated from the current title + description. */
  | "unchanged";

/**
 * Whether AI generation is allowed for a deck: it needs a title and a
 * description of at least the minimum length, and they must be new or edited
 * since the last generation (so the same input never regenerates the same cards).
 */
export function getAiGenerationStatus(
  deck: Pick<
    Deck,
    "name" | "description" | "aiGeneratedName" | "aiGeneratedDescription"
  >,
): AiGenerationStatus {
  const name = deck.name.trim();
  const description = deck.description?.trim() ?? "";
  if (
    name.length < MIN_DECK_TEXT_LENGTH ||
    description.length < MIN_DECK_TEXT_LENGTH
  ) {
    return "incomplete";
  }

  const unchanged =
    deck.aiGeneratedName === name && deck.aiGeneratedDescription === description;
  return unchanged ? "unchanged" : "ready";
}
