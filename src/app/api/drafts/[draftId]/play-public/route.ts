import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

// GET /api/drafts/[draftId]/play-public
// Returns ONLY public content (layers) — no diagnosis, no aliases, no teaching points
export async function GET(
  request: Request,
  props: { params: Promise<{ draftId: string }> }
) {
  try {
    await dbConnect();
    const params = await props.params;
    const { draftId } = params;

    // Strict projection: only select public fields
    const caseDoc = await Case.findById(draftId)
      .select('title systemTags difficulty style targetAudience status contentPublic')
      .lean();

    if (!caseDoc) {
      return NextResponse.json({ ok: false, error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      case: {
        _id: caseDoc._id,
        title: caseDoc.title,
        systemTags: caseDoc.systemTags,
        difficulty: caseDoc.difficulty,
        style: caseDoc.style,
        targetAudience: caseDoc.targetAudience,
        status: caseDoc.status,
        layers: (caseDoc as any).contentPublic?.layers || {},
      }
    });
  } catch (error: any) {
    console.error('Error fetching play-public draft:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
