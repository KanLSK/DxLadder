import { customAlphabet } from 'nanoid';

// 6-character room key — uppercase letters + digits, no ambiguous chars (0/O, 1/I/L)
const ROOM_KEY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const generateId = customAlphabet(ROOM_KEY_ALPHABET, 6);

export function generateRoomKey(): string {
  return generateId();
}

export type ScoringMode = 'race' | 'efficiency' | 'hybrid';

/**
 * Calculate score based on the game mode.
 * Lower is better in all modes.
 */
export function calculateScore(
  mode: ScoringMode,
  opts: {
    layersUsed: number;
    wrongGuesses: number;
    solveTimeMs?: number;
    lockTaxPenalty?: number;
  }
): number {
  const { layersUsed, wrongGuesses, solveTimeMs = 0, lockTaxPenalty = 0 } = opts;

  switch (mode) {
    case 'race':
      // Time-based. Each wrong guess adds 10s penalty. Each extra layer adds 5s.
      return Math.round(solveTimeMs / 1000) + wrongGuesses * 10 + (layersUsed - 1) * 5 + lockTaxPenalty;

    case 'efficiency':
      // Layers + wrong guesses only. Time doesn't matter.
      return layersUsed * 10 + wrongGuesses * 5 + lockTaxPenalty;

    case 'hybrid':
      // Weighted combo.
      const timePenalty = Math.round(solveTimeMs / 1000);
      return layersUsed * 8 + wrongGuesses * 6 + Math.floor(timePenalty / 2) + lockTaxPenalty;
  }
}

export const SABOTAGE_TYPES = ['FogOfWar', 'JammedSubmit', 'SwapFocus', 'LockTax'] as const;
export type SabotageType = typeof SABOTAGE_TYPES[number];

export const SABOTAGE_DURATIONS: Record<SabotageType, number> = {
  FogOfWar: 5000,     // 5 seconds blur
  JammedSubmit: 3000, // 3 seconds disabled
  SwapFocus: 0,       // instant scroll
  LockTax: 0,         // +1 score on next unlock
};

export const MAX_SABOTAGES_PER_PLAYER = 2;
export const MAX_LAYERS = 6;
