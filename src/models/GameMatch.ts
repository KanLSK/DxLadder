import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Player result within a match ──
export interface IGameMatchPlayer {
  userId: string;
  name: string;
  teamId?: string;
  layersUsed: number;
  wrongGuesses: number;
  guesses: string[];
  solvedAt?: Date;
  score: number;
  sabotagesUsed: number;
  finished: boolean;
  lastGuessAt?: Date;
  connected: boolean;
  sessionToken: string;
}

// ── Sabotage event ──
export interface IGameSabotageEvent {
  type: 'FogOfWar' | 'JammedSubmit' | 'SwapFocus' | 'LockTax' | 'MechanismCheck';
  fromUserId: string;
  toUserId: string;
  firedAt: Date;
  duration?: number;
}

// ── Rating change record ──
export interface IRatingChange {
  userId: string;
  delta: number;
  oldRating: number;
  newRating: number;
}

// ── Breakdown for match history ──
export interface IBreakdownLine {
  label: string;
  value: number;
}

export interface IKeyEvent {
  ts: Date;
  type: string;
  desc: string;
  userId?: string;
}

export interface IMatchBreakdown {
  scoringLines: Record<string, IBreakdownLine[]>; // userId -> scoring lines
  keyEvents: IKeyEvent[];
}

// ── Main match document ──
export interface IGameMatch extends Document {
  type: 'friend' | 'ranked';
  mode: 'duel' | 'economy' | 'chaos';
  teamSize: number;
  status: 'generating' | 'countdown' | 'active' | 'resolution' | 'ended';
  roomId?: mongoose.Types.ObjectId;
  assignedParams: {
    difficulty: number;
    style: string;
    noiseLevel: string;
    redHerring: string;
    timeline: string;
  };
  players: IGameMatchPlayer[];
  matchCaseId?: mongoose.Types.ObjectId;
  startedAt?: Date;
  endedAt?: Date;
  ratingChanges: IRatingChange[];
  breakdown: IMatchBreakdown;
  sabotageEvents: IGameSabotageEvent[];
  eventSeq: number;
  createdAt: Date;
}

const GameMatchSchema = new Schema<IGameMatch>({
  type: { type: String, enum: ['friend', 'ranked'], required: true },
  mode: { type: String, enum: ['duel', 'economy', 'chaos'], default: 'duel' },
  teamSize: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['generating', 'countdown', 'active', 'resolution', 'ended'],
    default: 'generating',
  },
  roomId: { type: Schema.Types.ObjectId, ref: 'GameRoom', index: true },
  assignedParams: {
    difficulty: { type: Number },
    style: { type: String },
    noiseLevel: { type: String },
    redHerring: { type: String },
    timeline: { type: String },
  },
  players: [{
    userId: { type: String, required: true },
    name: { type: String, required: true },
    teamId: { type: String },
    layersUsed: { type: Number, default: 1 },
    wrongGuesses: { type: Number, default: 0 },
    guesses: { type: [String], default: [] },
    solvedAt: { type: Date },
    score: { type: Number, default: 0 },
    sabotagesUsed: { type: Number, default: 0 },
    finished: { type: Boolean, default: false },
    lastGuessAt: { type: Date },
    connected: { type: Boolean, default: true },
    sessionToken: { type: String, required: true },
  }],
  matchCaseId: { type: Schema.Types.ObjectId, ref: 'MatchCase' },
  startedAt: { type: Date },
  endedAt: { type: Date },
  ratingChanges: [{
    userId: { type: String },
    delta: { type: Number },
    oldRating: { type: Number },
    newRating: { type: Number },
  }],
  breakdown: {
    scoringLines: { type: Schema.Types.Mixed, default: {} },
    keyEvents: { type: [Schema.Types.Mixed], default: [] },
  },
  sabotageEvents: [{
    type: { type: String, enum: ['FogOfWar', 'JammedSubmit', 'SwapFocus', 'LockTax', 'MechanismCheck'] },
    fromUserId: { type: String },
    toUserId: { type: String },
    firedAt: { type: Date, default: Date.now },
    duration: { type: Number },
  }],
  eventSeq: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Indexes for match history queries
GameMatchSchema.index({ 'players.userId': 1, createdAt: -1 });
GameMatchSchema.index({ type: 1, createdAt: -1 });

const GameMatch: Model<IGameMatch> =
  mongoose.models.GameMatch || mongoose.model<IGameMatch>('GameMatch', GameMatchSchema, 'gameMatches');

export default GameMatch;
