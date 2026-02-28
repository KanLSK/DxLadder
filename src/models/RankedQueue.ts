import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRankedQueue extends Document {
  userId: string;
  rating: number;
  joinedAt: Date;
  status: 'waiting' | 'matched';
  matchedWith?: string;
  matchId?: mongoose.Types.ObjectId;
}

const RankedQueueSchema = new Schema<IRankedQueue>({
  userId: { type: String, required: true, unique: true, index: true },
  rating: { type: Number, required: true },
  joinedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['waiting', 'matched'], default: 'waiting' },
  matchedWith: { type: String },
  matchId: { type: Schema.Types.ObjectId, ref: 'GameMatch' },
});

// TTL: auto-remove stale queue entries after 5 minutes
RankedQueueSchema.index({ joinedAt: 1 }, { expireAfterSeconds: 300 });
// For matchmaking queries: find waiting players nearby in rating
RankedQueueSchema.index({ status: 1, rating: 1 });

const RankedQueue: Model<IRankedQueue> =
  mongoose.models.RankedQueue || mongoose.model<IRankedQueue>('RankedQueue', RankedQueueSchema, 'rankedQueue');

export default RankedQueue;
