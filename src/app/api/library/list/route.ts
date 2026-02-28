import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');
    const difficulty = searchParams.get('difficulty');
    
    const query: any = {
      status: { $in: ['library_promoted', 'community_approved', 'needs_review'] }
    };
    if (system) query.systemTags = system;
    if (difficulty) query.difficulty = parseInt(difficulty, 10);

    const cases = await Case.find(query)
      .select('title difficulty systemTags style status createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, cases });

  } catch (error: any) {
    console.error('Error fetching library cases:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
