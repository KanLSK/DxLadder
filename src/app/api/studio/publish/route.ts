import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { draftId, edits } = body;

    if (!draftId) {
        return NextResponse.json({ ok: false, error: 'Missing draftId' }, { status: 400 });
    }

    const draft = await Case.findById(draftId);
    if (!draft) {
        return NextResponse.json({ ok: false, error: 'Draft not found' }, { status: 404 });
    }
    if (draft.status !== 'draft') {
        return NextResponse.json({ ok: false, error: 'Case is already published' }, { status: 400 });
    }

    // Apply optional edits
    if (edits) {
        if (edits.title) draft.title = edits.title;
        if (edits.contentPublic) {
            draft.contentPublic = { ...draft.contentPublic, ...edits.contentPublic };
        }
        if (edits.contentPrivate) {
            draft.contentPrivate = { ...draft.contentPrivate, ...edits.contentPrivate };
        }
    }

    draft.status = 'needs_review';
    await draft.save();

    return NextResponse.json({
        ok: true,
        caseId: draft._id
    });

  } catch (error: any) {
    console.error('Error in /api/studio/publish:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
