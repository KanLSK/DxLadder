import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  origin: 'curated' | 'ai_generated' | 'user_submitted';
  status: 'draft' | 'needs_review' | 'community_approved' | 'library_promoted' | 'disabled';
  title: string;
  systemTags: string[];
  difficulty: number;
  style: 'vignette' | 'osce' | 'apk';
  targetAudience: 'preclinical' | 'clinical' | 'intern' | 'resident';
  generationParams?: Record<string, any>;

  // PUBLIC: safe to send to play endpoints (no answers)
  contentPublic: {
    layers: {
      presentationTimeline: string;
      hpi: string;
      history: {
        pmh?: string; psh?: string; meds?: string; allergy?: string; social?: string; family?: string;
      };
      physicalExam: {
        general?: string; cvs?: string; rs?: string; gi?: string; neuro?: string; kub?: string; msk?: string; others?: string;
      };
      labs: {
        cbc?: string; chemistry?: string; others?: string;
      };
      imaging: Array<{
        type: 'CXR' | 'CT' | 'MRI' | 'US' | 'ECG' | 'Other';
        caption: string;
        imageUrl?: string;
      }>;
      pathognomonic: string | null;
    };
  };

  // PRIVATE: only revealed after correct solve or author editing
  contentPrivate: {
    diagnosis: string;
    aliases: string[];
    acceptRules?: {
      requiredTokens?: string[];
      bannedTokens?: string[];
      allowAmbiguousAbbrev?: string[];
      customSynonyms?: Record<string, string[]>;
    };
    teachingPoints: string[];
    answerCheck: {
      rationale: string;
      keyDifferentials: string[];
    };
    mechanismQuestions?: {
      stepChain: Array<{
        id: string;
        prompt: string;
        options: string[];
        correctIndex: number;
        explanation: string;
        tags: string[];
      }>;
      compensation: Array<{
        id: string;
        prompt: string;
        options: string[];
        correctIndex: number;
        explanation: string;
        tags: string[];
      }>;
      traps: string[];
    };
  };

  metrics: {
    plays: number;
    solveRate: number;
    avgLayersUsed: number;
  };
  community: {
    up: number;
    down: number;
    score: number;
    totalVotes: number;
    realismAvg: number;
  };
  safetyFlags: {
    incorrect: number;
    unsafe: number;
  };
  promptMeta?: {
    promptVersion: string;
    criticVersion: string;
    createdBy: 'gemini' | 'human';
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema = new Schema({
  origin: { type: String, enum: ['curated', 'ai_generated', 'user_submitted'], required: true },
  status: { type: String, enum: ['draft', 'needs_review', 'community_approved', 'library_promoted', 'disabled'], required: true, default: 'draft' },
  title: { type: String, required: true },
  systemTags: [{ type: String }],
  difficulty: { type: Number, min: 1, max: 5, required: true },
  style: { type: String, required: true, default: 'vignette' },
  targetAudience: { type: String, required: true, default: 'clinical' },
  generationParams: { type: Schema.Types.Mixed },

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
        type: { type: String },
        caption: { type: String },
        imageUrl: { type: String }
      }],
      pathognomonic: { type: String, default: null }
    }
  },

  contentPrivate: {
    diagnosis: { type: String, required: true },
    aliases: [{ type: String }],
    acceptRules: { type: Schema.Types.Mixed },
    teachingPoints: [{ type: String }],
    answerCheck: {
      rationale: { type: String },
      keyDifferentials: [{ type: String }]
    },
    mechanismQuestions: { type: Schema.Types.Mixed }
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
    createdBy: { type: String, enum: ['gemini', 'human'] },
    createdAt: Date
  }
}, { timestamps: true });

CaseSchema.index({ status: 1, createdAt: -1 });
CaseSchema.index({ systemTags: 1, difficulty: 1 });
CaseSchema.index({ 'community.score': -1 });
CaseSchema.index({ style: 1, difficulty: 1 });

// Force re-register to pick up schema changes in dev hot-reload
if (mongoose.models.Case) {
  delete mongoose.models.Case;
}
export default mongoose.model<ICase>('Case', CaseSchema);
