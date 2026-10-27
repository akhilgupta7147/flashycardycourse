"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  applyCardReview,
  getCardsForDeck,
  resetDeckProgress as resetDeckProgressQuery,
  setCardLearned as setCardLearnedQuery,
} from "@/db/queries/cards";
import { getDeckById } from "@/db/queries/decks";
import { MATCH_THRESHOLD } from "@/lib/answer-match";
import {
  type CertificateData,
  createCertificateToken,
} from "@/lib/certificate";

export type ActionResult =
  { success: true } | { success: false; error: string };

const setCardLearnedSchema = z.object({
  deckId: z.number().int().positive(),
  cardId: z.number().int().positive(),
  learned: z.boolean(),
});

const resetProgressSchema = z.object({
  deckId: z.number().int().positive(),
});

const reviewCardSchema = z.object({
  deckId: z.number().int().positive(),
  cardId: z.number().int().positive(),
  quality: z.number().int().min(0).max(5),
  mode: z.enum(["flip", "quiz", "type"]),
});

type ReviewCardInput = z.infer<typeof reviewCardSchema>;

export type ReviewCardResult =
  | {
      success: true;
      learned: boolean;
      intervalDays: number;
      nextReviewAt: string | null;
    }
  | { success: false; error: string };

export async function reviewCard(
  input: ReviewCardInput,
): Promise<ReviewCardResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = reviewCardSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const card = await applyCardReview({ userId, ...parsed.data });
  if (!card) return { success: false, error: "Card not found" };

  revalidatePath(`/decks/${card.deckId}`);
  revalidatePath(`/decks/${card.deckId}/study`);
  revalidatePath("/dashboard");
  return {
    success: true,
    learned: card.learned,
    intervalDays: card.intervalDays,
    nextReviewAt: card.nextReviewAt?.toISOString() ?? null,
  };
}

type SetCardLearnedInput = z.infer<typeof setCardLearnedSchema>;
type ResetProgressInput = z.infer<typeof resetProgressSchema>;

export async function setCardLearned(
  input: SetCardLearnedInput,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = setCardLearnedSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const card = await setCardLearnedQuery({ userId, ...parsed.data });
  if (!card) return { success: false, error: "Card not found" };

  revalidatePath(`/decks/${card.deckId}`);
  return { success: true };
}

export async function resetProgress(
  input: ResetProgressInput,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = resetProgressSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  await resetDeckProgressQuery({ userId, ...parsed.data });

  revalidatePath(`/decks/${parsed.data.deckId}`);
  return { success: true };
}

const createCertificateLinkSchema = z.object({
  deckId: z.number().int().positive(),
  // The learner's IANA time zone (e.g. "Europe/Berlin"), so the completion
  // date on the certificate matches their local calendar day.
  timeZone: z.string().refine((timeZone) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone });
      return true;
    } catch {
      return false;
    }
  }),
});

type CreateCertificateLinkInput = z.infer<typeof createCertificateLinkSchema>;

export type CertificateLinkResult =
  | { success: true; path: string; certificate: CertificateData }
  | { success: false; error: string };

/**
 * Creates the signed, public link to the learner's certificate. Only works
 * when the deck is owned by the user and every card in it is learned.
 */
export async function createCertificateLink(
  input: CreateCertificateLinkInput,
): Promise<CertificateLinkResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = createCertificateLinkSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };
  const { deckId, timeZone } = parsed.data;

  // Missing and not-owned decks are treated identically.
  const deck = await getDeckById({ userId, deckId });
  if (!deck) return { success: false, error: "Deck not found" };

  const cards = await getCardsForDeck({ userId, deckId });
  if (cards.length === 0 || cards.some((card) => !card.learned)) {
    return { success: false, error: "Learn every card to earn a certificate" };
  }

  // The deck was completed when its last card was marked as learned.
  const completedAt = new Date(
    Math.max(...cards.map((card) => card.updatedAt.getTime())),
  );
  const completedOn = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone,
  }).format(completedAt);

  const user = await currentUser();
  const certificate: CertificateData = {
    learnerName:
      user?.fullName ??
      user?.firstName ??
      user?.username ??
      "A FlashyCardy learner",
    deckName: deck.name,
    cardCount: cards.length,
    scorePercent: Math.round(
      (cards.filter((card) => card.learned).length / cards.length) * 100,
    ),
    passMarkPercent: Math.round(MATCH_THRESHOLD * 100),
    completedOn,
  };

  return {
    success: true,
    path: `/certificate/${createCertificateToken(certificate)}`,
    certificate,
  };
}
