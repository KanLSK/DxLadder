import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Vote from '@/models/Vote';
import CaseGenerated from '@/models/CaseGenerated';
import CaseLibrary from '@/models/CaseLibrary';
import { headers } from 'next/headers';
import crypto from 'crypto';

const SERVER_SALT = process.env.SERVER_SALT || 'default-dev-salt';
const MIN_VOTES = parseInt(process.env.MIN_VOTES || '5', 10);
const UPVOTE_THRESHOLD = parseFloat(process.env.UPVOTE_THRESHOLD || '0.8');

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { generatedCaseId, vote, reasons } = body;

    if (!generatedCaseId || !vote) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    // Hash IP info for anonymous rate-limiting/unique voting
    // Uses next/headers to grab forwarded IP
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    const ua = headersList.get('user-agent') || 'unknown';
    
    const voterKey = crypto.createHash('sha256').update(`${ip}-${ua}-${SERVER_SALT}`).digest('hex');

    // Make sure we only vote once
    const existingVote = await Vote.findOne({ generatedCaseId, voterKey });
    if (existingVote) {
       return NextResponse.json({ success: false, message: 'You have already voted on this case' }, { status: 403 });
    }

    // Save vote
    await Vote.create({
        generatedCaseId,
        voterKey,
        vote,
        reasons: reasons || []
    });

    // Update case stats
    const caseDoc = await CaseGenerated.findById(generatedCaseId);
    if (!caseDoc) {
         return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
    }

    // Recalculate stats
    const upVotes = caseDoc.voteStats.up + (vote === 1 ? 1 : 0);
    const downVotes = caseDoc.voteStats.down + (vote === -1 ? 1 : 0);
    const totalVotes = upVotes + downVotes;
    const upvoteRatio = totalVotes > 0 ? upVotes / totalVotes : 0;
    
    const isUnsafeVote = (reasons || []).includes("Unsafe or incorrect medical info");
    const unsafeCount = caseDoc.reportStats.unsafe + (isUnsafeVote ? 1 : 0);

    caseDoc.voteStats = { up: upVotes, down: downVotes, total: totalVotes, upvoteRatio };
    caseDoc.reportStats.unsafe = unsafeCount;

    // Evaluate promotion logic
    let status = caseDoc.status;
    
    // Auto-disable if too many unsafe reports (e.g., arbitrarily >= 2 for now MVP depending on scale)
    if (unsafeCount >= 2) {
        status = 'disabled';
    } 
    // Evaluate for promotion
    else if (status === 'active' && totalVotes >= MIN_VOTES && upvoteRatio >= UPVOTE_THRESHOLD) {
        status = 'promoted';
        
        // Push to library
        const payload = caseDoc.payload;
        
        // Simple Deduplication MVP: check if finalDiagnosis already exists in library
        const existingLibraryCase = await CaseLibrary.findOne({ 
             finalDiagnosis: payload.finalDiagnosis 
        });
        
        if (!existingLibraryCase) {
             await CaseLibrary.create({
                 finalDiagnosis: payload.finalDiagnosis,
                 aliases: payload.aliases,
                 hints: payload.hints,
                 teachingPoints: payload.teachingPoints,
                 systemTags: payload.systemTags,
                 diseaseTags: payload.diseaseTags,
                 difficulty: payload.difficulty,
                 sourceType: 'community_promoted'
             });
        }
    }

    caseDoc.status = status;
    await caseDoc.save();

    return NextResponse.json({ 
        success: true, 
        stats: caseDoc.voteStats,
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
