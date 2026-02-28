import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGameRoomPlayer {
  userId: string;
  name: string;
  teamId?: string;
  ready: boolean;
  connected: boolean;
  joinedAt: Date;
  lastSeenAt: Date;
  sessionToken: string;
}

export interface IGameRoom extends Document {
  roomKey: string;
  type: 'friend';
  hostId: string;
  status: 'lobby' | 'generating' | 'countdown' | 'active' | 'ended';
  settings: {
    teamSize: 1 | 2 | 4;
    difficulty: number;
    style: string;
    mode: 'duel' | 'economy' | 'chaos';
    sabotage: 'off' | 'light' | 'normal';
    generationParams?: {
      systemTags?: string[];
      targetAudience?: string;
      noiseLevel?: string;
      redHerring?: string;
      timeline?: string;
      dataDensity?: string;
    };
  };
  players: IGameRoomPlayer[];
  currentMatchId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GameRoomSchema = new Schema<IGameRoom>({
  roomKey: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['friend'], default: 'friend' },
  hostId: { type: String, required: true },
  status: {
    type: String,
    enum: ['lobby', 'generating', 'countdown', 'active', 'ended'],
    default: 'lobby',
  },
  settings: {
    teamSize: { type: Number, enum: [1, 2, 4], default: 1 },
    difficulty: { type: Number, min: 1, max: 5, default: 3 },
    style: { type: String, default: 'vignette' },
    mode: { type: String, enum: ['duel', 'economy', 'chaos'], default: 'duel' },
    sabotage: { type: String, enum: ['off', 'light', 'normal'], default: 'off' },
    generationParams: { type: Schema.Types.Mixed },
  },
  players: [{
    userId: { type: String, required: true },
    name: { type: String, required: true },
    teamId: { type: String },
    ready: { type: Boolean, default: false },
    connected: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    sessionToken: { type: String, required: true },
  }],
  currentMatchId: { type: Schema.Types.ObjectId, ref: 'GameMatch' },
}, { timestamps: { createdAt: true, updatedAt: false } });

// TTL: auto-remove abandoned rooms after 24h
GameRoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const GameRoom: Model<IGameRoom> =
  mongoose.models.GameRoom || mongoose.model<IGameRoom>('GameRoom', GameRoomSchema, 'gameRooms');

export default GameRoom;
