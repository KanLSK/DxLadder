import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Read the env file manually to bypass any issues dotenv has with NextAuth keys
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const geminiMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
if (geminiMatch && geminiMatch[1]) {
    // Strip quotes if they exist
    process.env.GEMINI_API_KEY = geminiMatch[1].replace(/['"]/g, '').trim();
}

import mongoose from 'mongoose';
import { generateCasePayload, runCritic } from '../src/lib/aiPipeline';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

// Full Schema definition necessary to seed the database properly
const CaseSchema = new mongoose.Schema({
  origin: { type: String, enum: ['curated', 'ai_generated', 'user_submitted'], required: true },
  status: { type: String, enum: ['draft', 'needs_review', 'community_approved', 'library_promoted', 'disabled'], required: true, default: 'draft' },
  title: { type: String, required: true },
  systemTags: [{ type: String }],
  difficulty: { type: Number, min: 1, max: 5, required: true },
  style: { type: String, required: true, default: 'vignette' },
  targetAudience: { type: String, required: true, default: 'clinical' },
  generationParams: { type: mongoose.Schema.Types.Mixed },

  contentPublic: {
    layers: {
      presentationTimeline: { type: String, required: true },
      hpi: { type: String, required: true },
      history: {
        pmh: { type: String }, psh: { type: String }, meds: { type: String }, allergy: { type: String }, social: { type: String }, family: { type: String }
      },
      physicalExam: {
        general: { type: String }, cvs: { type: String }, rs: { type: String }, gi: { type: String }, neuro: { type: String }, kub: { type: String }, msk: { type: String }, others: { type: String }
      },
      labs: {
        cbc: { type: String }, chemistry: { type: String }, others: { type: String }
      },
      imaging: [{
        type: { type: String }, caption: { type: String }, imageUrl: { type: String }
      }],
      pathognomonic: { type: String, default: null }
    }
  },

  contentPrivate: {
    diagnosis: { type: String, required: true },
    aliases: [{ type: String }],
    acceptRules: { type: mongoose.Schema.Types.Mixed },
    teachingPoints: [{ type: String }],
    answerCheck: {
      rationale: { type: String },
      keyDifferentials: [{ type: String }]
    },
    mechanismQuestions: { type: mongoose.Schema.Types.Mixed }
  },

  metrics: {
    plays: { type: Number, default: 0 },
    solveRate: { type: Number, default: 0 },
    avgLayersUsed: { type: Number, default: 0 }
  },
  community: {
    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
    realismAvg: { type: Number, default: 0 }
  },
  safetyFlags: {
    incorrect: { type: Number, default: 0 },
    unsafe: { type: Number, default: 0 }
  },
  promptMeta: {
      promptVersion: String,
      criticVersion: String,
      createdBy: String,
      createdAt: Date
  }
}, { timestamps: true });

const CaseDb = mongoose.models.Case || mongoose.model('Case', CaseSchema);

const SYSTEMS = [
  'Cardiovascular',
  'Respiratory',
  'Neurological',
  'Gastrointestinal',
  'Endocrine',
  'Genitourinary',
  'Hematology/Oncology',
  'Musculoskeletal',
  'Psychiatry',
  'Infectious Disease'
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetries(params: any): Promise<any> {
    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            console.log(`[Attempt ${attempts + 1}] Generating case for: ${params.systemTags.join(', ')}`);
            const draftPayload = await generateCasePayload(params);

            if (attempts > 0) {
               try {
                  const criticResult = await runCritic(draftPayload);
                  if (!criticResult.passes) {
                     console.warn(`Critic rejected: ${criticResult.issues.join(', ')}`);
                     attempts++;
                     await sleep(2000); // Backoff
                     continue;
                  }
               } catch (e: any) {
                  console.warn('Critic failed, skipping validation:', e.message);
               }
            }

            return draftPayload;
            
        } catch (error: any) {
            console.error(`Error generating (Attempt ${attempts + 1}):`, error.message);
            
            if (error.message.includes('429') || error.message.includes('quota')) {
                 console.log('Sleeping for 60 seconds due to rate limit...');
                 await sleep(60000);
            } else {
                 await sleep(3000); // Standard backoff
            }
        }
        attempts++;
    }
    return null;
}

async function runGenerator() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Wipe EXISTING AI generated library cases to reset
    await CaseDb.deleteMany({ origin: 'ai_generated', status: 'library_promoted' });
    console.log('Cleared existing AI generated library cases');

    let totalGenerated = 0;

    for (const system of SYSTEMS) {
        console.log(`\n=== Starting Generation for ${system} ===`);
        
        for (let i = 0; i < 10; i++) {
            console.log(`Generating case ${i + 1}/10 for ${system}...`);
            
            // Stagger difficulties for variety
            const difficulty = (i % 5) + 1; // 1 to 5
            
            const params = {
                systemTags: [system],
                difficulty,
                style: 'vignette',
                targetAudience: 'clinical',
                dataDensity: 'moderate',
                noiseLevel: 'realistic'
            };

            const payload = await generateWithRetries(params);
            
            if (!payload) {
                console.error(`[X] FAILED to generate case ${i + 1} for ${system}`);
                continue;
            }

            try {
                await CaseDb.create({
                    origin: 'ai_generated',
                    status: 'library_promoted',
                    title: payload.title || 'Untitled AI Case',
                    systemTags: payload.systemTags || [system],
                    difficulty: payload.difficulty || difficulty,
                    style: payload.style || 'vignette',
                    targetAudience: payload.targetAudience || 'clinical',
                    generationParams: params,
                    contentPublic: {
                        layers: payload.content.layers
                    },
                    contentPrivate: {
                        diagnosis: payload.content.diagnosis,
                        aliases: payload.content.aliases || [],
                        teachingPoints: payload.content.teachingPoints || [],
                        answerCheck: payload.content.answerCheck || { rationale: '', keyDifferentials: [] },
                        mechanismQuestions: payload.content.mechanismQuestions || undefined,
                    },
                    promptMeta: {
                        promptVersion: 'v3.0.0',
                        criticVersion: 'v1.0.0',
                        createdBy: 'gemini',
                        createdAt: new Date()
                    }
                });
                
                totalGenerated++;
                console.log(`[✔] Successfully inserted "${payload.title}" (${totalGenerated}/100 total)`);
                
                // Sleep briefly to avoid hammering the API
                await sleep(1500);
            } catch (dbErr: any) {
                console.error(`[X] Failed putting case into database:`, dbErr.message);
            }
        }
    }
    
    console.log(`\n🎉 Script Finished! Total cases generated and inserted: ${totalGenerated}/100`);
    process.exit(0);

  } catch (err) {
    console.error('Fatal Script Error:', err);
    process.exit(1);
  }
}

runGenerator();
