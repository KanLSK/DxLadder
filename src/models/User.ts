import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  role: 'student' | 'resident' | 'clinician' | 'admin';
  displayName: string;
  level: string;
  stats: {
    totalSolved: number;
    currentStreak: number;
    longestStreak: number;
    lastPlayedDate?: Date;
    rank: number; // e.g. 15 for top 15%
  };
  systemMastery: Map<string, { attempted: number; solved: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student', 'resident', 'clinician', 'admin'], default: 'student' },
    displayName: { type: String, required: true },
    level: { type: String, default: 'Medical Student' },
    stats: {
      totalSolved: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastPlayedDate: { type: Date },
      rank: { type: Number, default: 100 },
    },
    systemMastery: {
      type: Map,
      of: new Schema({
        attempted: { type: Number, default: 0 },
        solved: { type: Number, default: 0 },
      }, { _id: false }),
      default: new Map(),
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema, 'users');

export default User;
