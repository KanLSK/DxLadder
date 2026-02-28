import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CaseLibrary from '@/models/CaseLibrary';
import CaseGenerated from '@/models/CaseGenerated';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const system = searchParams.get('system');
    const difficulty = searchParams.get('difficulty');
    const mode = searchParams.get('mode') || 'practice'; 
    const id = searchParams.get('id');

    const query: any = {};
    if (system) query.systemTags = system;
    if (difficulty) query.difficulty = parseInt(difficulty, 10);

    let cases;
    
    // If an ID is provided, fetch that exact case. Otherwise get a random one.
    if (id) {
        if (mode === 'ai-review') {
            const genCase = await CaseGenerated.findById(id);
            if (genCase) {
                 cases = [{
                     _id: genCase._id,
                     systemTags: genCase.payload.systemTags,
                     diseaseTags: genCase.payload.diseaseTags,
                     difficulty: genCase.payload.difficulty,
                     hints: genCase.payload.hints,
                     sourceType: 'generated'
                 }];
            } else {
                 cases = [];
            }
        } else {
            cases = await CaseLibrary.find({ _id: id });
        }
    } else {
        cases = await CaseLibrary.aggregate([
          { $match: query },
          { $sample: { size: 1 } },
        ]);
    }

    if (!cases || cases.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No cases found matching criteria' },
        { status: 404 }
      );
    }

    const randomCase = cases[0];

    // Censor sensitive info (only send first hint, no diagnosis/aliases/teaching points)
    // The client will fetch subsequent hints or submit guesses which validates
    const safeCase = {
      _id: randomCase._id,
      systemTags: randomCase.systemTags,
      diseaseTags: randomCase.diseaseTags,
      difficulty: randomCase.difficulty,
      hint1: randomCase.hints[0], // Only send the first hint initially
      sourceType: randomCase.sourceType,
    };

    return NextResponse.json({ success: true, case: safeCase });
  } catch (error: any) {
    console.error('Error fetching library case:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
