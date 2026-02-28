import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameMatch from '@/models/GameMatch';
import MatchCase from '@/models/MatchCase';
import RankedProfile from '@/models/RankedProfile';
import { auth } from '@/lib/auth';
import { isCorrectGuess } from '@/lib/answerMatch';
import { computePlayerScore, buildKeyEvents } from '@/lib/scoring';
import { calculateElo, getTier } from '@/lib/elo';
import { getPusherServer, channels, events } from '@/lib/pusher';
import mongoose from 'mongoose';

// ── Anti-cheat: in-memory rate limiter ──
const guessTimestamps = new Map<string, number>();
const GUESS_COOLDOWN_MS = 2000;   // 1 guess per 2s
const WRONG_LOCKOUT_MS = 5000;    // 5s lockout after wrong guess (ranked)
const MAX_LAYERS = 7;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    await dbConnect();
    const session = await auth();
    const body = await request.json();
    const { matchId } = await params;
    const { guess, sessionToken } = body;

    const userId = session?.user?.id;
    if (!userId || !guess) {
      return NextResponse.json({ ok: false, error: 'Missing guess or identity' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return NextResponse.json({ ok: false, error: 'Invalid match ID' }, { status: 400 });
    }

    // ── Rate limit check ──
    const rateKey = `${matchId}:${userId}`;
    const lastGuessTime = guessTimestamps.get(rateKey) || 0;
    const now = Date.now();
    if (now - lastGuessTime < GUESS_COOLDOWN_MS) {
      return NextResponse.json(
        { ok: false, error: 'Too fast! Wait 2 seconds between guesses.' },
        { status: 429 }
      );
    }
    guessTimestamps.set(rateKey, now);

    const match = await GameMatch.findById(matchId);
    if (!match || match.status !== 'active') {
      return NextResponse.json({ ok: false, error: 'Match not active' }, { status: 400 });
    }

    // ── Session token validation (single tab) ──
    const playerIdx = match.players.findIndex(p => p.userId === userId);
    if (playerIdx < 0) {
      return NextResponse.json({ ok: false, error: 'Not in this match' }, { status: 403 });
    }
    const player = match.players[playerIdx];

    if (sessionToken && player.sessionToken !== sessionToken) {
      return NextResponse.json({ ok: false, error: 'Session invalid — opened in another tab?' }, { status: 403 });
    }
    if (player.finished) {
      return NextResponse.json({ ok: false, error: 'Already finished' }, { status: 400 });
    }

    // ── Wrong guess lockout (ranked) ──
    if (match.type === 'ranked' && player.lastGuessAt) {
      const timeSinceLastGuess = now - new Date(player.lastGuessAt).getTime();
      if (player.wrongGuesses > 0 && timeSinceLastGuess < WRONG_LOCKOUT_MS) {
        return NextResponse.json(
          { ok: false, error: 'Wrong guess lockout — wait 5 seconds' },
          { status: 429 }
        );
      }
    }

    // ── Answer check ──
    const matchCase = await MatchCase.findById(match.matchCaseId)
      .select('contentPrivate')
      .lean();
    if (!matchCase) {
      return NextResponse.json({ ok: false, error: 'Case not found' }, { status: 404 });
    }

    const priv = matchCase.contentPrivate;
    const result = isCorrectGuess(guess, priv.diagnosis, priv.aliases, priv.acceptRules);
    const isCorrect = result.ok;

    player.guesses.push(guess);
    player.lastGuessAt = new Date();

    const pusher = getPusherServer();
    const matchChannel = channels.match(matchId);

    if (isCorrect) {
      player.finished = true;
      player.solvedAt = new Date();

      // Compute score
      const solveTimeMs = match.startedAt
        ? Date.now() - new Date(match.startedAt).getTime()
        : 0;
      const { score, lines } = computePlayerScore(match.mode, {
        solved: true,
        solveTimeMs,
        layersUsed: player.layersUsed,
        wrongGuesses: player.wrongGuesses,
        difficulty: match.assignedParams.difficulty,
        isRanked: match.type === 'ranked',
      });
      player.score = score;

      // Store breakdown
      if (!match.breakdown.scoringLines) match.breakdown.scoringLines = {};
      (match.breakdown.scoringLines as any)[userId] = lines;

      // Broadcast solve (no guess text!)
      await pusher.trigger(matchChannel, events.PLAYER_SOLVED, {
        userId,
        name: player.name,
        score,
        layersUsed: player.layersUsed,
      });
    } else {
      player.wrongGuesses += 1;

      if (player.layersUsed < MAX_LAYERS) {
        player.layersUsed += 1;
      } else {
        // All layers exhausted
        player.finished = true;
        const solveTimeMs = match.startedAt
          ? Date.now() - new Date(match.startedAt).getTime()
          : 0;
        const { score, lines } = computePlayerScore(match.mode, {
          solved: false,
          solveTimeMs,
          layersUsed: player.layersUsed,
          wrongGuesses: player.wrongGuesses,
          difficulty: match.assignedParams.difficulty,
          isRanked: match.type === 'ranked',
        });
        player.score = score;
        if (!match.breakdown.scoringLines) match.breakdown.scoringLines = {};
        (match.breakdown.scoringLines as any)[userId] = lines;
      }
    }

    // Broadcast progress
    await pusher.trigger(matchChannel, events.PLAYER_PROGRESS, {
      userId,
      layersUsed: player.layersUsed,
      wrongGuesses: player.wrongGuesses,
      finished: player.finished,
      score: player.score,
    });

    // Increment event sequence
    match.eventSeq += 1;

    // ── Check if match should end ──
    const allFinished = match.players.every(p => p.finished);
    // In duel/ranked: first solve wins, but match continues for scoreboard
    // Match ends when all finished
    if (allFinished) {
      match.status = 'resolution';
      match.endedAt = new Date();

      // Build key events
      match.breakdown.keyEvents = buildKeyEvents(match) as any;

      // ── ELO calculation for ranked 1v1 ──
      if (match.type === 'ranked' && match.players.length === 2) {
        const p1 = match.players[0];
        const p2 = match.players[1];

        const prof1 = await RankedProfile.findOne({ userId: p1.userId });
        const prof2 = await RankedProfile.findOne({ userId: p2.userId });

        if (prof1 && prof2) {
          // Determine winner: first to solve wins; if both solved, earlier solvedAt wins
          let p1Won: boolean;
          if (p1.solvedAt && !p2.solvedAt) {
            p1Won = true;
          } else if (!p1.solvedAt && p2.solvedAt) {
            p1Won = false;
          } else if (p1.solvedAt && p2.solvedAt) {
            p1Won = new Date(p1.solvedAt).getTime() <= new Date(p2.solvedAt).getTime();
          } else {
            // Neither solved — higher score wins (or draw)
            p1Won = p1.score > p2.score;
          }

          const elo1 = calculateElo(prof1.rating, prof2.rating, p1Won);
          const elo2 = calculateElo(prof2.rating, prof1.rating, !p1Won);

          match.ratingChanges = [
            { userId: p1.userId, delta: elo1.delta, oldRating: prof1.rating, newRating: elo1.newRating },
            { userId: p2.userId, delta: elo2.delta, oldRating: prof2.rating, newRating: elo2.newRating },
          ];

          // Update profiles
          prof1.rating = elo1.newRating;
          prof1.tier = getTier(elo1.newRating);
          prof1.matchesPlayed += 1;
          if (p1Won) {
            prof1.wins += 1;
            prof1.winStreak += 1;
            prof1.bestStreak = Math.max(prof1.bestStreak, prof1.winStreak);
          } else {
            prof1.losses += 1;
            prof1.winStreak = 0;
          }
          await prof1.save();

          prof2.rating = elo2.newRating;
          prof2.tier = getTier(elo2.newRating);
          prof2.matchesPlayed += 1;
          if (!p1Won) {
            prof2.wins += 1;
            prof2.winStreak += 1;
            prof2.bestStreak = Math.max(prof2.bestStreak, prof2.winStreak);
          } else {
            prof2.losses += 1;
            prof2.winStreak = 0;
          }
          await prof2.save();
        }
      }

      match.status = 'ended';

      // Broadcast match ended
      await pusher.trigger(matchChannel, events.MATCH_ENDED, {
        matchId,
        scoreboard: match.players.map(p => ({
          userId: p.userId,
          name: p.name,
          score: p.score,
          finished: p.finished,
          solvedAt: p.solvedAt,
        })),
        ratingChanges: match.ratingChanges,
      });
    }

    await match.save();

    // Build response
    const response: any = {
      ok: true,
      correct: isCorrect,
      matchMethod: result.method,
      finished: player.finished,
      nextLayerIndex: player.layersUsed - 1,
      score: player.score,
      matchEnded: allFinished,
    };

    if (player.finished) {
      response.reveal = {
        diagnosis: priv.diagnosis,
        rationale: priv.answerCheck?.rationale,
        keyDifferentials: priv.answerCheck?.keyDifferentials,
        teachingPoints: priv.teachingPoints,
      };
      if (allFinished && match.ratingChanges.length > 0) {
        const myChange = match.ratingChanges.find(rc => rc.userId === userId);
        if (myChange) response.ratingChange = myChange;
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Game guess error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
