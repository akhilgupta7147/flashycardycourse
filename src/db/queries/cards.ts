import { and, asc, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { cardsTable, decksTable, type Card } from "@/db/schema";

/**
 * IDs of the decks owned by the given user. Used as a subquery so ownership of
 * a card (via its parent deck) is enforced inside the same `where` as the write.
 */
function ownedDeckIds(userId: string) {
  return db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
}

/**
 * Returns all cards of a deck, oldest first, only if the deck is owned by the
 * given Clerk user (ownership is enforced via a join on the parent deck).
 * `userId` must come from `auth()`, never from client input.
 */
export async function getCardsForDeck(params: {
  userId: string;
  deckId: number;
}): Promise<Card[]> {
  const { userId, deckId } = params;
  const rows = await db
    .select({ card: cardsTable })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.deckId, deckId), eq(decksTable.userId, userId)))
    .orderBy(asc(cardsTable.id));
  return rows.map((row) => row.card);
}

/**
 * Creates a card in a deck, only if the deck is owned by the given Clerk user.
 * Returns the new card, or `undefined` when the deck is missing or not owned.
 */
export async function createCard(params: {
  userId: string;
  deckId: number;
  front: string;
  back: string;
}): Promise<Card | undefined> {
  const { userId, deckId, front, back } = params;

  const [deck] = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1);
  if (!deck) return undefined;

  const [card] = await db
    .insert(cardsTable)
    .values({ deckId: deck.id, front, back })
    .returning();
  return card;
}

/**
 * Returns how many cards a deck has, only if the deck is owned by the given
 * Clerk user (cards are counted through their parent deck).
 */
export async function countCardsForDeck(params: {
  userId: string;
  deckId: number;
}): Promise<number> {
  const { userId, deckId } = params;
  const [row] = await db
    .select({ value: count() })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.deckId, deckId), eq(decksTable.userId, userId)));
  return row?.value ?? 0;
}

/**
 * Replaces ALL cards of a deck with a freshly generated set, only if the deck
 * is owned by the given Clerk user. Existing cards are deleted, the new cards
 * are inserted, and the deck records the title/description they were generated
 * from, all in one atomic batch. Returns the new cards, or `undefined` when
 * the deck is missing or not owned.
 */
export async function replaceDeckCards(params: {
  userId: string;
  deckId: number;
  /** Title/description the cards were generated from. */
  name: string;
  description: string;
  cards: { front: string; back: string }[];
}): Promise<Card[] | undefined> {
  const { userId, deckId, name, description, cards } = params;

  const [deck] = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1);
  if (!deck) return undefined;

  const [, , inserted] = await db.batch([
    db
      .update(decksTable)
      .set({ aiGeneratedName: name, aiGeneratedDescription: description })
      .where(and(eq(decksTable.id, deck.id), eq(decksTable.userId, userId))),
    db
      .delete(cardsTable)
      .where(
        and(
          eq(cardsTable.deckId, deck.id),
          inArray(cardsTable.deckId, ownedDeckIds(userId)),
        ),
      ),
    db
      .insert(cardsTable)
      .values(cards.map(({ front, back }) => ({ deckId: deck.id, front, back })))
      .returning(),
  ]);
  return inserted;
}

/**
 * Updates the front/back of a card, only if its parent deck is owned by the
 * given Clerk user. Editing the content resets the card's learned state.
 * Returns the updated card, or `undefined` when missing or not owned.
 */
export async function updateCard(params: {
  userId: string;
  deckId: number;
  cardId: number;
  front: string;
  back: string;
}): Promise<Card | undefined> {
  const { userId, deckId, cardId, front, back } = params;
  const [card] = await db
    .update(cardsTable)
    .set({ front, back, learned: false })
    .where(
      and(
        eq(cardsTable.id, cardId),
        eq(cardsTable.deckId, deckId),
        inArray(cardsTable.deckId, ownedDeckIds(userId)),
      ),
    )
    .returning();
  return card;
}

/**
 * Deletes a card, only if its parent deck is owned by the given Clerk user
 * (ownership is part of the same `where`). Returns the deleted card, or
 * `undefined` when missing or not owned.
 */
export async function deleteCard(params: {
  userId: string;
  deckId: number;
  cardId: number;
}): Promise<Card | undefined> {
  const { userId, deckId, cardId } = params;
  const [card] = await db
    .delete(cardsTable)
    .where(
      and(
        eq(cardsTable.id, cardId),
        eq(cardsTable.deckId, deckId),
        inArray(cardsTable.deckId, ownedDeckIds(userId)),
      ),
    )
    .returning();
  return card;
}

/**
 * Marks a single card as learned / not learned, only if its parent deck is
 * owned by the given Clerk user. Returns the updated card, or `undefined`.
 */
export async function setCardLearned(params: {
  userId: string;
  deckId: number;
  cardId: number;
  learned: boolean;
}): Promise<Card | undefined> {
  const { userId, deckId, cardId, learned } = params;
  const [card] = await db
    .update(cardsTable)
    .set({ learned })
    .where(
      and(
        eq(cardsTable.id, cardId),
        eq(cardsTable.deckId, deckId),
        inArray(cardsTable.deckId, ownedDeckIds(userId)),
      ),
    )
    .returning();
  return card;
}

/**
 * Resets study progress for every card in a deck, only if the deck is owned by
 * the given Clerk user.
 */
export async function resetDeckProgress(params: {
  userId: string;
  deckId: number;
}): Promise<void> {
  const { userId, deckId } = params;
  await db
    .update(cardsTable)
    .set({ learned: false })
    .where(
      and(
        eq(cardsTable.deckId, deckId),
        inArray(cardsTable.deckId, ownedDeckIds(userId)),
      ),
    );
}
