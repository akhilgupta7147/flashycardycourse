import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cardsTable, decksTable, studyReviewsTable } from "@/db/schema";

export type StudyStats = {
  streakDays: number;
  reviewedToday: number;
  reviewedTotal: number;
  masteryPercent: number;
  learnedCards: number;
  totalCards: number;
  dueCards: number;
};

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Account-level study stats for one Clerk user: streak, reviews, mastery, and
 * how many cards are due. `userId` must come from `auth()`.
 */
export async function getStudyStatsForUser(userId: string): Promise<StudyStats> {
  const reviews = await db
    .select({ reviewedAt: studyReviewsTable.reviewedAt })
    .from(studyReviewsTable)
    .where(eq(studyReviewsTable.userId, userId));

  const reviewDays = new Set(reviews.map((review) => dayKey(review.reviewedAt)));
  const today = dayKey(new Date());
  const reviewedToday = reviews.filter(
    (review) => dayKey(review.reviewedAt) === today,
  ).length;

  const cursor = new Date();
  if (!reviewDays.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let streakDays = 0;
  while (reviewDays.has(dayKey(cursor))) {
    streakDays += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const [counts] = await db
    .select({
      totalCards: count(cardsTable.id),
      learnedCards: sql<number>`count(${cardsTable.id}) filter (where ${cardsTable.learned})`.mapWith(
        Number,
      ),
      dueCards: sql<number>`count(${cardsTable.id}) filter (where ${cardsTable.nextReviewAt} is null or ${cardsTable.nextReviewAt} <= now())`.mapWith(
        Number,
      ),
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.userId, userId));

  const totalCards = counts?.totalCards ?? 0;
  const learnedCards = counts?.learnedCards ?? 0;

  return {
    streakDays,
    reviewedToday,
    reviewedTotal: reviews.length,
    masteryPercent:
      totalCards === 0 ? 0 : Math.round((learnedCards / totalCards) * 100),
    learnedCards,
    totalCards,
    dueCards: counts?.dueCards ?? 0,
  };
}
