import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserCaseProgress extends Document {
  userKey: string;
  caseId: mongoose.Types.ObjectId;
  solvedAt?: Date;
  masteredAt?: Date;
  mechanism: {
    attemptedAt?: Date;
    score: number;
    total: number;
    wrongIds: string[];
    completed: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserCaseProgressSchema = new Schema<IUserCaseProgress>({
  userKey: { type: String, required: true },
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  solvedAt: { type: Date },
  masteredAt: { type: Date },
  mechanism: {
    attemptedAt: { type: Date },
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    wrongIds: { type: [String], default: [] },
    completed: { type: Boolean, default: false },
  },
}, { timestamps: true });

// Unique compound index: one progress doc per user per case
UserCaseProgressSchema.index({ userKey: 1, caseId: 1 }, { unique: true });
// For progress dashboards: "show all mastered cases for user"
UserCaseProgressSchema.index({ userKey: 1, masteredAt: 1 });

const UserCaseProgress: Model<IUserCaseProgress> =
  mongoose.models.UserCaseProgress ||
  mongoose.model<IUserCaseProgress>('UserCaseProgress', UserCaseProgressSchema, 'userCaseProgress');

export default UserCaseProgress;
