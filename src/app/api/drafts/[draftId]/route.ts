import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

// GET /api/drafts/[draftId]
// Author-only full view including private fields (for editing in Studio)
export async function GET(
  request: Request,
  props: { params: Promise<{ draftId: string }> }
) {
  try {
    await dbConnect();
    const params = await props.params;
    const { draftId } = params;

    const caseDoc = await Case.findById(draftId).lean();

    if (!caseDoc) {
      return NextResponse.json({ ok: false, error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      draft: caseDoc
    });
  } catch (error: any) {
    console.error('Error fetching draft:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
