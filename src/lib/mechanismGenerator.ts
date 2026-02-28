import { ai } from './gemini';
import Case from '@/models/Case';

const MODEL = 'gemini-2.5-flash';

/**
 * Generate mechanism questions for a case that doesn't have them yet.
 * This is a ONE-TIME generation that gets cached to the case document.
 * Zero cost on subsequent lookups.
 */
export async function generateMechanismQuestionsForCase(
  caseId: string,
  diagnosis: string,
  difficulty: number = 3
): Promise<any | null> {
  const questionCount = difficulty <= 2 ? '2-3' : difficulty <= 4 ? '3-5' : '5-7';
  const scCount = Math.ceil(parseInt(questionCount.split('-')[1]) / 2);
  const compCount = Math.floor(parseInt(questionCount.split('-')[1]) / 2);

  const prompt = `
You are a medical educator. For the diagnosis "${diagnosis}", generate mechanism questions.

Return ONLY a valid JSON object:
{
  "stepChain": [
    {
      "id": "sc1",
      "prompt": "Question about WHY this disease causes specific findings",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "1-2 sentence explanation",
      "tags": ["relevant pathophysiology tag"]
    }
  ],
  "compensation": [
    {
      "id": "comp1", 
      "prompt": "Question about HOW the body compensates",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "1-2 sentence explanation",
      "tags": ["relevant compensation tag"]
    }
  ],
  "traps": ["Common misconception 1", "Common misconception 2"]
}

RULES:
- Generate ${scCount} stepChain questions (pathophysiology: WHY does this disease cause these findings?)
- Generate ${compCount} compensation questions (HOW does the body respond/compensate?)
- Each question has exactly 4 options, one correctIndex (0-3)
- Explanations are concise (1-2 sentences max)
- Each id must be unique (sc1, sc2, comp1, comp2, etc.)
- Include 2-3 common traps/misconceptions
- Questions should be clinically relevant and educational
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) return null;

    const mechanismQuestions = JSON.parse(text);

    // Validate basic structure
    if (!mechanismQuestions.stepChain || !mechanismQuestions.compensation) {
      console.warn('Invalid mechanism questions structure');
      return null;
    }

    // Cache to the case document (fire-and-forget)
    Case.updateOne(
      { _id: caseId },
      { $set: { 'contentPrivate.mechanismQuestions': mechanismQuestions } }
    ).exec().catch((err: any) => {
      console.error('Failed to cache mechanism questions:', err);
    });

    return mechanismQuestions;
  } catch (error: any) {
    console.error('Error generating mechanism questions:', error.message);
    return null;
  }
}
