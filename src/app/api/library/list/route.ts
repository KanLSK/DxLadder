import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CaseLibrary from '@/models/CaseLibrary';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');
    const difficulty = searchParams.get('difficulty');
    
    const query: any = {};
    if (system) query.systemTags = system;
    if (difficulty) query.difficulty = parseInt(difficulty, 10);

    const cases = await CaseLibrary.find(query)
        .select('_id finalDiagnosis difficulty systemTags diseaseTags sourceType createdAt')
        .sort({ createdAt: -1 })
        .limit(50); // limit for MVP

    return NextResponse.json({ success: true, cases });

  } catch (error: any) {
    console.error('Error fetching library cases:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
