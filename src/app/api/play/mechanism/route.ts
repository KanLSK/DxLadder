import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Case from '@/models/Case';
import UserCaseProgress from '@/models/UserCaseProgress';

// Mastery threshold: must get >= 70% correct
const MASTERY_THRESHOLD = 0.7;

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { caseId, userKey, answers } = body;
    // answers: Array<{ questionId: string, selectedIndex: number }>

    if (!caseId || !userKey || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { ok: false, message: 'Missing required fields: caseId, userKey, answers[]' },
        { status: 400 }
      );
    }

    // Fetch the case's mechanism questions (server-side has correctIndex)
    const targetCase = await Case.findById(caseId)
      .select('contentPrivate.mechanismQuestions')
      .lean();

    if (!targetCase) {
      return NextResponse.json(
        { ok: false, message: 'Case not found' },
        { status: 404 }
      );
    }

    const mq = (targetCase as any).contentPrivate?.mechanismQuestions;
    if (!mq) {
      return NextResponse.json(
        { ok: false, message: 'Mechanism questions not available for this case' },
        { status: 404 }
      );
    }

    // Build a map of questionId -> correctIndex
    const answerKey = new Map<string, number>();
    for (const q of [...(mq.stepChain || []), ...(mq.compensation || [])]) {
      answerKey.set(q.id, q.correctIndex);
    }

    // Grade answers
    let score = 0;
    const total = answers.length;
    const wrongIds: string[] = [];

    for (const answer of answers) {
      const correct = answerKey.get(answer.questionId);
      if (correct !== undefined && answer.selectedIndex === correct) {
        score++;
      } else {
        wrongIds.push(answer.questionId);
      }
    }

    const mastered = total > 0 && (score / total) >= MASTERY_THRESHOLD;

    // Upsert UserCaseProgress
    const updatePayload: any = {
      'mechanism.attemptedAt': new Date(),
      'mechanism.score': score,
      'mechanism.total': total,
      'mechanism.wrongIds': wrongIds,
      'mechanism.completed': true,
    };

    if (mastered) {
      updatePayload.masteredAt = new Date();
    }

    await UserCaseProgress.updateOne(
      { userKey, caseId },
      {
        $set: updatePayload,
        $setOnInsert: { solvedAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({
      ok: true,
      score,
      total,
      mastered,
      wrongIds,
    });

  } catch (error: any) {
    console.error('Error grading mechanism answers:', error);
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
