import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICaseLibrary extends Document {
  finalDiagnosis: string;
  aliases: string[];
  hints: string[]; // Length 5
  teachingPoints: string[];
  systemTags: string[];
  diseaseTags: string[];
  difficulty: number;
  sourceType: 'curated' | 'community_promoted';
  createdAt: Date;
}

const CaseLibrarySchema: Schema<ICaseLibrary> = new Schema(
  {
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
    sourceType: {
      type: String,
      required: true,
      enum: ['curated', 'community_promoted'],
      default: 'curated',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CaseLibrarySchema.index({ systemTags: 1 });
CaseLibrarySchema.index({ difficulty: 1 });
CaseLibrarySchema.index({ diseaseTags: 1 });

const CaseLibrary: Model<ICaseLibrary> =
  mongoose.models.CaseLibrary ||
  mongoose.model<ICaseLibrary>('CaseLibrary', CaseLibrarySchema, 'casesLibrary');

export default CaseLibrary;
