import type { RankTier } from '@/models/RankedProfile';

// ──────────────────────────────────────────
// ELO CALCULATION (K=24)
// ──────────────────────────────────────────
const K = 24;

export function calculateElo(
  myRating: number,
  oppRating: number,
  won: boolean
): { newRating: number; delta: number } {
  const expected = 1 / (1 + Math.pow(10, (oppRating - myRating) / 400));
  const actual = won ? 1 : 0;
  const delta = Math.round(K * (actual - expected));
  const newRating = Math.max(0, myRating + delta);
  return { newRating, delta };
}

// ──────────────────────────────────────────
// TIER MAPPING
// ──────────────────────────────────────────
interface TierConfig {
  tier: RankTier;
  minRating: number;
  maxRating: number;
  difficulty: number;
  style: string;
  noiseLevel: string;
  redHerring: string;
}

const TIER_MAP: TierConfig[] = [
  { tier: 'Bronze',  minRating: 0,    maxRating: 1199, difficulty: 2, style: 'vignette', noiseLevel: 'low',       redHerring: 'none' },
  { tier: 'Silver',  minRating: 1200, maxRating: 1499, difficulty: 3, style: 'vignette', noiseLevel: 'realistic', redHerring: 'mild' },
  { tier: 'Gold',    minRating: 1500, maxRating: 1799, difficulty: 4, style: 'vignette', noiseLevel: 'realistic', redHerring: 'mild' },
  { tier: 'Diamond', minRating: 1800, maxRating: 2099, difficulty: 5, style: 'apk',      noiseLevel: 'high',      redHerring: 'significant' },
  { tier: 'Master',  minRating: 2100, maxRating: 9999, difficulty: 5, style: 'apk',      noiseLevel: 'high',      redHerring: 'significant' },
];

export function getTier(rating: number): RankTier {
  for (const t of TIER_MAP) {
    if (rating >= t.minRating && rating <= t.maxRating) return t.tier;
  }
  return 'Bronze';
}

export function getTierConfig(rating: number): TierConfig {
  for (const t of TIER_MAP) {
    if (rating >= t.minRating && rating <= t.maxRating) return t;
  }
  return TIER_MAP[0];
}

/**
 * Get generation params for a ranked match based on average rating of both players.
 * If rating gap > 250, bias difficulty +1 toward higher-rated player.
 */
export function getMatchParams(
  ratingA: number,
  ratingB: number
): {
  difficulty: number;
  style: string;
  noiseLevel: string;
  redHerring: string;
  timeline: string;
} {
  const avgRating = Math.round((ratingA + ratingB) / 2);
  const gap = Math.abs(ratingA - ratingB);
  const config = getTierConfig(avgRating);

  let difficulty = config.difficulty;

  // Bias toward higher-rated player if gap > 250
  if (gap > 250) {
    difficulty = Math.min(5, difficulty + 1);
  }

  return {
    difficulty,
    style: config.style,
    noiseLevel: config.noiseLevel,
    redHerring: config.redHerring,
    timeline: 'acute', // default for ranked
  };
}

// ──────────────────────────────────────────
// ANONYMOUS ALIAS GENERATOR
// ──────────────────────────────────────────
const ADJECTIVES = [
  'Swift', 'Keen', 'Calm', 'Bold', 'Sharp', 'Wise', 'Brave', 'Steady',
  'Quick', 'Sage', 'Precise', 'Astute', 'Focused', 'Agile', 'Diligent',
  'Resolute', 'Daring', 'Vigilant', 'Clever', 'Adept',
];

const NOUNS = [
  'Surgeon', 'Clinician', 'Healer', 'Medic', 'Physician', 'Scholar',
  'Diagnostician', 'Pathologist', 'Resident', 'Fellow', 'Intern',
  'Specialist', 'Practitioner', 'Scalpel', 'Stethoscope', 'Caduceus',
];

export function generateAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 999) + 1;
  return `${adj}${noun}${num}`;
}
