import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  caseId: mongoose.Types.ObjectId;
  voterKey: string;
  vote: 1 | -1;
  realismRating?: number;
  labels?: {
    unrealisticParts?: string[];
    obviousness?: 'too_obvious' | 'fair' | 'too_ambiguous';
    missingClues?: string;
    incorrectOrUnsafe?: boolean;
  };
  createdAt: Date;
}

const VoteSchema: Schema = new Schema({
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  voterKey: { type: String, required: true },
  vote: { type: Number, enum: [1, -1], required: true },
  realismRating: { type: Number, min: 1, max: 5 },
  labels: {
    unrealisticParts: [{ type: String, enum: ['history', 'exam', 'labs', 'imaging', 'timeline', 'diagnosis_fit'] }],
    obviousness: { type: String, enum: ['too_obvious', 'fair', 'too_ambiguous'] },
    missingClues: { type: String },
    incorrectOrUnsafe: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

// Enforce one vote per user per case
VoteSchema.index({ caseId: 1, voterKey: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
