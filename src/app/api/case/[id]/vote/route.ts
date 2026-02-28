import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';
import Vote from '@/models/Vote';
import mongoose from 'mongoose';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await dbConnect();
    const caseId = params.id;
    const { voterKey, vote, realismRating, labels } = await request.json();

    if (!voterKey || typeof vote !== 'number') {
        return NextResponse.json({ success: false, message: 'Missing voterKey or vote value' }, { status: 400 });
    }

    // Upsert vote
    const newVote = await Vote.findOneAndUpdate(
        { caseId: new mongoose.Types.ObjectId(caseId), voterKey },
        { vote, realismRating, labels },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate case community metrics
    // In a fully scaled app this might be a background job, but for MVP we compute on the fly
    const allVotes = await Vote.find({ caseId: new mongoose.Types.ObjectId(caseId) });
    
    let totalUp = 0;
    let totalDown = 0;
    let sumRealism = 0;
    let realismCount = 0;

    for (const v of allVotes) {
        if (v.vote === 1) totalUp++;
        if (v.vote === -1) totalDown++;
        if (v.realismRating) {
            sumRealism += v.realismRating;
            realismCount++;
        }
    }

    const score = totalUp - totalDown;
    const realismAvg = realismCount > 0 ? (sumRealism / realismCount) : 0;

    const updatedCase = await Case.findByIdAndUpdate(
        caseId,
        {
            $set: {
                'community.up': totalUp,
                'community.down': totalDown,
                'community.score': score,
                'community.totalVotes': allVotes.length,
                'community.realismAvg': realismAvg
            }
        },
        { new: true }
    );

    // Simple promotion check MVP
    const MIN_VOTES = 5;
    const UPVOTE_RATIO = 0.75;
    
    if (updatedCase && updatedCase.status === 'needs_review' && allVotes.length >= MIN_VOTES) {
        if ((totalUp / allVotes.length) >= UPVOTE_RATIO) {
            updatedCase.status = 'community_approved';
            await updatedCase.save();
        }
    }

    return NextResponse.json({ success: true, community: updatedCase?.community, newStatus: updatedCase?.status });

  } catch (error: any) {
    console.error('Error submitting vote:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
