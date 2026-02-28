import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');
    const difficulty = searchParams.get('difficulty');
    const mode = searchParams.get('mode') || 'practice';
    const id = searchParams.get('id');

    // If a specific ID is given, fetch that case (public only for play)
    if (id) {
      const caseDoc = await Case.findById(id)
        .select('title systemTags difficulty style contentPublic status')
        .lean();

      if (!caseDoc) {
        return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        case: {
          _id: caseDoc._id,
          title: (caseDoc as any).title,
          systemTags: (caseDoc as any).systemTags,
          difficulty: (caseDoc as any).difficulty,
          style: (caseDoc as any).style,
          contentPublic: (caseDoc as any).contentPublic,
          sourceType: 'generated'
        }
      });
    }

    // Random case using aggregation — only select public fields
    const query: any = {
      status: { $in: ['library_promoted', 'community_approved', 'needs_review'] }
    };
    if (system) query.systemTags = system;
    if (difficulty) query.difficulty = parseInt(difficulty, 10);

    const cases = await Case.aggregate([
      { $match: query },
      { $sample: { size: 1 } },
      { $project: {
        title: 1,
        systemTags: 1,
        difficulty: 1,
        style: 1,
        contentPublic: 1,
        status: 1
      }}
    ]);

    if (!cases || cases.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No cases found matching criteria' },
        { status: 404 }
      );
    }

    const c = cases[0];
    return NextResponse.json({
      success: true,
      case: {
        _id: c._id,
        title: c.title,
        systemTags: c.systemTags,
        difficulty: c.difficulty,
        style: c.style,
        contentPublic: c.contentPublic,
        sourceType: 'generated'
      }
    });

  } catch (error: any) {
    console.error('Error fetching library case:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
