import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

/**
 * A deck is a collection of flashcards owned by a single user
 * (e.g. "English → German" or "British History").
 */
export const decksTable = pgTable(
  "decks",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    // Clerk user ID (e.g. "user_2abc..."). Users live in Clerk, so there is no users table.
    userId: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    // Snapshot of the title/description the AI cards were last generated from.
    // AI generation is only available when the current values differ from it
    // (or when it is null, i.e. nothing was generated yet).
    aiGeneratedName: varchar({ length: 255 }),
    aiGeneratedDescription: text(),
    ...timestamps,
  },
  (table) => [index("decks_user_id_idx").on(table.userId)],
);

/**
 * A card belongs to one deck. `front` is the prompt (e.g. "Dog" or
 * "When was the battle of Hastings?") and `back` is the answer
 * (e.g. "Hund" or "1066").
 */
export const cardsTable = pgTable(
  "cards",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    deckId: integer()
      .notNull()
      .references(() => decksTable.id, { onDelete: "cascade" }),
    front: text().notNull(),
    back: text().notNull(),
    // Study progress: true once the user has marked the card as learned.
    learned: boolean().notNull().default(false),
    ...timestamps,
  },
  (table) => [index("cards_deck_id_idx").on(table.deckId)],
);

export type Deck = typeof decksTable.$inferSelect;
export type NewDeck = typeof decksTable.$inferInsert;
export type Card = typeof cardsTable.$inferSelect;
export type NewCard = typeof cardsTable.$inferInsert;
