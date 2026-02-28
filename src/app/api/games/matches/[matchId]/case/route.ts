import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameMatch from '@/models/GameMatch';
import MatchCase from '@/models/MatchCase';
import mongoose from 'mongoose';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    await dbConnect();
    const { matchId } = await params;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return NextResponse.json({ ok: false, error: 'Invalid match ID' }, { status: 400 });
    }

    const match = await GameMatch.findById(matchId).select('matchCaseId status').lean();
    if (!match) {
      return NextResponse.json({ ok: false, error: 'Match not found' }, { status: 404 });
    }
    if (!match.matchCaseId) {
      return NextResponse.json({ ok: false, error: 'Case not ready yet' }, { status: 404 });
    }

    // ONLY return public content — NEVER diagnosis/aliases/teachingPoints
    const matchCase = await MatchCase.findById(match.matchCaseId)
      .select('contentPublic title systemTags difficulty style')
      .lean();

    if (!matchCase) {
      return NextResponse.json({ ok: false, error: 'Match case expired or not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      caseData: {
        title: matchCase.title,
        systemTags: matchCase.systemTags,
        difficulty: matchCase.difficulty,
        style: matchCase.style,
        contentPublic: matchCase.contentPublic,
        sourceType: 'games',
      },
    });
  } catch (error: any) {
    console.error('Error fetching match case:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
