import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatchCase extends Document {
  matchId: mongoose.Types.ObjectId;
  contentPublic: {
    layers: {
      presentationTimeline: string;
      hpi: string;
      history: Record<string, string>;
      physicalExam: Record<string, string>;
      labs: Record<string, string>;
      imaging: Array<{ type: string; caption: string }>;
      pathognomonic: string | null;
    };
  };
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
  generationParams: Record<string, any>;
  title: string;
  systemTags: string[];
  difficulty: number;
  style: string;
  promptMeta?: {
    promptVersion: string;
    criticVersion: string;
  };
  createdAt: Date;
  expiresAt: Date;
}

const MatchCaseSchema = new Schema<IMatchCase>({
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
  contentPublic: {
    layers: {
      presentationTimeline: { type: String },
      hpi: { type: String },
      history: { type: Schema.Types.Mixed },
      physicalExam: { type: Schema.Types.Mixed },
      labs: { type: Schema.Types.Mixed },
      imaging: [{ type: { type: String }, caption: { type: String } }],
      pathognomonic: { type: String, default: null },
    },
  },
  contentPrivate: {
    diagnosis: { type: String, required: true },
    aliases: [{ type: String }],
    acceptRules: { type: Schema.Types.Mixed },
    teachingPoints: [{ type: String }],
    answerCheck: {
      rationale: { type: String },
      keyDifferentials: [{ type: String }],
    },
    mechanismQuestions: { type: Schema.Types.Mixed },
  },
  generationParams: { type: Schema.Types.Mixed },
  title: { type: String },
  systemTags: [{ type: String }],
  difficulty: { type: Number },
  style: { type: String },
  promptMeta: {
    promptVersion: { type: String },
    criticVersion: { type: String },
  },
  expiresAt: { type: Date, required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

// TTL index — MongoDB will auto-delete documents after expiresAt
MatchCaseSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MatchCase: Model<IMatchCase> =
  mongoose.models.MatchCase || mongoose.model<IMatchCase>('MatchCase', MatchCaseSchema, 'matchCases');

export default MatchCase;
