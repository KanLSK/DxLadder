import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Match from '@/models/Match';
import MatchCase from '@/models/MatchCase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    await dbConnect();
    const { matchId } = await params;
    const body = await request.json();
    const { playerKey, answers } = body;
    // answers: Array<{ questionId: string, selectedIndex: number }>

    if (!playerKey || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { ok: false, error: 'Missing playerKey or answers' },
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

    const targetIdx = match.results.findIndex((r: any) => r.playerKey === playerKey);
    if (targetIdx < 0) {
      return NextResponse.json(
        { ok: false, error: 'Player not found in match' },
        { status: 404 }
      );
    }

    const target = match.results[targetIdx] as any;
    if (!target.mechanismCheck?.pending) {
      return NextResponse.json(
        { ok: false, error: 'No pending mechanism check for this player' },
        { status: 400 }
      );
    }

    // Check if deadline has passed
    const isTimedOut = Date.now() > (target.mechanismCheck.deadlineTs || 0);

    // Fetch answers from DB
    const matchCase = await MatchCase.findById(match.matchCaseId)
      .select('contentPrivate.mechanismQuestions')
      .lean();

    const mq = (matchCase as any)?.contentPrivate?.mechanismQuestions;
    const allQuestions = [...(mq?.stepChain || []), ...(mq?.compensation || [])];

    // Build answer key for the specific questions
    const answerKey = new Map<string, number>();
    for (const q of allQuestions) {
      answerKey.set(q.id, q.correctIndex);
    }

    // Grade answers
    let correct = 0;
    for (const answer of answers) {
      const expected = answerKey.get(answer.questionId);
      if (expected !== undefined && answer.selectedIndex === expected) {
        correct++;
      }
    }

    const passed = !isTimedOut && correct >= 2; // Must get both right within time
    let penaltyApplied: string | undefined;

    if (!passed) {
      // Apply penalty: +1 wrong guess
      match.results[targetIdx].wrongGuesses += 1;
      penaltyApplied = '+1 wrong guess';
    }

    // Clear pending state
    target.mechanismCheck.pending = false;
    match.results[targetIdx] = target;

    await match.save();

    return NextResponse.json({
      ok: true,
      pass: passed,
      correct,
      total: 2,
      timedOut: isTimedOut,
      penaltyApplied,
    });

  } catch (error: any) {
    console.error('Error answering MechanismCheck:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
