/**
 * answerMatch.ts
 *
 * Zero-cost, deterministic diagnosis matching pipeline.
 * No AI calls. Runs entirely in-memory on the server.
 */

import { distance } from 'fastest-levenshtein';
import {
  abbreviationMap,
  synonymGroups,
  stopWords,
  ambiguousAbbrevs,
} from './diagnosisSynonyms';

// ─── Types ──────────────────────────────────────────────────────────

export interface AcceptRules {
  requiredTokens?: string[];
  bannedTokens?: string[];
  allowAmbiguousAbbrev?: string[];
  customSynonyms?: Record<string, string[]>;
}

export interface MatchResult {
  ok: boolean;
  method: 'exact' | 'alias' | 'synonym' | 'fuzzy' | 'token' | 'none';
  score?: number;
  matched?: string;
}

// ─── Normalization ──────────────────────────────────────────────────

/**
 * Normalize a diagnosis string for comparison.
 * 1. lowercase + trim
 * 2. remove punctuation (keep alphanumeric + spaces)
 * 3. normalize hyphens/slashes to spaces
 * 4. collapse whitespace
 * 5. remove stop words
 * 6. expand abbreviations token-by-token
 */
export function normalizeDx(input: string): string {
  if (!input) return '';

  let s = input.toLowerCase().trim();

  // Handle dotted abbreviations: T.B. → tb, M.I. → mi
  // Pattern: single letter followed by dot, repeated
  s = s.replace(/\b([a-z])\.([a-z])\.?/g, '$1$2');

  // Replace hyphens, slashes, remaining dots with spaces
  s = s.replace(/[-/\\.]/g, ' ');

  // Remove all punctuation except alphanumeric and spaces
  s = s.replace(/[^a-z0-9\s]/g, '');

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();

  // Tokenize, remove stop words, expand abbreviations
  const tokens = s.split(' ').filter(Boolean);
  const processed = tokens
    .filter((t) => !stopWords.has(t))
    .map((t) => abbreviationMap[t] || t);

  return processed.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Tokenize a normalized string into an array of unique tokens.
 * Optionally singularizes simple English plurals.
 */
export function tokenize(s: string): string[] {
  const tokens = s
    .split(' ')
    .filter(Boolean)
    .map((t) => {
      // Simple singular: remove trailing 's' if the word is > 3 chars
      if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) {
        return t.slice(0, -1);
      }
      return t;
    });

  return [...new Set(tokens)];
}

// ─── Similarity helpers ─────────────────────────────────────────────

/**
 * Compute fuzzy similarity ratio (0–100) using Levenshtein distance.
 */
function fuzzyRatio(a: string, b: string): number {
  if (a === b) return 100;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  const dist = distance(a, b);
  return Math.round(((maxLen - dist) / maxLen) * 100);
}

/**
 * Compute Jaccard similarity between two token sets (0–1).
 */
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

// ─── Pre-built synonym lookup ───────────────────────────────────────
// Build once at module load time. Maps every normalized variant to its group index.

const synonymLookup = new Map<string, number>();

for (let i = 0; i < synonymGroups.length; i++) {
  const group = synonymGroups[i];
  const normCanonical = normalizeDx(group.canonical);
  synonymLookup.set(normCanonical, i);
  for (const v of group.variants) {
    synonymLookup.set(normalizeDx(v), i);
  }
}

// ─── Main matching function ─────────────────────────────────────────

/**
 * Determine if a user's guess matches the correct diagnosis.
 *
 * Pipeline order (short-circuits on first match):
 * 1. Exact match after normalization
 * 2. Alias match (normalized aliases)
 * 3. Synonym group match
 * 4. Token overlap (Jaccard >= 0.85) with requiredTokens enforcement
 * 5. Fuzzy string match (Levenshtein ratio thresholds)
 *
 * Guardrails:
 * - Ambiguous abbreviations rejected unless explicitly allowed
 * - Banned tokens cause rejection
 * - Required tokens enforced for token-based matching
 */
