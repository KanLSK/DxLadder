import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CaseGenerated from '@/models/CaseGenerated';

export async function GET() {
  try {
    await dbConnect();

    // Fetch up to 10 cases that need community review that haven't been promoted or disabled yet
    // 'active' means it is currently in the voting queue
    const queue = await CaseGenerated.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('payload.finalDiagnosis payload.hints payload.systemTags payload.difficulty voteStats createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      queue,
      totalInQueue: await CaseGenerated.countDocuments({ status: 'active' })
    });

  } catch (error: any) {
    console.error('Failed to fetch AI studio queue:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
