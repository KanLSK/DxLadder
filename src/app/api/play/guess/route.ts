import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Case from '@/models/Case';
import Play from '@/models/Play';
import User from '@/models/User';
import { isCorrectGuess } from '@/lib/answerMatch';
import { generateMechanismQuestionsForCase } from '@/lib/mechanismGenerator';

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

    // Only fetch what we need — private fields for answer check
    const targetCase = await Case.findById(caseId)
      .select('contentPrivate.diagnosis contentPrivate.aliases contentPrivate.acceptRules contentPrivate.answerCheck contentPrivate.teachingPoints contentPrivate.mechanismQuestions systemTags difficulty')
      .lean();

    if (!targetCase) {
      return NextResponse.json(
        { success: false, message: 'Case not found.' },
        { status: 404 }
      );
    }

    const priv = (targetCase as any).contentPrivate;
    const { diagnosis, aliases, acceptRules } = priv;
    const matchResult = isCorrectGuess(guess, diagnosis, aliases, acceptRules);
    const isCorrect = matchResult.ok;
    const normalizedGuess = guess.toLowerCase().trim();

    const MAX_LAYERS = 6;
    let finished = isCorrect;
    let nextLayerIndex = activeLayerIndex;

    if (!isCorrect) {
      if (activeLayerIndex < MAX_LAYERS - 1) {
        nextLayerIndex = activeLayerIndex + 1;
      } else {
        finished = true;
      }
    }

    // Track play session — fire and forget for non-critical updates
    if (userKey) {
      const previousPlay = await Play.findOne({ caseId, userKey })
        .select('solved')
        .lean();
      const alreadySolved = previousPlay?.solved || false;

      // Use updateOne instead of findOneAndUpdate — faster, no return doc needed
      Play.updateOne(
        { caseId, userKey },
        {
          $inc: { attempts: 1 },
          $set: {
            solved: isCorrect || alreadySolved,
            layersUnlocked: nextLayerIndex + 1
          },
          $push: { guesses: guess }
        },
        { upsert: true }
      ).exec(); // Fire-and-forget — don't await

      // User stat updates on first solve — also fire-and-forget
      if (isCorrect && !alreadySolved && mongoose.Types.ObjectId.isValid(userKey)) {
        updateUserStats(userKey, (targetCase as any).systemTags).catch(err => {
          console.error('Background user stat update failed:', err);
        });
      }
    }

    // Build response — NEVER leak private data unless finished
    const responsePayload: any = {
      success: true,
      correct: isCorrect,
      normalizedGuess,
      matchMethod: matchResult.method,
      finished,
      nextLayerIndex,
    };

    if (finished) {
      responsePayload.reveal = {
        diagnosis: priv.diagnosis,
        rationale: priv.answerCheck?.rationale,
        keyDifferentials: priv.answerCheck?.keyDifferentials,
        teachingPoints: priv.teachingPoints,
      };
      responsePayload.systemTags = (targetCase as any).systemTags;

      // Include mechanism questions (strip correctIndex for client-side)
      let mechQs = priv.mechanismQuestions;

      // Fallback: generate mechanism questions on-demand for older cases
      if (!mechQs && isCorrect) {
        try {
          mechQs = await generateMechanismQuestionsForCase(
            caseId,
            priv.diagnosis,
            (targetCase as any).difficulty || 3
          );
        } catch (e) {
          console.warn('On-demand mechanism generation failed:', e);
        }
      }

      if (mechQs) {
        const stripAnswer = (q: any) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options,
          explanation: q.explanation, // shown AFTER answering client-side
          tags: q.tags,
        });
        responsePayload.mechanismQuestions = {
          stepChain: (mechQs.stepChain || []).map(stripAnswer),
          compensation: (mechQs.compensation || []).map(stripAnswer),
          traps: mechQs.traps || [],
        };
      }
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

// Background stat update — decoupled from the main response
async function updateUserStats(userKey: string, systemTags: string[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await User.findById(userKey).select('stats systemMastery').lean();
  if (!user) return;

  let newStreak = user.stats.currentStreak;
  const lastPlayed = user.stats.lastPlayedDate;

  if (lastPlayed) {
    const lastPlayedDay = new Date(lastPlayed);
    lastPlayedDay.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(Math.abs(today.getTime() - lastPlayedDay.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) newStreak += 1;
    else if (diffDays > 1) newStreak = 1;
  } else {
    newStreak = 1;
  }

  const updateObj: any = {
    'stats.lastPlayedDate': new Date(),
    'stats.currentStreak': newStreak,
    'stats.longestStreak': Math.max(newStreak, user.stats.longestStreak),
  };

  // Build system mastery updates
  if (systemTags?.length > 0) {
    systemTags.forEach((tag: string) => {
      updateObj[`systemMastery.${tag}.attempted`] = ((user.systemMastery as any)?.[tag]?.attempted || 0) + 1;
      updateObj[`systemMastery.${tag}.solved`] = ((user.systemMastery as any)?.[tag]?.solved || 0) + 1;
    });
  }

  await User.updateOne(
    { _id: userKey },
    { $set: updateObj, $inc: { 'stats.totalSolved': 1 } }
  );
}
