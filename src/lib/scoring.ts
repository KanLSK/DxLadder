import type { IGameMatch, IBreakdownLine, IKeyEvent } from '@/models/GameMatch';

// ──────────────────────────────────────────
// DUEL MODE SCORING (ranked + friend)
// ──────────────────────────────────────────
export function calculateDuelScore(opts: {
  solved: boolean;
  solveTimeMs: number;
  layersUsed: number;
  wrongGuesses: number;
  difficulty: number;
  isRanked: boolean;
}): { score: number; lines: IBreakdownLine[] } {
  const lines: IBreakdownLine[] = [];

  const baseScore = opts.solved ? 120 : 0;
  lines.push({ label: opts.solved ? 'Solved' : 'Not solved', value: baseScore });

  // Time bonus
  const seconds = Math.floor(opts.solveTimeMs / 1000);
  let timeBonus = 0;
  if (opts.solved) {
    if (opts.isRanked) {
      timeBonus = Math.max(0, 90 - seconds); // 1 point per second under 90s
    } else {
      timeBonus = Math.max(0, Math.round((120 - seconds) * 0.7)); // slower decay for friends
    }
  }
  if (timeBonus > 0) {
    lines.push({ label: `Time bonus (${seconds}s)`, value: timeBonus });
  }

  // Layers penalty
  const layersPenalty = (opts.layersUsed - 1) * 6;
  if (layersPenalty > 0) {
    lines.push({ label: `Layers penalty (${opts.layersUsed} used)`, value: -layersPenalty });
  }

  // Wrong guesses penalty
  const guessPenalty = opts.wrongGuesses * 8;
  if (guessPenalty > 0) {
    lines.push({ label: `Wrong guesses (${opts.wrongGuesses})`, value: -guessPenalty });
  }

  // Difficulty bonus
  const diffBonus = opts.difficulty * 10;
  lines.push({ label: `Difficulty bonus (${opts.difficulty}/5)`, value: diffBonus });

  const score = Math.max(0, baseScore + timeBonus - layersPenalty - guessPenalty + diffBonus);
  lines.push({ label: 'Final', value: score });

  return { score, lines };
}

// ──────────────────────────────────────────
// ECONOMY MODE SCORING (friend only)
// ──────────────────────────────────────────
export function calculateEconomyScore(opts: {
  solved: boolean;
  layersUsed: number;
  wrongGuesses: number;
  creditsRemaining?: number;
}): { score: number; lines: IBreakdownLine[] } {
  const lines: IBreakdownLine[] = [];

  const credits = opts.creditsRemaining ?? 100;
  lines.push({ label: 'Credits remaining', value: credits });

  const solveBonus = opts.solved ? 50 : 0;
  if (solveBonus > 0) lines.push({ label: 'Solve bonus', value: solveBonus });

  const layerBonus = (5 - opts.layersUsed) * 10;
  if (layerBonus !== 0) lines.push({ label: `Layer efficiency`, value: layerBonus });

  const guessPenalty = opts.wrongGuesses * 10;
  if (guessPenalty > 0) lines.push({ label: `Wrong guesses`, value: -guessPenalty });

  const score = Math.max(0, credits + solveBonus + layerBonus - guessPenalty);
  lines.push({ label: 'Final', value: score });

  return { score, lines };
}

// ──────────────────────────────────────────
// CHAOS MODE (same as duel but sabotage allowed)
// ──────────────────────────────────────────
export const calculateChaosScore = calculateDuelScore;

// ──────────────────────────────────────────
// COMPUTE FULL BREAKDOWN
// ──────────────────────────────────────────
export function computePlayerScore(
  mode: 'duel' | 'economy' | 'chaos',
  opts: {
    solved: boolean;
    solveTimeMs: number;
    layersUsed: number;
    wrongGuesses: number;
    difficulty: number;
    isRanked: boolean;
  }
): { score: number; lines: IBreakdownLine[] } {
  switch (mode) {
    case 'economy':
      return calculateEconomyScore(opts);
    case 'chaos':
    case 'duel':
    default:
      return calculateDuelScore(opts);
  }
}

/**
 * Build key events timeline for a match.
 */
export function buildKeyEvents(match: any): IKeyEvent[] {
  const events: IKeyEvent[] = [];

  if (match.startedAt) {
    events.push({ ts: match.startedAt, type: 'match_start', desc: 'Match started' });
  }

  for (const player of match.players) {
    if (player.solvedAt) {
      const solveTime = match.startedAt
        ? Math.round((new Date(player.solvedAt).getTime() - new Date(match.startedAt).getTime()) / 1000)
        : 0;
      events.push({
        ts: player.solvedAt,
        type: 'player_solved',
        desc: `${player.name} solved at ${formatTime(solveTime)}`,
        userId: player.userId,
      });
    }

    if (player.wrongGuesses > 0) {
      events.push({
        ts: player.lastGuessAt || match.startedAt,
        type: 'wrong_guesses',
        desc: `${player.name} had ${player.wrongGuesses} wrong guess${player.wrongGuesses !== 1 ? 'es' : ''}`,
        userId: player.userId,
      });
    }
  }

  for (const sab of (match.sabotageEvents || [])) {
    events.push({
      ts: sab.firedAt,
      type: 'sabotage',
      desc: `${sab.type} used`,
      userId: sab.fromUserId,
    });
  }

  if (match.endedAt) {
    events.push({ ts: match.endedAt, type: 'match_end', desc: 'Match ended' });
  }

  return events.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
