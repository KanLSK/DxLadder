import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // In a real app we'd verify admin auth here
    // For now, this is a simplified endpoint to trigger promotion runs
    
    // Thresholds
    const MIN_VOTES = 5;
    const APPROVAL_RATIO = 0.75; // 75% upvotes
    
    // 1. Promote community_approved cases to the permanent library
    // Our vote handler already moves 'needs_review' -> 'community_approved' 
    // when basic thresholds are met. This job formalizes them into the library.
    
    const candidates = await Case.find({ status: 'community_approved' });
    let promotedCount = 0;
    
    for (const c of candidates) {
        if (c.community && c.community.totalVotes >= MIN_VOTES) {
            const ratio = c.community.up / c.community.totalVotes;
            if (ratio >= APPROVAL_RATIO) {
                c.status = 'library_promoted';
                await c.save();
                promotedCount++;
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Successfully promoted ${promotedCount} cases to the library.` 
    });

  } catch (error: any) {
    console.error('Error in promotion job:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
