"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  countDecksForUser,
  createDeck as createDeckQuery,
} from "@/db/queries/decks";
import { FREE_DECK_LIMIT } from "@/lib/billing";
import { deckDescriptionSchema, deckTitleSchema } from "@/lib/deck-schema";

export type ActionResult = { success: true } | { success: false; error: string };

const createDeckSchema = z.object({
  name: deckTitleSchema,
  description: deckDescriptionSchema,
});

type CreateDeckInput = z.input<typeof createDeckSchema>;

export async function createDeck(input: CreateDeckInput): Promise<ActionResult> {
  const { userId, has } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = createDeckSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // `unlimited_decks` takes precedence over the `3_deck_limit` cap.
  if (!has({ feature: "unlimited_decks" })) {
    const deckCount = await countDecksForUser(userId);
    if (deckCount >= FREE_DECK_LIMIT) {
      return {
        success: false,
        error: `Deck limit reached. Free plans are limited to ${FREE_DECK_LIMIT} decks. Upgrade to Pro for unlimited decks.`,
      };
    }
  }

  await createDeckQuery({ userId, ...parsed.data });

  revalidatePath("/dashboard");
  return { success: true };
}
