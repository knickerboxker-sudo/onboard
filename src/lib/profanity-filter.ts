/**
 * Profanity and prohibited content filter.
 *
 * Blocks searches that contain profanity, slurs, or references to
 * illegal / harmful content.  The word list is intentionally kept
 * broad to match the project requirement of completely blocking any
 * inappropriate or illegal search query.
 *
 * Implementation notes:
 * - All checks are performed against the lower-cased query.
 * - Word-boundary markers (\b) are used to reduce false positives
 *   (e.g. "assassination" should still be blocked, but "bass" should not).
 * - This module does NOT depend on any external API or LLM.
 */

// --- Profanity / vulgar terms ---------------------------------------------------
const PROFANITY_WORDS: string[] = [
  "fuck",
  "fucking",
  "fucker",
  "motherfucker",
  "shit",
  "shitty",
  "bullshit",
  "ass",
  "asshole",
  "bitch",
  "bastard",
  "damn",
  "dammit",
  "dick",
  "cock",
  "cunt",
  "piss",
  "whore",
  "slut",
  "twat",
  "wanker",
  "prick",
  "douche",
  "douchebag",
  "jackass",
  "dipshit",
  "tit",
  "tits",
  "boob",
  "crap",
  "arse",
  "arsehole",
  "bollocks",
  "bugger",
  "bloody",
  "sodoff",
];

// --- Slurs & hate speech --------------------------------------------------------
const SLUR_WORDS: string[] = [
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "dyke",
  "tranny",
  "retard",
  "retarded",
  "spic",
  "wetback",
  "kike",
  "chink",
  "gook",
  "towelhead",
  "raghead",
  "coon",
  "beaner",
  "cracker",
  "honky",
  "gringo",
  "jap",
  "zipperhead",
];

// --- Illegal / harmful content phrases ------------------------------------------
const ILLEGAL_PHRASES: RegExp[] = [
  /\b(?:child\s*porn(?:ography)?)\b/i,
  /\b(?:sex(?:ual)?\s*(?:assault|trafficking|abuse))\b/i,
  /\b(?:hate\s*speech)\b/i,
  /\b(?:racial\s*slur)\b/i,
  /\b(?:how\s+to\s+(?:make|build|create)\s+(?:a\s+)?bomb)\b/i,
  /\b(?:how\s+to\s+(?:kill|murder|poison)\s+(?:someone|a\s+person|people))\b/i,
  /\b(?:buy\s+(?:drugs|cocaine|heroin|meth|fentanyl))\b/i,
  /\b(?:hire\s+(?:a\s+)?(?:hitman|assassin))\b/i,
  /\b(?:human\s*trafficking)\b/i,
  /\b(?:terrorism|terrorist\s*attack)\b/i,
  /\b(?:school\s*shoot(?:ing|er))\b/i,
  /\b(?:mass\s*shoot(?:ing|er))\b/i,
];

// Pre-compile a single regex from the word lists for performance.
// Each word is wrapped in \b…\b to match only whole words.
const buildWordBoundaryPattern = (words: string[]): RegExp => {
  const escaped = words.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  return new RegExp(`\\b(?:${escaped.join("|")})\\b`, "i");
};

const profanityRegex = buildWordBoundaryPattern(PROFANITY_WORDS);
const slurRegex = buildWordBoundaryPattern(SLUR_WORDS);

/**
 * Returns `true` when the supplied query contains profanity, slurs,
 * hate speech, or references to illegal / harmful activities.
 */
export function containsProhibitedContent(query: string): boolean {
  if (!query) return false;

  // Check profanity
  if (profanityRegex.test(query)) return true;

  // Check slurs
  if (slurRegex.test(query)) return true;

  // Check illegal phrases
  if (ILLEGAL_PHRASES.some((pattern) => pattern.test(query))) return true;

  return false;
}
