import { z } from 'zod';

// Matches the backend Case model structure exactly
export const GeminiGenerateSchema = z.object({
  title: z.string().describe("Short teaser line summarizing the clinical presentation"),
  systemTags: z.array(z.string()).min(1).describe("The primary organ systems affected"),
  difficulty: z.number().int().min(1).max(5).describe("Difficulty level scaling 1 to 5"),
  style: z.string().describe("The structural format of the case: vignette, osce, or apk"),
  targetAudience: z.string().describe("Intended audience capability level"),
  content: z.object({
    diagnosis: z.string().describe("The final, exact clinical diagnosis"),
    aliases: z.array(z.string()).default([]).describe("Acceptable synonyms or abbreviations for the diagnosis"),
    layers: z.object({
      presentationTimeline: z.string().describe("Opening statement and chronological timeline"),
      hpi: z.string().describe("History of Present Illness"),
      history: z.object({
        pmh: z.string().optional(),
        psh: z.string().optional(),
        meds: z.string().optional(),
        allergy: z.string().optional(),
        social: z.string().optional(),
        family: z.string().optional()
      }).passthrough().describe("Past medical, surgical, and other relevant patient history"),
      physicalExam: z.object({
        general: z.string().optional(),
        cvs: z.string().optional(),
        rs: z.string().optional(),
        gi: z.string().optional(),
        neuro: z.string().optional(),
        kub: z.string().optional(),
        msk: z.string().optional(),
        others: z.string().optional()
      }).passthrough().describe("Objective examination findings categorized by system"),
      labs: z.object({
        cbc: z.string().optional(),
        chemistry: z.string().optional(),
        others: z.string().optional()
      }).passthrough().describe("Laboratory results"),
      imaging: z.array(z.object({
        type: z.string().describe("Imaging modality: CXR, CT, MRI, US, ECG, or Other"),
        caption: z.string().describe("Detailed descriptive text of the imaging findings"),
        imageUrl: z.string().optional()
      })).default([]).describe("Imaging findings"),
      pathognomonic: z.string().nullable().optional().describe("A single, highly specific discriminating clue")
    }).passthrough(),
    teachingPoints: z.array(z.string()).default([]).describe("Educational pearls"),
    answerCheck: z.object({
      rationale: z.string().describe("Clear explanation of why this diagnosis is correct"),
      keyDifferentials: z.array(z.string()).default([]).describe("The top differential diagnoses")
    }).passthrough()
  }).passthrough()
});

// Schema for the validation/critic pass
export const GeminiCriticSchema = z.object({
  passes: z.boolean().describe("True if the case is medically sound and adheres to requirements, False otherwise"),
  issues: z.array(z.string()).describe("List of exact clinical errors, internal contradictions, or missing constraints found"),
  fix_suggestions: z.array(z.string()).describe("How the generator should rewrite the case to fix the identified issues")
});

export type GeminiGeneratePayload = z.infer<typeof GeminiGenerateSchema>;
export type GeminiCriticPayload = z.infer<typeof GeminiCriticSchema>;
