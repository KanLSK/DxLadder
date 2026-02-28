import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/models/Match';
import MatchCase from '@/models/MatchCase';

const MECHANISM_CHECK_DEADLINE_MS = 12000; // 12 seconds

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    await dbConnect();
    const { matchId } = await params;
    const body = await request.json();
    const { casterKey, targetKey } = body;

    if (!casterKey || !targetKey || casterKey === targetKey) {
      return NextResponse.json(
        { ok: false, error: 'Invalid casterKey/targetKey' },
        { status: 400 }
      );
    }

    const match = await Match.findById(matchId);
    if (!match || match.status !== 'active') {
      return NextResponse.json(
        { ok: false, error: 'Match not found or not active' },
        { status: 404 }
      );
    }

    const caster = match.results.find((r: any) => r.playerKey === casterKey);
    const target = match.results.find((r: any) => r.playerKey === targetKey);

    if (!caster || !target) {
      return NextResponse.json(
        { ok: false, error: 'Player not found in match' },
        { status: 404 }
      );
    }

    // Check: caster hasn't used MechanismCheck yet
    const alreadyCast = match.sabotageEvents.some(
      (e: any) => e.type === 'MechanismCheck' && e.fromPlayerKey === casterKey
    );
    if (alreadyCast) {
      return NextResponse.json(
        { ok: false, error: 'You already used MechanismCheck this match' },
        { status: 403 }
      );
    }

    // Check: target hasn't been hit by MechanismCheck yet
    const alreadyTargeted = match.sabotageEvents.some(
      (e: any) => e.type === 'MechanismCheck' && e.toPlayerKey === targetKey
    );
    if (alreadyTargeted) {
      return NextResponse.json(
        { ok: false, error: 'This player has already been hit by MechanismCheck' },
        { status: 403 }
      );
    }

    // Fetch mechanism questions from the match case
    const matchCase = await MatchCase.findById(match.matchCaseId)
      .select('contentPrivate.mechanismQuestions')
      .lean();

    const mq = (matchCase as any)?.contentPrivate?.mechanismQuestions;
    if (!mq) {
      return NextResponse.json(
        { ok: false, error: 'No mechanism questions available for this case' },
        { status: 404 }
      );
    }

    // Pick 2 random questions from combined pool
    const allQuestions = [...(mq.stepChain || []), ...(mq.compensation || [])];
    if (allQuestions.length < 2) {
      return NextResponse.json(
        { ok: false, error: 'Not enough mechanism questions' },
        { status: 400 }
      );
    }

    // Shuffle and pick 2
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const pickedQuestions = shuffled.slice(0, 2);
    const questionIds = pickedQuestions.map((q: any) => q.id);

    const deadlineTs = Date.now() + MECHANISM_CHECK_DEADLINE_MS;

    // Record sabotage event
    match.sabotageEvents.push({
      type: 'MechanismCheck',
      fromPlayerKey: casterKey,
      toPlayerKey: targetKey,
      firedAt: new Date(),
      duration: MECHANISM_CHECK_DEADLINE_MS,
    });

    // Update caster's sabotage count
    const casterIdx = match.results.findIndex((r: any) => r.playerKey === casterKey);
    if (casterIdx >= 0) {
      match.results[casterIdx].sabotagesUsed += 1;
    }

    // Store pending state on target (using mechanismCheck field)
    const targetIdx = match.results.findIndex((r: any) => r.playerKey === targetKey);
    if (targetIdx >= 0) {
      (match.results[targetIdx] as any).mechanismCheck = {
        used: true,
        pending: true,
        deadlineTs,
        questionIds,
      };
    }

    await match.save();

    // Return questions to the CASTER (they broadcast to target via polling)
    // Strip correctIndex for client safety
    const clientQuestions = pickedQuestions.map((q: any) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      tags: q.tags,
    }));

    return NextResponse.json({
      ok: true,
      deadlineTs,
      questionIds,
      questions: clientQuestions,
    });

  } catch (error: any) {
    console.error('Error casting MechanismCheck:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
