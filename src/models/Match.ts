import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISabotageEvent {
  type: 'FogOfWar' | 'JammedSubmit' | 'SwapFocus' | 'LockTax' | 'MechanismCheck';
  fromPlayerKey: string;
  toPlayerKey: string;
  firedAt: Date;
  duration?: number; // ms
}

export interface IMatchResult {
  playerKey: string;
  name: string;
  score: number;
  solvedAt?: Date;
  layersUsed: number;
  wrongGuesses: number;
  guesses: string[];
  sabotagesUsed: number;
  finished: boolean;
  mechanismCheck?: {
    used: boolean;
    pending: boolean;
    deadlineTs?: number;
    questionIds?: string[];
  };
}

export interface IMatch extends Document {
  roomId: mongoose.Types.ObjectId;
  status: 'generating' | 'active' | 'ended';
  matchCaseId?: mongoose.Types.ObjectId;
  startedAt?: Date;
  endedAt?: Date;
  results: IMatchResult[];
  sabotageEvents: ISabotageEvent[];
  createdAt: Date;
}

const MatchSchema = new Schema<IMatch>({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  status: {
    type: String,
    enum: ['generating', 'active', 'ended'],
    default: 'generating',
    required: true,
  },
  matchCaseId: { type: Schema.Types.ObjectId, ref: 'MatchCase' },
  startedAt: { type: Date },
  endedAt: { type: Date },
  results: [{
    playerKey: { type: String, required: true },
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    solvedAt: { type: Date },
    layersUsed: { type: Number, default: 1 },
    wrongGuesses: { type: Number, default: 0 },
    guesses: { type: [String], default: [] },
    sabotagesUsed: { type: Number, default: 0 },
    finished: { type: Boolean, default: false },
  }],
  sabotageEvents: [{
    type: { type: String, enum: ['FogOfWar', 'JammedSubmit', 'SwapFocus', 'LockTax', 'MechanismCheck'] },
    fromPlayerKey: { type: String },
    toPlayerKey: { type: String },
    firedAt: { type: Date, default: Date.now },
    duration: { type: Number },
  }],
}, { timestamps: { createdAt: true, updatedAt: false } });

const Match: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema, 'matches');

export default Match;
