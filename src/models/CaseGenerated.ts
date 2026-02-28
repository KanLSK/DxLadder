import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICaseGenerated extends Document {
  payload: {
    finalDiagnosis: string;
    aliases: string[];
    hints: string[]; // length 5
    teachingPoints: string[];
    systemTags: string[];
    diseaseTags: string[];
    difficulty: number;
    answerCheck: string;
  };
  status: 'active' | 'disabled' | 'promoted';
  voteStats: {
    up: number;
    down: number;
    total: number;
    upvoteRatio: number;
  };
  reportStats: {
    unsafe: number;
  };
  createdAt: Date;
}

const CaseGeneratedSchema: Schema<ICaseGenerated> = new Schema(
  {
    payload: {
      finalDiagnosis: { type: String, required: true },
      aliases: { type: [String], default: [] },
      hints: {
        type: [String],
        required: true,
        validate: [
          (val: string[]) => val.length === 5,
          '{PATH} must have exactly 5 elements',
        ],
      },
      teachingPoints: { type: [String], default: [] },
      systemTags: { type: [String], default: [] },
      diseaseTags: { type: [String], default: [] },
      difficulty: { type: Number, required: true, min: 1, max: 5 },
      answerCheck: { type: String, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'disabled', 'promoted'],
      default: 'active',
    },
    voteStats: {
      up: { type: Number, default: 0 },
      down: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      upvoteRatio: { type: Number, default: 0 },
    },
    reportStats: {
      unsafe: { type: Number, default: 0 },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CaseGeneratedSchema.index({ status: 1 });
CaseGeneratedSchema.index({ createdAt: -1 });

const CaseGenerated: Model<ICaseGenerated> =
  mongoose.models.CaseGenerated ||
  mongoose.model<ICaseGenerated>('CaseGenerated', CaseGeneratedSchema, 'casesGenerated');

export default CaseGenerated;
