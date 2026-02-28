import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Case from '@/models/Case';
import Play from '@/models/Play';
import User from '@/models/User';
import { normalizeGuess, checkAlternativeSpellings } from '@/lib/normalization';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { caseId, guess, currentLayerIndex, userKey } = body;

    const activeLayerIndex = currentLayerIndex !== undefined ? currentLayerIndex : body.currentHintIndex;

    if (!caseId || !guess || activeLayerIndex === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch only what we need — public fields for layer count, private for answer check
    const targetCase = await Case.findById(caseId);

    if (!targetCase) {
      return NextResponse.json(
        { success: false, message: 'Case not found.' },
        { status: 404 }
      );
    }

    // Answer data lives in contentPrivate
    const { diagnosis, aliases } = targetCase.contentPrivate;
    const normalizedGuess = normalizeGuess(guess);
    const expectedNormalized = normalizeGuess(diagnosis);

    const isCorrect = checkAlternativeSpellings(normalizedGuess, expectedNormalized, aliases);

    const MAX_LAYERS = 7;
    let finished = isCorrect;
    let nextLayerIndex = activeLayerIndex;

    if (!isCorrect) {
       if (activeLayerIndex < MAX_LAYERS - 1) {
           nextLayerIndex = activeLayerIndex + 1;
       } else {
           finished = true;
       }
    }

    // Track play session
    let playSession = null;
    if (userKey) {
        const previousPlay = await Play.findOne({ caseId, userKey });
        const alreadySolved = previousPlay?.solved || false;

        playSession = await Play.findOneAndUpdate(
            { caseId, userKey },
            {
               $inc: { attempts: 1 },
               $set: {
                   solved: isCorrect || alreadySolved,
                   layersUnlocked: nextLayerIndex + 1
               },
               $push: { guesses: guess }
            },
            { upsert: true, new: true }
        );

        // User stat updates on first solve
        if (isCorrect && !alreadySolved && mongoose.Types.ObjectId.isValid(userKey)) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const user = await User.findById(userKey);
            if (user) {
                let newStreak = user.stats.currentStreak;
                const lastPlayed = user.stats.lastPlayedDate;

                if (lastPlayed) {
                    const lastPlayedDay = new Date(lastPlayed);
                    lastPlayedDay.setHours(0, 0, 0, 0);
                    const diffTime = Math.abs(today.getTime() - lastPlayedDay.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        newStreak += 1;
                    } else if (diffDays > 1) {
                        newStreak = 1;
                    }
                } else {
                    newStreak = 1;
                }

                const newLongest = Math.max(newStreak, user.stats.longestStreak);

                const systemMastery = user.systemMastery || new Map();
                if (targetCase.systemTags && targetCase.systemTags.length > 0) {
                    targetCase.systemTags.forEach((tag: string) => {
                        const current = systemMastery.get(tag) || { attempted: 0, solved: 0 };
                        systemMastery.set(tag, { attempted: current.attempted + 1, solved: current.solved + 1 });
                    });
                }

                await User.findByIdAndUpdate(userKey, {
                    $set: {
                        'stats.lastPlayedDate': new Date(),
                        'stats.currentStreak': newStreak,
                        'stats.longestStreak': newLongest,
                        systemMastery: systemMastery
                    },
                    $inc: { 'stats.totalSolved': 1 }
                });
            }
        }
    }

    // Build response — NEVER leak private data unless finished
    const responsePayload: any = {
      success: true,
      correct: isCorrect,
      normalizedGuess,
      finished,
      nextLayerIndex,
    };

    // Only reveal private content when game is over
    if (finished) {
        responsePayload.reveal = {
            diagnosis: targetCase.contentPrivate.diagnosis,
            rationale: targetCase.contentPrivate.answerCheck?.rationale,
            keyDifferentials: targetCase.contentPrivate.answerCheck?.keyDifferentials,
            teachingPoints: targetCase.contentPrivate.teachingPoints,
        };
        responsePayload.systemTags = targetCase.systemTags;
    }

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error('Error processing guess:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
