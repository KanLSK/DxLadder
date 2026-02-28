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
        systemTags = ['Mixed'],
        difficulty = 3,
        style = 'apk',
        targetAudience = 'clinical',
        dataDensity = 'moderate',
        noiseLevel = 'realistic',
        redHerring = 'mild',
        timeline = 'acute'
    } = params;

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
            "answerCheck": { "rationale": "String", "keyDifferentials": ["String"] }
        }
    }
    `;

    const prompt = `
    You are an expert medical educator creating a challenging clinical case for "Doctordle v3", a diagnostic reasoning game.
    
    PARAMETERS:
    - Primary Systems: ${systemTags.join(', ')}
    - Target Difficulty: ${difficulty}/5
    - Style: ${style} (If vignette: short and punchy. If apk: very long, narrative, highly detailed like Thai medical exams).
    - Target Audience: ${targetAudience}
    - Data Density: ${dataDensity}
    - Clinical Noise: ${noiseLevel} (Add irrelevant but realistic details)
    - Red Herrings: ${redHerring} (Add distractors that point to a differential)
    - Timeline: ${timeline}
    
    REQUIREMENTS:
    1. PROGRESSIVE DISCLOSURE: The case must be split into 7 distinct layers in the JSON.
    2. Do NOT reveal the diagnosis in the layers. 
    3. The pathology must fit the requested difficulty. A difficulty 5 case should require deep synthesis of conflicting cues.

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
