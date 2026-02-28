import { NextResponse } from 'next/server';
import { generateCasePayload, runCritic } from '@/lib/aiPipeline';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const params = body.params || {};

    const MAX_RETRIES = 2;
    let attempts = 0;
    let finalPayload = null;
    let lastError = '';

    while (attempts < MAX_RETRIES) {
        try {
            console.log(`Generation attempt ${attempts + 1} with params:`, params);
            const draftPayload = await generateCasePayload(params);

            // Skip critic on first attempt to save API quota.
            // Only run critic if this is a retry.
            if (attempts > 0) {
              try {
                const criticResult = await runCritic(draftPayload);
                console.log(`Critic Result:`, criticResult);
                if (!criticResult.passes) {
                  console.warn(`Draft failed critic: ${criticResult.issues.join(', ')}`);
                  lastError = `Critic rejected: ${criticResult.issues.join(', ')}`;
                  attempts++;
                  continue;
                }
              } catch (criticErr: any) {
                // If critic fails (e.g. rate limit), still use the draft
                console.warn('Critic call failed, using draft as-is:', criticErr.message);
              }
            }

            finalPayload = draftPayload;
            break;

        } catch (genError: any) {
            const errMsg = genError.message || String(genError);
            console.error("Error during generation:", errMsg);
            lastError = errMsg;

            // If it's a rate limit error, don't retry — just tell the user
            if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
              return NextResponse.json(
                { ok: false, error: 'Gemini API rate limit reached. Please wait a minute and try again, or upgrade your API plan.' },
                { status: 429 }
              );
            }
        }
        attempts++;
    }

    if (!finalPayload) {
         return NextResponse.json(
            { ok: false, error: lastError || 'Failed to generate a valid case after multiple attempts.' },
            { status: 500 }
         );
    }

    // Map the flat Gemini output into the contentPublic/contentPrivate split
    try {
      const draftCase = await Case.create({
          origin: 'ai_generated',
          status: 'draft',
          title: finalPayload.title || 'Untitled Draft',
          systemTags: finalPayload.systemTags || params.systemTags || ['Mixed'],
          difficulty: finalPayload.difficulty || params.difficulty || 3,
          style: finalPayload.style || params.style || 'apk',
          targetAudience: finalPayload.targetAudience || params.targetAudience || 'clinical',
          generationParams: params,
          contentPublic: {
              layers: finalPayload.content.layers
          },
          contentPrivate: {
              diagnosis: finalPayload.content.diagnosis,
              aliases: finalPayload.content.aliases || [],
              teachingPoints: finalPayload.content.teachingPoints || [],
              answerCheck: finalPayload.content.answerCheck || { rationale: '', keyDifferentials: [] }
          },
          promptMeta: {
              promptVersion: 'v3.0.0',
              criticVersion: 'v1.0.0',
              createdBy: 'gemini',
              createdAt: new Date()
          }
      });

      return NextResponse.json({
          ok: true,
          draftId: draftCase._id,
          summary: {
              title: draftCase.title,
              systemTags: draftCase.systemTags,
              difficulty: draftCase.difficulty,
              style: draftCase.style
          }
      });
    } catch (dbError: any) {
      console.error('Error saving draft to DB:', dbError.message);
      if (dbError.errors) {
        Object.keys(dbError.errors).forEach((field) => {
          console.error(`  Field "${field}":`, dbError.errors[field].message);
        });
      }
      return NextResponse.json(
        { ok: false, error: `Database save failed: ${dbError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in /api/studio/generate:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