export function isCorrectGuess(
  guess: string,
  canonical: string,
  aliases: string[] = [],
  rules?: AcceptRules
): MatchResult {
  const fail: MatchResult = { ok: false, method: 'none' };

  if (!guess || !canonical) return fail;

  const normalizedGuess = normalizeDx(guess);
  const normalizedCanonical = normalizeDx(canonical);

  if (!normalizedGuess || !normalizedCanonical) return fail;

  // ── Guardrail: banned tokens ──
  if (rules?.bannedTokens?.length) {
    const guessTokens = normalizedGuess.split(' ');
    for (const banned of rules.bannedTokens) {
      if (guessTokens.includes(banned.toLowerCase())) {
        return fail;
      }
    }
  }

  // ── Guardrail: ambiguous abbreviation ──
  // If the raw guess (trimmed, lowered) is ONLY an ambiguous abbreviation, reject
  // unless explicitly allowed via rules.
  const rawLower = guess.toLowerCase().trim();
  if (ambiguousAbbrevs.has(rawLower)) {
    const allowed = rules?.allowAmbiguousAbbrev?.map((a) => a.toLowerCase()) || [];
    if (!allowed.includes(rawLower)) {
      return fail;
    }
  }

  // ── Stage 1: Exact match ──
  if (normalizedGuess === normalizedCanonical) {
    return { ok: true, method: 'exact', score: 100, matched: canonical };
  }

  // ── Stage 2: Alias match ──
  for (const alias of aliases) {
    const normalizedAlias = normalizeDx(alias);
    if (normalizedGuess === normalizedAlias) {
      return { ok: true, method: 'alias', score: 100, matched: alias };
    }
  }

  // ── Stage 3: Synonym group match ──
  // Check if both guess and canonical (or any alias) belong to the same synonym group
  const guessGroupIdx = synonymLookup.get(normalizedGuess);
  if (guessGroupIdx !== undefined) {
    // Check canonical
    const canonicalGroupIdx = synonymLookup.get(normalizedCanonical);
    if (canonicalGroupIdx === guessGroupIdx) {
      return {
        ok: true,
        method: 'synonym',
        score: 100,
        matched: synonymGroups[guessGroupIdx].canonical,
      };
    }
    // Check aliases
    for (const alias of aliases) {
      const aliasGroupIdx = synonymLookup.get(normalizeDx(alias));
      if (aliasGroupIdx === guessGroupIdx) {
        return {
          ok: true,
          method: 'synonym',
          score: 100,
          matched: synonymGroups[guessGroupIdx].canonical,
        };
      }
    }
  }

  // Also check if canonical is in a synonym group and guess matches a variant
  const canonicalGroupIdx2 = synonymLookup.get(normalizedCanonical);
  if (canonicalGroupIdx2 !== undefined && guessGroupIdx === undefined) {
    // The canonical is in a group but the guess wasn't found directly.
    // Let's also try custom synonyms from rules
  }

  // ── Custom synonyms from rules ──
  if (rules?.customSynonyms) {
    for (const [key, variants] of Object.entries(rules.customSynonyms)) {
      const normKey = normalizeDx(key);
      const normVariants = variants.map(normalizeDx);
      const allInGroup = [normKey, ...normVariants];

      const guessInGroup = allInGroup.includes(normalizedGuess);
      const canonicalInGroup = allInGroup.includes(normalizedCanonical);
      const aliasInGroup = aliases.some((a) => allInGroup.includes(normalizeDx(a)));

      if (guessInGroup && (canonicalInGroup || aliasInGroup)) {
        return { ok: true, method: 'synonym', score: 100, matched: key };
      }
    }
  }

  // ── Stage 4: Token overlap (Jaccard) ──
  const guessTokens = tokenize(normalizedGuess);
  const canonicalTokens = tokenize(normalizedCanonical);
  const jaccard = jaccardSimilarity(guessTokens, canonicalTokens);

  if (jaccard >= 0.85) {
    // Enforce requiredTokens if specified
    if (rules?.requiredTokens?.length) {
      const hasRequired = rules.requiredTokens.some((rt) =>
        guessTokens.includes(rt.toLowerCase())
      );
      if (!hasRequired) {
        // Don't accept via token match if required tokens are missing
      } else {
        return {
          ok: true,
          method: 'token',
          score: Math.round(jaccard * 100),
          matched: canonical,
        };
      }
    } else {
      return {
        ok: true,
        method: 'token',
        score: Math.round(jaccard * 100),
        matched: canonical,
      };
    }
  }

  // ── Stage 5: Fuzzy string match (Levenshtein) ──
  const threshold = normalizedCanonical.length <= 15 ? 85 : 88;
  const ratio = fuzzyRatio(normalizedGuess, normalizedCanonical);

  if (ratio >= threshold) {
    return {
      ok: true,
      method: 'fuzzy',
      score: ratio,
      matched: canonical,
    };
  }

  // Also check fuzzy against aliases
  for (const alias of aliases) {
    const normalizedAlias = normalizeDx(alias);
    const aliasThreshold = normalizedAlias.length <= 10 ? 95 : 88;
    const aliasRatio = fuzzyRatio(normalizedGuess, normalizedAlias);
    if (aliasRatio >= aliasThreshold) {
      return {
        ok: true,
        method: 'fuzzy',
        score: aliasRatio,
        matched: alias,
      };
    }
  }

  return fail;
}
