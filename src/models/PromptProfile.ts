import mongoose, { Schema, Document } from 'mongoose';

export interface IPromptProfile extends Document {
  promptVersion: string;
  style: 'vignette' | 'osce' | 'apk';
  difficultyBand: '1-2' | '3-4' | '5';
  templateText: string;
  criticText: string;
  weights: {
    noiseLevel: number;
    redHerring: number;
    dataDensity: number;
    lengthTarget: number;
  };
  performance: {
    avgRealism: number;
    approvalRate: number;
    contradictionRate: number; // critic fail count
  };
  active: boolean;
  createdAt: Date;
}

const PromptProfileSchema: Schema = new Schema({
  promptVersion: { type: String, required: true, unique: true },
  style: { type: String, enum: ['vignette', 'osce', 'apk'], required: true },
  difficultyBand: { type: String, enum: ['1-2', '3-4', '5'], required: true },
  templateText: { type: String, required: true },
  criticText: { type: String, required: true },
  weights: {
    noiseLevel: { type: Number, default: 0.5 },
    redHerring: { type: Number, default: 0.2 },
    dataDensity: { type: Number, default: 0.5 },
    lengthTarget: { type: Number, default: 100 } // relative word count target or similar metric
  },
  performance: {
    avgRealism: { type: Number, default: 0 },
    approvalRate: { type: Number, default: 0 },
    contradictionRate: { type: Number, default: 0 }
  },
  active: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.PromptProfile || mongoose.model<IPromptProfile>('PromptProfile', PromptProfileSchema);
