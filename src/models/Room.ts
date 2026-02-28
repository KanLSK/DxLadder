import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  roomKey: string;
  status: 'lobby' | 'generating' | 'in_match' | 'ended';
  hostKey: string;
  settings: {
    generationParams: {
      systemTags: string[];
      difficulty: number;
      style: string;
      targetAudience: string;
      noiseLevel: string;
      redHerring: string;
      timeline: string;
      dataDensity: string;
    };
    mode: 'race' | 'efficiency' | 'hybrid';
    sabotage: 'off' | 'light' | 'normal';
  };
  players: Array<{
    playerKey: string;
    name: string;
    ready: boolean;
    connected: boolean;
    joinedAt: Date;
  }>;
  currentMatchId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  roomKey: { type: String, required: true, unique: true, index: true },
  status: {
    type: String,
    enum: ['lobby', 'generating', 'in_match', 'ended'],
    default: 'lobby',
    required: true,
  },
  hostKey: { type: String, required: true },
  settings: {
    generationParams: {
      systemTags: { type: [String], default: ['Random'] },
      difficulty: { type: Number, default: 3, min: 1, max: 5 },
      style: { type: String, default: 'apk' },
      targetAudience: { type: String, default: 'clinical' },
      noiseLevel: { type: String, default: 'realistic' },
      redHerring: { type: String, default: 'mild' },
      timeline: { type: String, default: 'acute' },
      dataDensity: { type: String, default: 'moderate' },
    },
    mode: { type: String, enum: ['race', 'efficiency', 'hybrid'], default: 'race' },
    sabotage: { type: String, enum: ['off', 'light', 'normal'], default: 'off' },
  },
  players: [{
    playerKey: { type: String, required: true },
    name: { type: String, required: true },
    ready: { type: Boolean, default: false },
    connected: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
  }],
  currentMatchId: { type: Schema.Types.ObjectId, ref: 'Match' },
}, { timestamps: { createdAt: true, updatedAt: false } });

// TTL: auto-cleanup rooms after 24h
RoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema, 'rooms');

export default Room;
