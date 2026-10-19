import { z } from "zod";

/** Minimum length (after trimming) of a deck title and of a deck description. */
export const MIN_DECK_TEXT_LENGTH = 10;

/** Shared validation: both title and description are mandatory. */
export const deckTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .min(
    MIN_DECK_TEXT_LENGTH,
    `Title must be at least ${MIN_DECK_TEXT_LENGTH} characters`,
  )
  .max(255, "Title is too long");

export const deckDescriptionSchema = z
  .string()
  .trim()
  .min(1, "Description is required")
  .min(
    MIN_DECK_TEXT_LENGTH,
    `Description must be at least ${MIN_DECK_TEXT_LENGTH} characters`,
  )
  .max(2000, "Description is too long");
