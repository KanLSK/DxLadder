import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Vote from '@/models/Vote';
import Case from '@/models/Case';
import { headers } from 'next/headers';
import crypto from 'crypto';

const SERVER_SALT = process.env.SERVER_SALT || 'default-dev-salt';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    // Accept both generatedCaseId (legacy) and caseId
    const caseId = body.caseId || body.generatedCaseId;
    const { vote, reasons } = body;

    if (!caseId || !vote) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    // Hash IP info for anonymous rate-limiting/unique voting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    const ua = headersList.get('user-agent') || 'unknown';
    
    const voterKey = crypto.createHash('sha256').update(`${ip}-${ua}-${SERVER_SALT}`).digest('hex');

    // Make sure we only vote once
    const existingVote = await Vote.findOne({ caseId, voterKey });
    if (existingVote) {
       return NextResponse.json({ success: false, message: 'You have already voted on this case' }, { status: 403 });
    }

    // Save vote
    await Vote.create({
        caseId,
        voterKey,
        vote,
        labels: {
          unrealisticParts: (reasons || []).filter((r: string) => 
            ['history', 'exam', 'labs', 'imaging', 'timeline', 'diagnosis_fit'].includes(r)
          ),
          incorrectOrUnsafe: (reasons || []).includes('Unsafe or incorrect medical info'),
        }
    });

    // Update community stats on the Case document
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
         return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
    }

    // Recalculate community stats
    const community = caseDoc.community || { up: 0, down: 0, score: 0, totalVotes: 0, realismAvg: 0 };
    const newUp = community.up + (vote === 1 ? 1 : 0);
    const newDown = community.down + (vote === -1 ? 1 : 0);
    const newTotal = newUp + newDown;
    const newScore = newUp - newDown;

    caseDoc.community = {
      up: newUp,
      down: newDown,
      score: newScore,
      totalVotes: newTotal,
      realismAvg: community.realismAvg, // unchanged for now
    };

    // Track safety flags
    const isUnsafeVote = (reasons || []).includes('Unsafe or incorrect medical info');
    if (isUnsafeVote) {
      caseDoc.safetyFlags = {
        incorrect: (caseDoc.safetyFlags?.incorrect || 0),
        unsafe: (caseDoc.safetyFlags?.unsafe || 0) + 1,
      };
    }

    // Auto-disable if too many unsafe reports
    if ((caseDoc.safetyFlags?.unsafe || 0) >= 3) {
      caseDoc.status = 'disabled';
    }

    await caseDoc.save();

    return NextResponse.json({ 
        success: true, 
        stats: caseDoc.community,
        status: caseDoc.status 
    });

  } catch (error: any) {
    console.error('Error recording vote:', error);
    // Handle uniqueness duplicate key error gracefully
    if (error.code === 11000) {
        return NextResponse.json({ success: false, message: 'You have already voted' }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
