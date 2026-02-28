import mongoose, { Schema, Document, Model } from 'mongoose';

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master';

export interface IRankedProfile extends Document {
  userId: string;
  alias: string; // anonymous display name
  rating: number;
  tier: RankTier;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  bestStreak: number;
  matchesPlayed: number;
  seasonId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RankedProfileSchema = new Schema<IRankedProfile>({
  userId: { type: String, required: true, unique: true, index: true },
  alias: { type: String, required: true },
  rating: { type: Number, default: 1200 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Master'], default: 'Silver' },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  winStreak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  matchesPlayed: { type: Number, default: 0 },
  seasonId: { type: String },
}, { timestamps: true });

// Leaderboard index
RankedProfileSchema.index({ rating: -1 });

const RankedProfile: Model<IRankedProfile> =
  mongoose.models.RankedProfile || mongoose.model<IRankedProfile>('RankedProfile', RankedProfileSchema, 'rankedProfiles');

export default RankedProfile;
