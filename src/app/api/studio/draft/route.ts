import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, message: 'Missing draft ID' }, { status: 400 });
    }

    const draftCase = await Case.findOne({ _id: id, status: 'draft' });

    if (!draftCase) {
        return NextResponse.json({ success: false, message: 'Draft not found or already published' }, { status: 404 });
    }

    // Map to payload structure expected by frontend
    const casePayload = {
      title: draftCase.title,
      systemTags: draftCase.systemTags,
      difficulty: draftCase.difficulty,
      style: draftCase.style,
      targetAudience: draftCase.targetAudience,
      contentPublic: draftCase.contentPublic,
      contentPrivate: draftCase.contentPrivate,
    };

    return NextResponse.json({ 
        success: true, 
        casePayload,
        paramsUsed: draftCase.generationParams
    });

  } catch (error: any) {
    console.error('Error fetching draft:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
