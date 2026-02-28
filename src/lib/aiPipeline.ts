import { ai } from './gemini';
import { GeminiGenerateSchema, GeminiCriticSchema } from './zodSchemas';

const MODEL = 'gemini-2.5-flash';

// Utility to convert Zod schema to Gemini schema format for `responseSchema`
const convertZodToGemini = (zodObj: any): any => {
    // This is a simplified mapper. In a robust production app, we would write a deeper Zod->OpenAPI converter.
    // For now, we will just pass formatting instructions in the prompt and use application/json.
    // However, Gemini accepts an explicit JSON Schema via `responseSchema`.
    // We'll return the base object types explicitly.
};

export async function generateCasePayload(params: any) {
    const {
        systemTags = ['Random'],
        difficulty = 3,
        style = 'apk',
        targetAudience = 'clinical',
        dataDensity = 'moderate',
        noiseLevel = 'realistic',
        redHerring = 'mild',
        timeline = 'acute'
    } = params;

    // Determine system instruction based on whether the user chose 'Random' or specific systems
    const isRandom = systemTags.length === 1 && systemTags[0] === 'Random';
    const systemInstruction = isRandom
        ? 'Choose ANY body system freely — surprise the user with an uncommon or under-represented system.'
        : `The case MUST primarily involve: ${systemTags.join(', ')}. Ensure the clinical presentation authentically reflects pathology in ${systemTags.length > 1 ? 'these systems' : 'this system'}.`;

    // Variation seed to ensure unique cases even with identical params
    const variationSeed = Date.now();

    const strictJsonInstruction = `
    You MUST return ONLY a valid JSON object matching this exact structure:
    {
        "title": "String",
        "systemTags": ["String"],
        "difficulty": Number (1-5),
        "style": "vignette|osce|apk",
        "targetAudience": "String",
        "content": {
            "diagnosis": "String",
            "aliases": ["String"],
            "layers": {
                 "presentationTimeline": "String",
                 "hpi": "String",
                 "history": { "pmh": "String", "psh": "String", "meds": "String", "allergy": "String", "social": "String", "family": "String" },
                 "physicalExam": { "general": "String", "cvs": "String", "rs": "String", "gi": "String", "neuro": "String", "kub": "String", "msk": "String", "others": "String" },
                 "labs": { "cbc": "String", "chemistry": "String", "others": "String" },
                 "imaging": [{ "type": "CXR|CT|MRI|US|ECG|Other", "caption": "String" }],
                 "pathognomonic": "String | null"
            },
            "teachingPoints": ["String"],
            "answerCheck": { "rationale": "String", "keyDifferentials": ["String"] },
            "mechanismQuestions": {
                "stepChain": [
                    { "id": "sc1", "prompt": "String", "options": ["A","B","C","D"], "correctIndex": Number (0-3), "explanation": "String", "tags": ["String"] }
                ],
                "compensation": [
                    { "id": "comp1", "prompt": "String", "options": ["A","B","C","D"], "correctIndex": Number (0-3), "explanation": "String", "tags": ["String"] }
                ],
                "traps": ["Common misconception 1", "Common misconception 2"]
            }
        }
    }
    `;

    // Determine question count based on difficulty
    const questionCount = difficulty <= 2 ? '2-3' : difficulty <= 4 ? '3-5' : '5-7';

    const prompt = `
    You are an expert medical educator creating a challenging clinical case for "Doctordle v3", a diagnostic reasoning game.
    
    PARAMETERS:
    - Primary Systems: ${systemInstruction}
    - Target Difficulty: ${difficulty}/5
    - Style: ${style} (If vignette: short and punchy. If apk: very long, narrative, highly detailed like Thai medical exams).
    - Target Audience: ${targetAudience}
    - Data Density: ${dataDensity}
    - Clinical Noise: ${noiseLevel} (Add irrelevant but realistic details)
    - Red Herrings: ${redHerring} (Add distractors that point to a differential)
    - Timeline: ${timeline}
    - Variation Seed: ${variationSeed} (Use this to diversify your output — produce a UNIQUE case)
    
    REQUIREMENTS:
    1. PROGRESSIVE DISCLOSURE: The case must be split into 7 distinct layers in the JSON.
    2. Do NOT reveal the diagnosis in the layers. 
    3. The pathology must fit the requested difficulty. A difficulty 5 case should require deep synthesis of conflicting cues.

    DIVERSITY REQUIREMENTS (CRITICAL):
    4. Generate a UNIQUE case different from any common textbook vignette.
    5. Vary patient demographics (age, sex, occupation, ethnicity, lifestyle).
    6. Vary the chief complaint phrasing, clinical setting (ER, outpatient, ward, ICU), and presentation pattern.
    7. Avoid the most stereotypical presentations — prefer atypical or under-recognized presentations for the chosen system.

    MECHANISM QUESTIONS (REQUIRED):
    8. In "mechanismQuestions", generate ${questionCount} total questions split between stepChain (pathophysiology) and compensation (physiologic responses).
    9. stepChain questions should test WHY the disease causes the observed findings (e.g. "Which pathophysiological step leads to the hypotension seen in this patient?").
    10. compensation questions should test HOW the body compensates (e.g. "Which compensatory mechanism is most active in this patient?").
    11. Each question MUST have exactly 4 options, one correctIndex (0-3), a concise explanation (1-2 sentences), and relevant tags.
    12. Each question id MUST be unique (e.g. "sc1", "sc2", "comp1", "comp2").
    13. In "traps", list 2-3 common misconceptions students have about this condition.

    ${strictJsonInstruction}
    `;

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.7,
        }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    const rawData = JSON.parse(text);
    // Validate through Zod
    return GeminiGenerateSchema.parse(rawData);
}

export async function runCritic(generatedCase: any) {
    const strictJsonInstruction = `
    You MUST return ONLY a valid JSON object matching this exact structure:
    {
        "passes": Boolean,
        "issues": ["String"],
        "fix_suggestions": ["String"]
    }
    `;

    const prompt = `
    You are a peer-reviewer for a medical education app. Review the following proposed case:
    
    ${JSON.stringify(generatedCase, null, 2)}
    
    Critique strictly on these criteria:
    1. Does it strictly follow the 7-layer structure?
    2. Are the clinical findings medically accurate without contradicting each other?
    3. Is there enough discriminating information to make the diagnosis by the "labs" or "imaging" layer?
    4. Is it completely free of unsafe, irrelevant, or inappropriate content?
    
    If it passes ALL criteria, return passes: true. If it fails ANY, return passes: false and list the exact clinical issues and fix_suggestions.

    ${strictJsonInstruction}
    `;

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.1,
        }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Critic");
    
    const rawData = JSON.parse(text);
    return GeminiCriticSchema.parse(rawData);
}
