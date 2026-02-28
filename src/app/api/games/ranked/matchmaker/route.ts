import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RankedQueue from '@/models/RankedQueue';
import RankedProfile from '@/models/RankedProfile';
import GameMatch from '@/models/GameMatch';
import MatchCase from '@/models/MatchCase';
import { getMatchParams } from '@/lib/elo';
import { generateCasePayload, runCritic } from '@/lib/aiPipeline';
import { getPusherServer, channels, events } from '@/lib/pusher';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';

/**
 * POST - Run matchmaker (called by cron or client polling)
 * Pairs waiting players within ±150 ELO (widens 50 per 30s wait)
 */
export async function POST() {
  try {
    await dbConnect();

    // Get all waiting players, sorted by joinedAt (oldest first)
    const waitingPlayers = await RankedQueue.find({ status: 'waiting' })
      .sort({ joinedAt: 1 })
      .lean();

    if (waitingPlayers.length < 2) {
      return NextResponse.json({ ok: true, matched: 0 });
    }

    const matched: string[] = [];
    const now = Date.now();

    for (let i = 0; i < waitingPlayers.length; i++) {
      const playerA = waitingPlayers[i];
      if (matched.includes(playerA.userId)) continue;

      // Widen range based on wait time: starts at 150, +50 per 30s
      const waitSeconds = (now - new Date(playerA.joinedAt).getTime()) / 1000;
      const range = 150 + Math.floor(waitSeconds / 30) * 50;

      for (let j = i + 1; j < waitingPlayers.length; j++) {
        const playerB = waitingPlayers[j];
        if (matched.includes(playerB.userId)) continue;

        const ratingDiff = Math.abs(playerA.rating - playerB.rating);
        if (ratingDiff <= range) {
          // Match found!
          await createRankedMatch(playerA, playerB);
          matched.push(playerA.userId, playerB.userId);
          break;
        }
      }
    }

    return NextResponse.json({ ok: true, matched: matched.length / 2 });
  } catch (error: any) {
    console.error('Matchmaker error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

async function createRankedMatch(playerA: any, playerB: any) {
  const pusher = getPusherServer();

  // Get ranked profiles
  const profileA = await RankedProfile.findOne({ userId: playerA.userId });
  const profileB = await RankedProfile.findOne({ userId: playerB.userId });
  if (!profileA || !profileB) return;

  // Compute difficulty from average rating
  const matchParams = getMatchParams(profileA.rating, profileB.rating);

  // Generate case
  const genParams = {
    difficulty: matchParams.difficulty,
    style: matchParams.style,
    noiseLevel: matchParams.noiseLevel,
    redHerring: matchParams.redHerring,
  };

  let finalPayload = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const draft = await generateCasePayload(genParams);
      try {
        const critic = await runCritic(draft);
        if (!critic.passes) continue;
      } catch { /* use draft */ }
      finalPayload = draft;
      break;
    } catch { continue; }
  }

  if (!finalPayload) {
    // Generation failed — put players back to waiting
    return;
  }

  const tokenA = randomBytes(24).toString('hex');
  const tokenB = randomBytes(24).toString('hex');

  // Create match case
  const matchCase = await MatchCase.create({
    matchId: new mongoose.Types.ObjectId(),
    contentPublic: { layers: finalPayload.content.layers as any },
    contentPrivate: {
      diagnosis: finalPayload.content.diagnosis,
      aliases: finalPayload.content.aliases || [],
      teachingPoints: finalPayload.content.teachingPoints || [],
      answerCheck: finalPayload.content.answerCheck || { rationale: '', keyDifferentials: [] },
      mechanismQuestions: finalPayload.content.mechanismQuestions || undefined,
    },
    generationParams: genParams,
    title: finalPayload.title,
    systemTags: finalPayload.systemTags || [],
    difficulty: matchParams.difficulty,
    style: matchParams.style,
    promptMeta: { promptVersion: 'v3.0.0-ranked', criticVersion: 'v1.0.0' },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Create match
  const match = await GameMatch.create({
    type: 'ranked',
    mode: 'duel',
    teamSize: 1,
    status: 'countdown',
    assignedParams: matchParams,
    players: [
      { userId: playerA.userId, name: profileA.alias, layersUsed: 1, wrongGuesses: 0, guesses: [], score: 0, sabotagesUsed: 0, finished: false, connected: true, sessionToken: tokenA },
      { userId: playerB.userId, name: profileB.alias, layersUsed: 1, wrongGuesses: 0, guesses: [], score: 0, sabotagesUsed: 0, finished: false, connected: true, sessionToken: tokenB },
    ],
    matchCaseId: matchCase._id,
    ratingChanges: [],
    breakdown: { scoringLines: {}, keyEvents: [] },
    sabotageEvents: [],
    eventSeq: 0,
  });

  matchCase.matchId = match._id;
  await matchCase.save();

  // Update queue entries
  await RankedQueue.updateOne(
    { userId: playerA.userId },
    { status: 'matched', matchedWith: playerB.userId, matchId: match._id }
  );
  await RankedQueue.updateOne(
    { userId: playerB.userId },
    { status: 'matched', matchedWith: playerA.userId, matchId: match._id }
  );

  // Notify both players via their private queue channels
  await pusher.trigger(channels.queue(playerA.userId), events.QUEUE_MATCHED, {
    matchId: match._id.toString(),
    sessionToken: tokenA,
    opponent: profileB.alias,
    opponentRating: profileB.rating,
  });
  await pusher.trigger(channels.queue(playerB.userId), events.QUEUE_MATCHED, {
    matchId: match._id.toString(),
    sessionToken: tokenB,
    opponent: profileA.alias,
    opponentRating: profileA.rating,
  });

  // 5-second countdown → active
  setTimeout(async () => {
    try {
      const m = await GameMatch.findById(match._id);
      if (m && m.status === 'countdown') {
        m.status = 'active';
        m.startedAt = new Date();
        await m.save();

        await pusher.trigger(
          channels.match(match._id.toString()),
          events.MATCH_STARTED,
          { matchId: match._id.toString(), startedAt: m.startedAt.toISOString() }
        );
      }
    } catch (e) {
      console.error('Ranked countdown error:', e);
    }
  }, 5000);
}
