/** Minimum similarity (0-1) for a typed answer to count as correct. */
export const MATCH_THRESHOLD = 0.4;

// Common filler words that don't count as a meaningful part of an answer.
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "was",
  "with",
]);

// Case-, whitespace- and edge-insensitive normalization.
function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

// Lowercase words without accents or punctuation ("München" -> "munchen").
function tokenize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// Classic Levenshtein edit distance (insertions, deletions, substitutions).
function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/** Similarity between two strings from 0 (nothing alike) to 1 (identical). */
export function similarity(a: string, b: string) {
  const left = normalize(a);
  const right = normalize(b);
  const longest = Math.max(left.length, right.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(left, right) / longest;
}

/**
 * True when the answer is contained in the expected text: every meaningful
 * word typed (ignoring filler words, accents and punctuation) appears in the
 * expected answer. Lets a short answer pass against a long explanation.
 */
export function isContainedAnswer(answer: string, expected: string) {
  const significant = tokenize(answer).filter((word) => !STOP_WORDS.has(word));
  if (significant.length === 0) return false;
  const expectedWords = new Set(tokenize(expected));
  return significant.every((word) => expectedWords.has(word));
}

/**
 * True when the answer is at least 40% similar to the expected text, or when
 * the words typed are all contained in the expected text.
 */
export function isAnswerCorrect(answer: string, expected: string) {
  return (
    similarity(answer, expected) >= MATCH_THRESHOLD ||
    isContainedAnswer(answer, expected)
  );
}
