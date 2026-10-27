/** Ease factor stored as hundredths. 250 means 2.50, the SM-2 starting value. */
export const DEFAULT_EASE_FACTOR = 250;

export type SrsState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export type SrsUpdate = SrsState & {
  nextReviewAt: Date;
  learned: boolean;
};

/**
 * SuperMemo SM-2. `quality` is 0–5. A score of 3 or more counts as a successful
 * recall and schedules the card further out. A lower score resets the streak
 * and shows the card again the next day.
 */
export function applySm2(state: SrsState, quality: number): SrsUpdate {
  let ease = state.easeFactor / 100;
  let intervalDays = state.intervalDays;
  let repetitions = state.repetitions;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else if (repetitions === 0) {
    intervalDays = 1;
    repetitions = 1;
  } else if (repetitions === 1) {
    intervalDays = 6;
    repetitions = 2;
  } else {
    intervalDays = Math.max(1, Math.round(intervalDays * ease));
    repetitions += 1;
  }

  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  const nextReviewAt = new Date();
  nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + intervalDays);

  return {
    easeFactor: Math.round(ease * 100),
    intervalDays,
    repetitions,
    nextReviewAt,
    learned: quality >= 3,
  };
}
