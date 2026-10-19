import { and, asc, count, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { cardsTable, decksTable, type Deck } from "@/db/schema";

/**
 * Returns all decks owned by the given Clerk user, oldest first.
 * `userId` must come from `auth()`, never from client input.
 */
export async function getDecksForUser(userId: string): Promise<Deck[]> {
  return db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(asc(decksTable.id));
}

/**
 * Returns how many decks are owned by the given Clerk user.
 * `userId` must come from `auth()`, never from client input.
 */
export async function countDecksForUser(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
  return row?.value ?? 0;
}

export type DeckWithProgress = Deck & {
  totalCards: number;
  learnedCards: number;
};

/**
 * Returns all decks owned by the given Clerk user (oldest first) together
 * with their card counts: total cards and cards marked as learned.
 * Cards are only counted through their parent deck, which is filtered by `userId`.
 * `userId` must come from `auth()`, never from client input.
 */
export async function getDecksWithProgressForUser(
  userId: string,
): Promise<DeckWithProgress[]> {
  return db
    .select({
      ...getTableColumns(decksTable),
      totalCards: count(cardsTable.id),
      learnedCards: sql<number>`count(${cardsTable.id}) filter (where ${cardsTable.learned})`.mapWith(
        Number,
      ),
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id)
    .orderBy(asc(decksTable.id));
}

/**
 * Returns a single deck only if it is owned by the given Clerk user,
 * otherwise `undefined` (same result for "missing" and "not yours").
 * `userId` must come from `auth()`, never from client input.
 */
export async function getDeckById(params: {
  userId: string;
  deckId: number;
}): Promise<Deck | undefined> {
  const { userId, deckId } = params;
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1);
  return deck;
}

/**
 * Creates a deck owned by the given Clerk user.
 * `userId` must come from `auth()`, never from client input.
 */
export async function createDeck(params: {
  userId: string;
  name: string;
  description: string | null;
}): Promise<Deck> {
  const { userId, name, description } = params;
  const [deck] = await db
    .insert(decksTable)
    .values({ userId, name, description })
    .returning();
  return deck;
}

/**
 * Updates a deck's title and description only if it is owned by the given
 * Clerk user (ownership is part of the same `where`). Returns the updated
 * deck, or `undefined` when the deck is missing or not owned by the user.
 * `userId` must come from `auth()`, never from client input.
 */
export async function updateDeck(params: {
  userId: string;
  deckId: number;
  name: string;
  description: string | null;
}): Promise<Deck | undefined> {
  const { userId, deckId, name, description } = params;
  const [deck] = await db
    .update(decksTable)
    .set({ name, description })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning();
  return deck;
}

/**
 * Deletes a deck only if it is owned by the given Clerk user (ownership is
 * part of the same `where`). Its cards are removed by the `ON DELETE CASCADE`
 * foreign key on `cards.deck_id`. Returns the deleted deck, or `undefined`
 * when the deck is missing or not owned by the user.
 * `userId` must come from `auth()`, never from client input.
 */
export async function deleteDeck(params: {
  userId: string;
  deckId: number;
}): Promise<Deck | undefined> {
  const { userId, deckId } = params;
  const [deck] = await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning();
  return deck;
}
