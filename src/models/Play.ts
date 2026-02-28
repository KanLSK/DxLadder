import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlay extends Document {
  caseId: mongoose.Types.ObjectId;
  userKey?: string; // Optional user identifier to track history per user
  attempts: number;
  solved: boolean;
  layersUnlocked: number;
  guesses: string[];
  createdAt: Date;
}

const PlaySchema: Schema<IPlay> = new Schema(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Case', 
    },
    userKey: { type: String },
    attempts: { type: Number, default: 0 },
    solved: { type: Boolean, default: false },
    layersUnlocked: { type: Number, default: 1 },
    guesses: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Play: Model<IPlay> =
  mongoose.models.Play || mongoose.model<IPlay>('Play', PlaySchema, 'plays');

export default Play;
